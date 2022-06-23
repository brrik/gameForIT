/*

TASKS

・addEventListener("click")を基本的にすべてonclick発火に変更する
・ボス戦実装


*/



//定数の定義

//必要に応じて調整がいる項目
const loopTime = 800; //モブがワープする時間間隔(ミリ秒：1000で1秒)
const enmRect = 100; //敵モブの大きさ　初期設定:100
let hitCountFirst = 3 //敵モブの体力　初期設定30
const enmBarrier = 3; //敵モブのバリア動作率　初期設定3　＝　1/3でバリア解除状態
const scrollMax = [1,7,4,8,6,5,4,4,8,4]; //各章のステージ数
const stageBG = [   //1:朝　2:昼　3:夕　　各ステージの読み込む背景画像
    [1,1,1,2,2,3,3,3], //1章
    [1,1,1,2,2,3,3], //2章
    [1,2,2,3], //3章
    [1,1,1,2,2,3,3,3], //4章
    [1,1,2,2,3,3], //5章
    [1,1,2,3,3], //6章
    [1,2,2,3], //7章
    [1,2,2,3], //8章
    [1,1,1,2,2,3,3,3], //9章
    [1,2,2,3]  //10章
];
const bossQuizAns = [  // ボス戦の答え群
    [4,1,3,1], //1
    [2,2,3,4], //2
    [1,1,3,3], //3
    [1,2,3,1], //4
    [3,2,3,3], //5
    [3,1,4,1], //6
    [2,2,3,2], //7
    [2,1,1,3], //8
    [2,2,1,3], //9
    [3,1,1,4]  //10
]



//プログラム上で扱う変数群(触らない)
let hitCount = hitCountFirst; //敵モブの現在の体力
let barrier = 0; //バリア発動フラグ
let enmPoint = {}; //雑魚敵の座標処理
let battleClear = false; //雑魚戦のクリア処理フラグ
let minorBattleInterval = 0; //モブ戦闘時のsetIntervalのID入れる用変数
let scrolls = [0,0,0,0,0,0,0,0,0,0]; //巻物の進捗フラグ系
let scrollGet = [       //巻物の取得フラグ
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0],
    [0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0]
];
let bossBtlCount = 0;
let mousePoint = [];


//画像読み込み用のバッファ　最初に読み込んでおくことで処理高速化と安定化
const imageBG = new Image();
const imageEnm = new Image();
const imageHitEnm = new Image();
const imageGrdEnm = new Image();
const imageBoss = new Image();

const imageBoxOpen = new Image();
imageBoxOpen.src = "./src/box_opened.png"

const imageBoxClose = new Image();
imageBoxClose.src = "./src/box_closed.png"

const imageCloud = new Image();
imageCloud.src = "./src/cloud.png"

const imagePlainScroll = new Image();
imagePlainScroll.src = "./src/plainScroll.png"


//音楽読み込み用のバッファ　最初に読み込んでおくことで処理高速化と安定化
const titleMusic = new Audio(""); titleMusic.loop = true;
const minorBattleMusic = new Audio(""); minorBattleMusic.loop = true;
const bossBattleMusic = new Audio(""); bossBattleMusic.loop = true;


//ゲーム画面の初期化
//複数の画面を仮想的に用意して、それをメインキャンバスにコピーすることで画面変遷を実装

//画面描画用のメインキャンバス
const canvas = document.getElementById("MainC");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth - 30;
canvas.height = window.innerHeight - 30;

//タイトル画面用キャンバス
const titleCanvas = document.createElement("canvas");
const titleCtx = titleCanvas.getContext("2d");
titleCanvas.width = canvas.width;
titleCanvas.height = canvas.height;

//巻物画面用キャンバス
const scrollCanvas = document.createElement("canvas");
const scrollCtx = scrollCanvas.getContext("2d");
scrollCanvas.width = canvas.width;
scrollCanvas.height = canvas.height;

//雑魚戦用キャンバス
const battleCanvas = document.createElement("canvas");
const btlCtx = battleCanvas.getContext("2d");
battleCanvas.width = canvas.width;
battleCanvas.height = canvas.height;

//ボス戦用キャンバス
const bossCanvas = document.createElement("canvas");
const bossCtx = bossCanvas.getContext("2d");
bossCanvas.width = canvas.width;
bossCanvas.height = canvas.height;

//一時描画用(一時的に利用するキャンバス、都度コンテンツ生成)
const tempCanvas = document.createElement("canvas");
const tempCtx = tempCanvas.getContext("2d");
tempCanvas.width = canvas.width;
tempCanvas.height = canvas.height;


//====================ここから各種汎用処理==================

//タイトル画面に戻る汎用処理
function returnTitle(){
    console.log("return title")
    remClick();
    clearInterval(minorBattleInterval);    
    ctx.drawImage(tempCanvas,0,0);
    titleCtx.drawImage(tempCanvas,0,0);
    scrollCtx.drawImage(tempCanvas,0,0);
    btlCtx.drawImage(tempCanvas,0,0);
    canvas.onclick = title();
}


//前の画面に戻る汎用処理
function backScr(beforeScr, afterScr){
    console.log("back scr");
    let bef = document.getElementById(beforeScr);
    let aft = document.getElementById(afterScr);
    bef.style.display = "none";
    aft.style.display = "block";
}


function remClick(){
    console.log("remclick")
    canvas.onclick = function(){
        console.log("onclick はありません。");
    }
}

//クリック判定がボタン位置かを判定する関数
//fillRectと同じ書き方にしてる
function hitCheck(btnX, btnY, btnW, btnH){
    console.log("hitCheck")
    let hit = (btnX <= mousePoint[0] && mousePoint[0] <= btnX + btnW)&&
              (btnY <= mousePoint[1] && mousePoint[1] <= btnY + btnH);

    if(hit){
        return true;
    }else{
        return false;
    }
}


//常時マウスの位置を取得
//onclick発火時のマウス位置取得に利用
canvas.addEventListener("mousemove", (e) => {
    let rect = e.target.getBoundingClientRect()
    let x = e.clientX - rect.left
    let y = e.clientY - rect.top
    mousePoint[0] = x;
    mousePoint[1] = y;
});

//sleep関数 ミリ秒で使う
function sleep(msec) {
    console.log("slp")
    return new Promise(function(resolve) {
  
       setTimeout(function() {resolve()}, msec);
  
    })
}




//====================ここまで各種汎用処理==================


//====================ここからタイトル画面処理==================
let StartbtnPos ={};
let scrbtnPos = {};
let bossbtnPos = {};

function title(){
    console.log("title")
    remClick();
    const titleImg = new Image();
    titleImg.src = "./src/title.PNG";
    const btnImg = new Image();
    btnImg.src = ""


    //x：定数
    //y：下から100の位置、
    //w：xと等間隔になるように
    //h：キャンバスサイズの1/10
    StartbtnPos = {
        x : 60,
        y : canvas.height-100,
        w : canvas.width/2-(60 * 2),
        h : canvas.height/10
    }

    scrbtnPos = {
        x : canvas.width /2 + 60,
        y : canvas.height -100,
        w : canvas.width/2-(60*2),
        h : canvas.height/10
    }

    bossbtnPos = {
        x : 60,
        y : canvas.height - 200,
        w : canvas.width/2-(60*2),
        h : canvas.height/10
    }

    titleImg.onload = function(){

        titleCtx.drawImage(titleImg,0,0,titleCanvas.width,titleCanvas.height);

        //本番用　ボタン素材できたら置き換え
        /*
        titleCtx.drawImage(btnImg,btnPos.x,btnPos.y,btnPos.w,btnPos.h);
        */

        //テスト用　ボタン素材できるまでは色つきのみで対応
        titleCtx.fillStyle="rgb(200,100,100)";
        titleCtx.fillRect(StartbtnPos.x, StartbtnPos.y, StartbtnPos.w, StartbtnPos.h);

        titleCtx.font = "italic bold 40px sans-serif";
        let startMsg = "進む"; //ボタンに表示するメッセージ
        titleCtx.fillStyle = "rgb(100,0,0)";
        let fontWidth = titleCtx.measureText(startMsg).width;
        titleCtx.fillText(startMsg, StartbtnPos.x + (StartbtnPos.w - fontWidth ) / 2, StartbtnPos.y + (StartbtnPos.h/2)+10);



        titleCtx.fillStyle="rgb(100,200,100)";
        titleCtx.fillRect(scrbtnPos.x, scrbtnPos.y, scrbtnPos.w, scrbtnPos.h);

        titleCtx.font = "italic bold 40px sans-serif";
        let scrMsg = "巻物を見る"; //ボタンに表示するメッセージ
        titleCtx.fillStyle = "rgb(0,100,0)";
        fontWidth = titleCtx.measureText(scrMsg).width;
        titleCtx.fillText(scrMsg, scrbtnPos.x + (scrbtnPos.w - fontWidth) / 2, scrbtnPos.y + (scrbtnPos.h/2)+10);


        titleCtx.fillStyle="rgb(100,100,200)";
        titleCtx.fillRect(bossbtnPos.x, bossbtnPos.y, bossbtnPos.w, bossbtnPos.h);

        titleCtx.font = "italic bold 40px sans-serif";
        let bossMsg = "ボス戦に挑む"; //ボタンに表示するメッセージ
        titleCtx.fillStyle = "rgb(0,0,100)";
        fontWidth = titleCtx.measureText(scrMsg).width;
        titleCtx.fillText(bossMsg, bossbtnPos.x + (bossbtnPos.w - fontWidth) / 2, bossbtnPos.y + (bossbtnPos.h/2)+10);


        ctx.drawImage(titleCanvas,0,0);
        

        canvas.onclick = function(){
            console.log(mousePoint);
            console.log("clicked")
        
            let startHit = hitCheck(StartbtnPos.x, StartbtnPos.y, StartbtnPos.w, StartbtnPos.h);
            let scrHit = hitCheck(scrbtnPos.x, scrbtnPos.y, scrbtnPos.w, scrbtnPos.h);
            let bossHit = hitCheck(bossbtnPos.x, bossbtnPos.y, bossbtnPos.w, bossbtnPos.h);
        
            if(startHit){
                console.log("Go to minor Battle");
                walk();
                //encountEnm();
            }else if(scrHit){
                console.log("go to showScroll")
                showScroll();
            }else if(bossHit){
                console.log("go to bossHit")
                bossHitCheck();
            }
        };
    };
};

//====================ここまでタイトル画面処理==================


//====================ここから雑魚戦時の処理====================


//歩く時の揺れる処理
function walk(){
    console.log("walk");
    remClick();
    let cpt = 0;
    let stg = 0;
    let stgBg = 0;
    for(i=0;i<scrolls.length-1;i++){
        if(scrolls[i]<scrollMax[i]){
            cpt = i;
            stg = scrolls[i];
            stgBg = stageBG[cpt][stg];

            if(stgBg == 1){
                imageBG.src = "./src/bg_morn.PNG";
            }else if(stgBg == 2){
                imageBG.src = "./src/bg_day.PNG";
            }else{
                imageBG.src = "./src/bg_aftnoon.PNG";
            }

            imageEnm.src = "./src/mons" + (cpt + 1) + ".PNG";
            imageHitEnm.src = "./src/mons" + (cpt + 1) + "_atk.PNG";
            imageGrdEnm.src = "./src/mons" + (cpt + 1) + "_grd.PNG";
            

            break;
        }
    }

    imageBG.onload = function(){
        console.log("walking.....")

        //起動時の画面読み込み処理
        btlCtx.fillStyle = "rgb(0,0,0)";
        btlCtx.fillRect(0,0,battleCanvas.width,battleCanvas.height);

        //バトルスタートの表示
        btlCtx.fillStyle = "rgb(255,255,255)";
        btlCtx.font = "italic bold 100px sans-serif";
        let btlMsg = "Battle Start!!"
        let fontWidth = btlCtx.measureText(btlMsg).width;
        btlCtx.fillText(btlMsg,(battleCanvas.width - fontWidth)/2, battleCanvas.height/2);
        ctx.drawImage(battleCanvas,0,0)



        //バトルスタートをX秒間表示し、バトルへ
        setTimeout(() => {

            btlCtx.drawImage(imageBG,0,0,canvas.width,canvas.height);

            //揺れる回数を決定
            let times = Math.floor(Math.random() * 3)+1;
            console.log("times : "+times);
            btlCtx.drawImage(imageBG,0,0,canvas.width,canvas.height)
            let thisTime = 0



            let allWalk = setInterval(() => {
                
                let yStart = 0;
                let yEnd = 50
                let walkDown = setInterval(function(){
                    //沈み込む処理
                    console.log("btlCtx y: "+yStart);

                    ctx.fillStyle = "rgb(0,0,0)";
                    ctx.fillRect(0,0,canvas.width,canvas.height);
                    ctx.drawImage(battleCanvas,0,yStart);
                    yStart++;


                    if(yStart >= yEnd){
                        //立ち上がる処理
                        clearInterval(walkDown);
                        let walkUp = setInterval(function(){
                            console.log("btlCtx y: "+yStart);

                            ctx.fillStyle = "rgb(0,0,0)";
                            ctx.fillRect(0,0,canvas.width,canvas.height);
                            ctx.drawImage(battleCanvas,0,yStart);
                            yStart--;


                            if(yStart <= 0){
                                //X秒経過後、インターバル解除
                                clearInterval(walkUp);
                                thisTime++;
                            };
                        },5)
                        
                    };
                },5)
                if(thisTime>=times){
                    //規定回数超えたら次の処理へ
                    clearInterval(allWalk);
                    setTimeout(() => {
                        //一応最後の立ち上がりを待つために1秒保留
                        btlCtx.drawImage(imageBG,0,0,canvas.width,canvas.height)
                        encountEnm();
                    }, 1000);
                }
            }, 1000);
        }, (1000));
    };
}


//雲から敵が現れる処理
async function encountEnm(){
    console.log("enc enm")
    let imgMax = 0
    if(canvas.height > canvas.width){
        imgMax = Math.floor(canvas.width/4);
    }else{
        imgMax = Math.floor(canvas.height/4);
    }

    const waitSec = 5;

    let clPosSet = [];
    let clPosOne = Math.floor(imgMax/3);
    for(i=1;i<=3;i++){
        console.log(i);
        clPosSet.push(clPosOne * i);
    };
    console.log("clposset is...");
    console.log(clPosSet);
    console.log("----------------")


    let imgSize = 100;
    let posX = (canvas.width/2)-(imgSize/2)
    let posY = (canvas.height/2)-(imgSize/2)

    let bln = 0;

    for(i=0;i<=imgMax;i++){

        if(i==clPosSet[0] && bln==0){
            console.log("clpos 0 : " + clPosSet[0])
            bln++;
            for(j=0;j<50;j++){
                imgSize--;
                posX = (canvas.width/2)-(imgSize/2)
                posY = (canvas.height/2)-(imgSize/2)

                drawBG(battleCanvas);
                btlCtx.drawImage(imageCloud,posX,posY,imgSize,imgSize);
                ctx.drawImage(battleCanvas,0,0,canvas.width,canvas.height);
                await sleep(waitSec);
            }
        }else if(i==clPosSet[1] && bln==1){
            console.log("clpos 1 : " + clPosSet[1])
            bln++;
            for(j=0;j<50;j++){
                imgSize--;
                posX = (canvas.width/2)-(imgSize/2)
                posY = (canvas.height/2)-(imgSize/2)
        
                drawBG(battleCanvas);
                btlCtx.drawImage(imageCloud,posX,posY,imgSize,imgSize);
                ctx.drawImage(battleCanvas,0,0);
                await sleep(waitSec);
            }
        }else if(i==clPosSet[2] && bln==2){
            console.log("clpos 2 : " + clPosSet[2])
            bln++
            for(j=0;j<50;j++){
                imgSize--;
                posX = (canvas.width/2)-(imgSize/2)
                posY = (canvas.height/2)-(imgSize/2)
        
                drawBG(battleCanvas);
                btlCtx.drawImage(imageCloud,posX,posY,imgSize,imgSize);
                ctx.drawImage(battleCanvas,0,0);
                await sleep(waitSec);
            }
        }else{
            imgSize +=2;
        }
        posX = (canvas.width/2)-(imgSize/2)
        posY = (canvas.height/2)-(imgSize/2)

        drawBG(battleCanvas);
        btlCtx.drawImage(imageCloud,posX,posY,imgSize,imgSize);
        ctx.drawImage(battleCanvas,0,0);
        await sleep(waitSec);
    };



    for(i=10;i>=0;i--){
        console.log("alpha = "+i)
        ctx.globalAlpha = i * 0.1;
        drawBG(canvas);
        ctx.drawImage(imageEnm,(battleCanvas.width/2)-(enmRect/2),(battleCanvas.height/2)-(enmRect/2),enmRect,enmRect);
        ctx.drawImage(battleCanvas,0,0);
        await sleep(10);
    }
    ctx.globalAlpha=1;

    for(i=0;i<=4;i++){

        if(i%2==0){
            drawBG(battleCanvas)
            btlCtx.drawImage(imageEnm,(battleCanvas.width/2)-(enmRect/2)-10,(battleCanvas.height/2)-(enmRect/2),enmRect,enmRect);
        }else{
            drawBG(battleCanvas)
            btlCtx.drawImage(imageEnm,(battleCanvas.width/2)-(enmRect/2)+10,(battleCanvas.height/2)-(enmRect/2),enmRect,enmRect);   
        }
        ctx.drawImage(battleCanvas,0,0);
        await sleep(100);
    }

    //念のため1秒待つ
    await sleep(1000);

    minorBattle();
}


function minorBattle(){
    console.log("minor btl")
    remClick();

    minorBattleMusic.play();
    


    //一定時間ごとに繰り返す処理
    function mainProc(){
        remClick();
        canvas.onclick = checkClickEnm;
        drawBG(battleCanvas);
        hpSet();
        enmPoint = drawEnm(battleCanvas);
        ctx.drawImage(battleCanvas,0,0);
        console.log(battleClear);
    }

    //敵画像の処理
    function drawEnm(battleCanvas){
        console.log("***Draw Enemy***");

        barrier = Math.floor(Math.random() * enmBarrier);

        let enmX = Math.floor(Math.random() * (canvas.width - enmRect));
        let enmY = Math.floor(Math.random() * (canvas.height - enmRect - 80)) + 80;

        const btlCtx = battleCanvas.getContext("2d");

        if(barrier > 1){
            drawBG(battleCanvas);
            btlCtx.drawImage(imageGrdEnm, enmX, enmY, enmRect, enmRect)
        }

        btlCtx.drawImage(imageEnm, enmX, enmY, enmRect, enmRect);
        hpSet()
        const enmPath = {
            x : enmX,
            y : enmY,
            w : enmRect,
            h : enmRect  
        };
        console.log("battleCanvas h:" + battleCanvas.height + " / battleCanvas w:" + battleCanvas.width);
        console.log(enmPath);
        return enmPath;
    }


    //モブの一定間隔ジャンプ処理
    minorBattleInterval = setInterval(mainProc,loopTime);
    console.log("インターバル変数");
    console.log(minorBattleInterval);
}

//クリック時の判定を追加
async function checkClickEnm(){
    console.log("checkClickEnm");

    let hit = hitCheck(enmPoint.x,enmPoint.y,enmPoint.w,enmPoint.h);
    console.log(hit)



    if(hit){
        if(barrier <= 1){
            drawBG(battleCanvas);
            btlCtx.drawImage(imageHitEnm, enmPoint.x, enmPoint.y, enmRect, enmRect);
            ctx.drawImage(battleCanvas,0,0);
            hpSet();
            ctx.fillStyle="red";
            ctx.font = '48px serif';
            ctx.fillText("HIT!!", enmPoint.x, enmPoint.y);
            remClick();


            console.log("HIT! Hit count is " + hitCount);
        
            hitCount = hitCount -3;
            if(hitCount<=0){
                clearInterval(minorBattleInterval);
                remClick();

                //つぶれる処理
                for(i=0;i<enmRect;i++){
                    drawBG(battleCanvas);
                    btlCtx.drawImage(imageEnm,enmPoint.x,enmPoint.y + i, enmRect, enmRect - i);
                    ctx.drawImage(battleCanvas,0,0);
                    await sleep(10)
                }

                hitCount = hitCountFirst;
                await sleep(1000)
                openScroll();
            };
            /*
            drawBG(battleCanvas);
            enmPoint = drawEnm(battleCanvas);
            ctx.drawImage(battleCanvas,0,0);
            */
        }else{
            hpSet();
            ctx.fillStyle="yellow";
            ctx.font = '48px serif';
            ctx.fillText('Blocked!', enmPoint.x, enmPoint.y);
            console.log("Barriered!!");

        }
    }else{
        hpSet();
        ctx.fillStyle="blue";
        ctx.font = '48px serif';
        ctx.fillText('MISS!!', enmPoint.x, enmPoint.y);
        console.log("Miss");
    };
    console.log("in event listener  x: " + mousePoint[0] + "/ y: " + mousePoint[1]);

};

function hpSet(){
    console.log("hp set");
    btlCtx.fillStyle = "rgb(200,50,0)"
    btlCtx.fillRect(50,50,canvas.width-100,10);

    let oneHP = (canvas.width-100)/hitCountFirst;
    
    btlCtx.fillStyle = "rgb(0,50,200)";
    if(hitCount<0){
        hitCount=0;
    };
    btlCtx.fillRect(50,50,oneHP*hitCount,10);
    ctx.drawImage(battleCanvas,0,0);
}

//===================ここまで雑魚戦時の処理====================


//===================ここからボス戦時の処理====================
function bossHitCheck(){
    console.log("bossHitCheck")
    remClick();
    let scrLen = scrolls.length-1;
    let bossHitIndex = 0;

    ctx.fillStyle="rgb(0,0,0)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    for(i=0;i<=scrLen;i++){
        if(scrolls[i]==scrollMax[i]){
            bossHitIndex = i + 1;
        }
    }

    if(bossHitIndex>0){
        bossMain();
    }else{
        ctx.fillStyle = "rgb(255,255,255)";
        ctx.font = "50px sans-selif";
        let msg = "挑めるボスはいないようだ・・・"; //ボタンに表示するメッセージ
        let fontWidth = ctx.measureText(msg).width;
        ctx.fillText(msg,(canvas.width - fontWidth) / 2, (canvas.height/2)+10);
        canvas.onclick = returnTitle;
    }


}



function bossMain(){
    console.log("come to bossMain");
    bossCtx.clearRect(0, 0, canvas.width, canvas.height);
    remClick();
    //returnTitle();
    let scrLen = scrolls.length-1;
    let bossIndex = 0;
    let choice = 0;
    let qNum = 1;

    for(i=0;i<=scrLen;i++){
        if(scrolls[i]==scrollMax[i]){
            bossIndex = i;
        }
        console.log(i);
    }

    imageEnm.src = "src/boss" + (bossIndex + 1) + ".PNG"
    imageBG.src = "./src/bg_night.PNG"
    imageBG.onload = function(){
        
        drawBG(bossCanvas);

        bossCtx.drawImage(imageEnm,canvas.width/4,canvas.height/4,canvas.width/2,canvas.height/2);

        bossCtx.fillStyle="rgb(100,100,200)";
        bossCtx.fillRect(10,10,canvas.width-20,100);

        bossCtx.fillStyle = "rgb(0,0,0)";
        bossCtx.font = "italic bold 30px sans-serif";
        let msg = "よく来たな・・・この問題が解けるか！？"
        let fontWidth = bossCtx.measureText(msg).width;
        bossCtx.fillText(msg,(canvas.width-fontWidth)/2,150);

        ctx.drawImage(bossCanvas,0,0);
        let bossCheckInterval = setInterval(function(){
            console.log("int")
            canvas.onclick = function(){
                clearInterval(bossCheckInterval);
                console.log("hoge");
                remClick();
                imageEnm.src = "./boss/cpt" + (bossIndex+1) + "/q" + qNum + ".png";

                imageEnm.onload = function(){
                    bossCtx.drawImage(imageEnm,0,0,canvas.width,canvas.height);
                    let choiceList = [ //[x座標始点, y座標始点, x座標終点, y座標終点]
                                        [20,                  canvas.height/2 + 10,     canvas.width/2 -40, canvas.height/4 - 20], //選択肢1
                                        [canvas.width/2 + 10, canvas.height/2 + 10,     canvas.width/2 -40, canvas.height/4 - 20], //選択肢2
                                        [20,                  canvas.height/4 * 3 + 10, canvas.width/2 -40, canvas.height/4 - 20], //選択肢3
                                        [canvas.width/2 + 10, canvas.height/4 * 3 + 10, canvas.width/2 -40, canvas.height/4 - 20]  //選択肢4
                                    ];
                    bossCtx.fillStyle = "rgb(0,0,0)";
                    bossCtx.fillRect(choiceList[0][0],choiceList[0][1],choiceList[0][2],choiceList[0][3]);
                    bossCtx.fillRect(choiceList[1][0],choiceList[1][1],choiceList[1][2],choiceList[1][3]);
                    bossCtx.fillRect(choiceList[2][0],choiceList[2][1],choiceList[2][2],choiceList[2][3]);
                    bossCtx.fillRect(choiceList[3][0],choiceList[3][1],choiceList[3][2],choiceList[3][3]);
                    ctx.drawImage(bossCanvas,0,0);
                    
                    let waitChoice = setInterval(function(){
                        console.log("wait");
                        canvas.onclick = function(){;
                            let hit1 = hitCheck(choiceList[0][0],choiceList[0][1],choiceList[0][2],choiceList[0][3]);
                            let hit2 = hitCheck(choiceList[1][0],choiceList[1][1],choiceList[1][2],choiceList[1][3]);
                            let hit3 = hitCheck(choiceList[2][0],choiceList[2][1],choiceList[2][2],choiceList[2][3]);
                            let hit4 = hitCheck(choiceList[3][0],choiceList[3][1],choiceList[3][2],choiceList[3][3]);

                            if(hit1 || hit2 || hit3 || hit4){
                                remClick();
                                if(hit1){
                                    console.log("Selected choice 1");
                                    choice = 1;
                                }else if(hit2){
                                    console.log("Selected choice 2");
                                    choice = 2;
                                }else if(hit3){
                                    console.log("Selected choice 3");
                                    choice = 3;
                                }else if(hit4){
                                    console.log("Selected choise 4");
                                    choice = 4
                                }
                                
                                if(choice == bossQuizAns[bossIndex][qNum]){
                                    console.log("seikai");
                                    clearInterval(waitChoice);
                                    returnTitle();
                                }else{
                                    console.log("huseikai");
                                    clearInterval(waitChoice);
                                    returnTitle();
                                };
                            };
                        };
                    },33);
                };
            };
        },33)
    }
}

//===================ここまでボス戦時の処理====================


//===================ここから背景の処理====================
    function drawBG(thisCanv){
        console.log("***Draw Back Ground***");
        let thisCTX = thisCanv.getContext("2d")
        thisCTX.drawImage(imageBG, 0, 0, canvas.width, canvas.height);
    }
//===================ここまで背景の処理====================


//====================ここから巻物の処理====================

function openScroll(){
    remClick();
    console.log("Load imgBoxClose")
    drawBG(scrollCanvas);
    scrollCtx.drawImage(imageBoxClose, (canvas.width - imageBoxClose.width) / 2, (canvas.height - imageBoxClose.height) / 2);

    scrollCtx.fillStyle = "rgb(200,200,0)";
    scrollCtx.font = "italic bold 60px sans-serif";
    let msg = "宝箱ゲット！"
    let fontWidth = scrollCtx.measureText(msg).width;
    scrollCtx.fillText(msg,(canvas.width-fontWidth)/2,(canvas.height/2)-200);


    msg = "タッチして箱を開けよう！"
    scrollCtx.fillStyle = "rgb(0,100,200)";
    scrollCtx.font = "bold 40px sans-serif";
    fontWidth = scrollCtx.measureText(msg).width;
    scrollCtx.fillText(msg,(canvas.width-fontWidth)/2,(canvas.height/2)-100);

    ctx.drawImage(scrollCanvas, 0, 0);

    canvas.onclick = openBox;
}

function openBox(){
    console.log("openBox")
    remClick();
    drawBG(scrollCanvas);

    scrollCtx.fillStyle = "rgb(200,200,0)";
    scrollCtx.font = "italic bold 60px sans-serif";
    let msg = "巻物ゲット！"
    let fontWidth = scrollCtx.measureText(msg).width;
    scrollCtx.fillText(msg,(canvas.width-fontWidth)/2,(canvas.height/2)-200);


    msg = "タッチして巻物を読んでみよう！"
    scrollCtx.fillStyle = "rgb(0,100,200)";
    scrollCtx.font = "bold 40px sans-serif";
    fontWidth = scrollCtx.measureText(msg).width;
    scrollCtx.fillText(msg,(canvas.width-fontWidth)/2,(canvas.height/2)-100);

    scrollCtx.drawImage(imageBoxOpen, (canvas.width - imageBoxClose.width) / 2, (canvas.height - imageBoxClose.height) / 2);
    ctx.drawImage(scrollCanvas, 0, 0);
    canvas.onclick = scrollSet;
}


//巻物表示ギミック
function scrollSet(){
    console.log("scrSet")
    remClick();

    let chapterIndex = 0;
    let stageIndex = 0;
    let scrLen = scrolls.length-1;
    let stage = "";
    let stgClrBln = false;


    drawBG(scrollCanvas);
    scrollCtx.drawImage(imagePlainScroll,30,30,canvas.width-30, canvas.height-30);

    for(i=0;i<=scrLen;i++){
        if(scrolls[i]<scrollMax[i]){
            scrollGet[i][scrolls[i]] = 1;

            console.log(scrollGet);
            scrolls[i]++;

            if(scrolls[i]==scrollMax[i]){
                stgClrBln = true;
            }

            console.log(scrolls);
            chapterIndex = i + 1;
            stageIndex = scrolls[i];
            
            stage = chapterIndex+"-"+stageIndex;
            console.log(stage);

            let b = document.getElementById("st" + stage);
            scrollCtx.drawImage(b,30 + (imagePlainScroll.width/15),30 + (imagePlainScroll.height/15),
                                  canvas.width - 30 - ((imagePlainScroll.width/15) * 2),canvas.height - 30 - ((imagePlainScroll.height/15) * 2));

            break;
        }
    }
    ctx.drawImage(scrollCanvas,0,0);
    console.log(stgClrBln);
    console.log(scrolls);
    console.log(scrollMax);

    canvas.onclick = function(){
        if(scrolls[scrolls.length-1]==scrollMax[scrollMax.length-1]){
            alert("Game Completed!! Congrats!!");
            console.log(scrolls);
            returnTitle();
        }else if(stgClrBln){
            bossHitCheck();
        }else{
            console.log(scrolls);
            console.log("go to walk")
            walk();
        };
    };
}


//巻物関係　要抜本改編
//巻物の情報を取得するやつ
function showScroll(){
    console.log("show scr")
    remClick();
    
    imageBG.src = "./src/title.PNG"

    imageBG.onload = function(){
        drawBG(scrollCanvas);

        let pointSet = [ //[x座標始点, y座標始点, x座標横幅, y座標立幅, 表示内容]
            [10,                        10,                         canvas.width/3 - 20, canvas.height / 4 - 20, "1章"], //1
            [canvas.width / 3 + 10,     10,                         canvas.width/3 - 20, canvas.height / 4 - 20, "2章"], //2
            [canvas.width / 3 * 2 + 10, 10,                         canvas.width/3 - 20, canvas.height / 4 - 20, "3章"], //3
            [10,                        canvas.height / 4 + 10,     canvas.width/3 - 20, canvas.height / 4 - 20, "4章"], //4
            [canvas.width / 3 + 10,     canvas.height / 4 + 10,     canvas.width/3 - 20, canvas.height / 4 - 20, "5章"], //5
            [canvas.width / 3 * 2 + 10, canvas.height / 4 + 10,     canvas.width/3 - 20, canvas.height / 4 - 20, "6章"], //6
            [10,                        canvas.height / 4 * 2 + 10, canvas.width/3 - 20, canvas.height / 4 - 20, "7章"], //7
            [canvas.width / 3 + 10,     canvas.height / 4 * 2 + 10, canvas.width/3 - 20, canvas.height / 4 - 20, "8章"], //8
            [canvas.width / 3 * 2 + 10, canvas.height / 4 * 2 + 10, canvas.width/3 - 20, canvas.height / 4 - 20, "9章"], //9
            [canvas.width / 3 + 10,     canvas.height / 4 * 3 + 10, canvas.width/3 - 20, canvas.height / 4 - 20, "10章"], //10
            [canvas.width / 3 * 2 + 10, canvas.height / 4 * 3 + 10, canvas.width/3 - 20, canvas.height / 4 - 20, "戻る"]  //戻る
        ]

        for(i=0;i<pointSet.length;i++){
            console.log("set btn : " + i)
            scrollCtx.fillStyle = "rgb(100,150,200)";
            scrollCtx.fillRect(pointSet[i][0],pointSet[i][1],pointSet[i][2],pointSet[i][3]);

            scrollCtx.fillStyle = "rgb(0,0,0)";
            scrollCtx.font = "20px sans-selif";
            let chpMsg = pointSet[i][4]; //ボタンに表示するメッセージ
            let fontWidth = scrollCtx.measureText(chpMsg).width;
            scrollCtx.fillText(chpMsg, pointSet[i][0] + (pointSet[i][2]- fontWidth) / 2, pointSet[i][1] + (pointSet[i][3]/2)+10);
        }

        ctx.drawImage(scrollCanvas,0,0);

        canvas.onclick = function(){
            console.log("scr click")
            let scrhit1 = hitCheck(pointSet[0][0],pointSet[0][1],pointSet[0][2],pointSet[0][3])
            let scrhit2 = hitCheck(pointSet[1][0],pointSet[1][1],pointSet[1][2],pointSet[1][3])
            let scrhit3 = hitCheck(pointSet[2][0],pointSet[2][1],pointSet[2][2],pointSet[2][3])
            let scrhit4 = hitCheck(pointSet[3][0],pointSet[3][1],pointSet[3][2],pointSet[3][3])
            let scrhit5 = hitCheck(pointSet[4][0],pointSet[4][1],pointSet[4][2],pointSet[4][3])
            let scrhit6 = hitCheck(pointSet[5][0],pointSet[5][1],pointSet[5][2],pointSet[5][3])
            let scrhit7 = hitCheck(pointSet[6][0],pointSet[6][1],pointSet[6][2],pointSet[6][3])
            let scrhit8 = hitCheck(pointSet[7][0],pointSet[7][1],pointSet[7][2],pointSet[7][3])
            let scrhit9 = hitCheck(pointSet[8][0],pointSet[8][1],pointSet[8][2],pointSet[8][3])
            let scrhit10 = hitCheck(pointSet[9][0],pointSet[9][1],pointSet[9][2],pointSet[9][3])
            let scrhitRet = hitCheck(pointSet[10][0],pointSet[10][1],pointSet[10][2],pointSet[10][3])
            if(scrhit1){
                console.log("HIT1")
            }else if(scrhit2){
                console.log("HIT2")
            }else if(scrhit3){
                console.log("HIT3")
            }else if(scrhit4){
                console.log("HIT4")
            }else if(scrhit5){
                console.log("HIT5")
            }else if(scrhit6){
                console.log("HIT6")
            }else if(scrhit7){
                console.log("HIT7")
            }else if(scrhit8){
                console.log("HIT8")
            }else if(scrhit9){
                console.log("HIT9")
            }else if(scrhit10){
                console.log("HIT10")
            }else if(scrhitRet){
                returnTitle();
            }
        }
    }
}

/*   こっから使わない
function scrChpSelect(num){
    let scrollMain = document.getElementById("chpScroll");
    let thisScroll = document.getElementsByClassName("stageList");

    scrollMain.style.display = "none";
    thisScroll[num-1].style.display = "block";
}


function scrollOpenScreen(){
    let scrDiv = document.getElementById("chpScroll");
    let cvDiv = document.getElementById("showScreen");
    let scrDisp = scrDiv.style.display;

    if(scrDisp=="block"){
        scrDiv.style.display = "none";
        cvDiv.style.display = "block";
    }else{
        scrDiv.style.display = "block";
        cvDiv.style.display = "none";
    }

    let stList = document.getElementsByClassName("stageList");
    for(i=0;i<stList.length;i++){
        stList[i].style.display = "none";
    }
}
*/

//====================ここまで巻物の処理====================


//初回起動時のタイトル画面読み込み処理
title();
//ctx.drawImage(document.getElementById("st1-1"),0,0,canvas.width,canvas.height);


