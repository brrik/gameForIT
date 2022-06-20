/*

TASKS

・addEventListener("click")を基本的にすべてonclick発火に変更する
・ボス戦実装


*/



//定数の定義
const loopTime = 1000; //モブがワープする時間間隔(ミリ秒：1000で1秒)
const enmRect = 100; //敵モブの大きさ　初期設定100
let hitCountFirst = 30 //敵モブの体力　初期設定5
let hitCount = hitCountFirst; //敵モブの現在の体力
const enmBarrier = 3; //敵モブのバリア動作率　初期設定3　＝　1/3でバリア解除状態
let barrier = 0; //バリア発動フラグ
let enmPoint = {}; //雑魚敵の座標処理
let battleClear = false; //雑魚戦のクリア処理フラグ
let minorBattleInterval = 0; //モブ戦闘時のsetIntervalのID入れる用変数
let scrolls = [0,0,0,0,0,0,0,0,0,0]; //巻物の進捗フラグ系
const scrollMax = [8,7,4,8,6,5,4,4,8,4]
let bossBtlCount = 0;
let mousePoint = [];


//画像読み込み用のバッファ　最初に読み込んでおくことで処理高速化と安定化
const imageBG = new Image();
const imageEnm = new Image();
const imageBoxOpen = new Image();
const imageBoxClose = new Image();
const imageCloud = new Image();
const imagePlainScroll = new Image();
const imageBoss = new Image();

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

//一時描画用(一時的に利用するキャンバス、都度コンテンツ生成)
const tempCanvas = document.createElement("canvas");
const tempCtx = tempCanvas.getContext("2d");
tempCanvas.width = canvas.width;
tempCanvas.height = canvas.height;

//動作検証用キャンバス
const fillCanvas = document.createElement("canvas");
const fillCtx = fillCanvas.getContext("2d");
fillCanvas.width = canvas.width;
fillCanvas.height = canvas.height;

//minorBattle("./src/mons_A1.PNG","./src/bg_day.PNG");



//====================ここからタイトル画面処理==================
let StartbtnPos ={};
let scrbtnPos = {};
let bossbtnPos = {};

function title(){
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

    titleImg.addEventListener("load",function(){

        titleCtx.drawImage(titleImg,0,0,titleCanvas.width,titleCanvas.height);

        //本番用　ボタン素材できたら置き換え
        /*
        titleCtx.drawImage(btnImg,btnPos.x,btnPos.y,btnPos.w,btnPos.h);
        */

        //テスト用　ボタン素材できるまでは色つきのみで対応
        titleCtx.fillStyle="rgb(100,100,100)";
        titleCtx.fillRect(StartbtnPos.x, StartbtnPos.y, StartbtnPos.w, StartbtnPos.h);

        titleCtx.font = "italic bold 40px sans-serif";
        let startMsg = "START!"; //ボタンに表示するメッセージ
        titleCtx.fillStyle = "rgb(255,0,0)";
        let fontWidth = titleCtx.measureText(startMsg).width;
        titleCtx.fillText(startMsg, StartbtnPos.x + (StartbtnPos.w - fontWidth ) / 2, StartbtnPos.y + (StartbtnPos.h/2)+10);



        titleCtx.fillStyle="rgb(100,100,100)";
        titleCtx.fillRect(scrbtnPos.x, scrbtnPos.y, scrbtnPos.w, scrbtnPos.h);

        titleCtx.font = "italic bold 40px sans-serif";
        let scrMsg = "Scroll"; //ボタンに表示するメッセージ
        titleCtx.fillStyle = "rgb(255,0,0)";
        fontWidth = titleCtx.measureText(scrMsg).width;
        titleCtx.fillText(scrMsg, scrbtnPos.x + (scrbtnPos.w - fontWidth) / 2, scrbtnPos.y + (scrbtnPos.h/2)+10);



        ctx.drawImage(titleCanvas,0,0);
        

        canvas.onclick = clickCheckTitle;
    });
};

function clickCheckTitle(){
    console.log(mousePoint);
    console.log("clicked")

    let hit = hitCheck(StartbtnPos.x, StartbtnPos.y, StartbtnPos.w, StartbtnPos.h);
    console.log(StartbtnPos);
    if(hit){
        console.log("Go to minor Battle");
        walk();
        //encountEnm();
    }
    
};
//====================ここまでタイトル画面処理==================


//====================ここから雑魚戦時の処理====================


//歩く時の揺れる処理
function walk(){
    remClick();

    console.log("walking.....")
    //canvas.removeEventListener("click",clickCheckTitle);

    //起動時の画面読み込み処理
    btlCtx.fillStyle = "rgb(0,0,0)";
    btlCtx.fillRect(0,0,battleCanvas.width,battleCanvas.height);
    btlCtx.fillStyle = "rgb(255,255,255)";

    //バトルスタートの表示
    btlCtx.font = "italic bold 100px sans-serif";
    let btlMsg = "Battle Start!!"
    let fontWidth = btlCtx.measureText(btlMsg).width;
    btlCtx.fillText(btlMsg,(battleCanvas.width - fontWidth)/2, battleCanvas.height/2);
    ctx.drawImage(battleCanvas,0,0)

    imageBG.src = "./src/bg_day.PNG"

    //バトルスタートをX秒間表示し、バトルへ
    setTimeout(() => {

        btlCtx.drawImage(imageBG,0,0,battleCanvas.width,battleCanvas.height);

        //揺れる回数を決定
        let times = Math.floor(Math.random() * 3)+1;
        console.log("times : "+times);
        btlCtx.drawImage(imageBG,0,0,battleCanvas.width,battleCanvas.height)
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
                    encountEnm();
                }, 1000);
            }
        }, 1000);
    }, (2000));
}


//雲から敵が現れる処理
async function encountEnm(){
    imageCloud.src = "./src/cloud.png"
    let imgMax = 0
    if(canvas.height > canvas.width){
        imgMax = Math.floor(canvas.width/4);
    }else{
        imgMax = Math.floor(canvas.height/4);
    }

    imageBG.src = "./src/bg_day.PNG"

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
                ctx.drawImage(battleCanvas,0,0);
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
        imageEnm.src = "./src/mons_A1.PNG"
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

    minorBattle("./src/mons_A1.PNG","./src/bg_day.PNG");
}


function minorBattle(enmSrc, bgSrc){
    remClick();

    imageEnm.src = enmSrc;
    imageBG.src = bgSrc;

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

        let enmX = Math.floor(Math.random() * (battleCanvas.width - enmRect));
        let enmY = Math.floor(Math.random() * (battleCanvas.height - enmRect));

        const btlCtx = battleCanvas.getContext("2d");

        if(barrier > 1){
            btlCtx.fillStyle = "rgb(100,100,255)";
            btlCtx.fillRect(enmX-10, enmY-10, enmRect+20, enmRect+20);
        }

        btlCtx.drawImage(imageEnm, enmX, enmY, enmRect, enmRect);

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
    console.log("***********インターバル変数");
    console.log(minorBattleInterval);
}

//クリック時の判定を追加
async function checkClickEnm(){

    let hit = hitCheck(enmPoint.x,enmPoint.y,enmPoint.w,enmPoint.h);
    console.log(hit)



    if(hit){
        if(barrier <= 1){
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
            ctx.fillStyle="yellow";
            ctx.font = '48px serif';
            ctx.fillText('Blocked!', enmPoint.x, enmPoint.y);
            console.log("Barriered!!");

        }
    }else{
        ctx.fillStyle="blue";
        ctx.font = '48px serif';
        ctx.fillText('MISS!!', enmPoint.x, enmPoint.y);
        console.log("Miss");
    };
    console.log("in event listener  x: " + mousePoint[0] + "/ y: " + mousePoint[1]);

};

function hpSet(){
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
function bossMain(){
    drawBG(battleCanvas);
    imageEnm.src = ".src/boss.png"
    bossBtlCount ++;
    imageEnm.addEventListener("load",function(){
        btlCtx.drawImage(imageEnm,canvas.width/2,20,50,50);

        canvas.onclick = checkSelect;


    async function checkSelect(){
        let choiceList = [ //[x座標始点, y座標始点, x座標終点, y座標終点]
            [10,                  canvas.height/2 + 10,     canvas.width/2 -10, canvas.height/4 - 10], //選択肢1
            [canvas.width/2 + 10, canvas.height/2 + 10,     canvas.width/2 -10,    canvas.height/4 - 10], //選択肢2
            [10,                  canvas.height/4 * 3 + 10, canvas.width/2 -10, canvas.height/4 -10], //選択肢3
            [canvas.width/2 + 10, canvas.heithg/4 * 3 + 10, canvas.width/2 -10,    canvas.height/4 -10]
        ];
        btlCtx.fillStyle = "rgb(0,0,0)";
        btlCtx.fillRect(choiceList[0][0],choiceList[0][1],choiceList[0][2],choiceList[0][3]);
        btlCtx.fillRect(choiceList[1][0],choiceList[1][1],choiceList[1][2],choiceList[1][3]);
        btlCtx.fillRect(choiceList[2][0],choiceList[2][1],choiceList[2][2],choiceList[2][3]);
        btlCtx.fillRect(choiceList[3][0],choiceList[3][1],choiceList[3][2],choiceList[3][3]);

        let hit1 = hitCheck(choiceList[0][0],choiceList[0][1],choiceList[0][2],choiceList[0][3]);
        let hit2 = hitCheck(choiceList[1][0],choiceList[1][1],choiceList[1][2],choiceList[1][3]);
        let hit3 = hitCheck(choiceList[2][0],choiceList[2][1],choiceList[2][2],choiceList[2][3]);
        let hit4 = hitCheck(choiceList[3][0],choiceList[3][1],choiceList[3][2],choiceList[3][3]);

        if(hit1 || hit2 || hit3 || hit4){
            if(hit1){
                console.log("Selected choice 1");
            }else if(hit2){
                console.log("Selected choice 2");
            }else if(hit3){
                console.log("Selected choice 3");
            }else if(hit4){
                console.log("Selected choise 4");
            }
        }
    }
        
    });
}

//===================ここまでボス戦時の処理====================


//===================ここから背景の処理====================
    function drawBG(battleCanvas){
        console.log("***Draw Back Ground***");
        const btlCtx = battleCanvas.getContext("2d");
        btlCtx.drawImage(imageBG, 0, 0, battleCanvas.width, battleCanvas.height);
    }
//===================ここまで背景の処理====================


//====================ここから巻物の処理====================

function openScroll(){
    console.log("Load imgBoxClose")
    canvas.onclick = openBox;

    imageBoxOpen.src = "./src/box_opened.png"
    imageBoxClose.src = "./src/box_closed.png"

    imageBoxClose.onload = function(){
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
        };

    function openBox(){
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
}


//巻物表示ギミック
function scrollSet(){
    let chapterIndex = 0;
    let stageIndex = 0;
    let scrLen = scrolls.length-1;
    let stage = "";


    drawBG(scrollCanvas);
    imagePlainScroll.src = "./src/plainScroll.png"

    imagePlainScroll.addEventListener("load",function(){
        scrollCtx.drawImage(imagePlainScroll,100,100,canvas.width-200, canvas.height-200);

        for(i=0;i<=scrLen;i++){
            if(scrolls[i]<scrollMax[i]){
                scrolls[i]++;
                chapterIndex = i + 1;
                stageIndex = scrolls[i];
                console.log(chapterIndex + " - " + stageIndex);
                
                stage = chapterIndex+"-"+stageIndex;
                console.log(stage);

                let b = document.getElementById("st" + stage);
                scrollCtx.drawImage(b,0,0,canvas.width,canvas.height);
                        
                let thisDiv = document.getElementById(stage);
                thisDiv.setAttribute("onclick","showScroll('" + stage + "')");
                thisDiv.innerText = "【取得済】" + stage;

                break;
            }
        }
        ctx.drawImage(scrollCanvas,0,0,canvas.width,canvas.height);

        if(scrolls[scrolls.length-1]==10){
            alert("Game Completed!! Congrats!!");
            console.log(scrolls);
            canvas.onclick = returnTitle;
        }else{
            console.log(scrolls);
            canvas.onclick = walk;
        };
    })
}



//巻物の情報を取得するやつ
function showScroll(stage){
    let show = document.getElementById("scrollShow");
    let a = document.getElementById("scrList");
    let b = a.getElementsByTagName("td");
    for(i=0; i<b.length; i++){
        if(b[i].innerText==stage){
            console.log(b[i].innerText);
            console.log(b[i+1].innerText);
            console.log(b[i+2].innerText);

            show.getElementsByTagName("h3")[0].innerText = b[i].innerText;
            show.getElementsByTagName("h1")[0].innerText = b[i+1].innerText;
            show.getElementsByTagName("p")[0].innerHTML = b[i+2].innerHTML;

            let x = document.getElementsByClassName("stageList");
            for(j=0;j<x.length;j++){
                x[j].style.display = "none";
            }

            show.style.display = "block";
            break;
        }
    }
}


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
}

//====================ここまで巻物の処理====================


//タイトル画面に戻る汎用処理
function returnTitle(){
    clearInterval(minorBattleInterval);
    canvas.onclick = clickCheckTitle;
    ctx.drawImage(titleCanvas,0,0);
    resetAllDiv();
}


//前の画面に戻る汎用処理
function backScr(beforeScr, afterScr){
    let bef = document.getElementById(beforeScr);
    let aft = document.getElementById(afterScr);
    bef.style.display = "none";
    aft.style.display = "block";
}

//全画面初期化の汎用処理
function resetAllDiv(){
    let a = document.getElementsByTagName("div")
    for(i=0; i<a.length; i++){
        a[i].style.display = "none";
    }
    let x = document.getElementById("btnGroup");
    x.style.display = "flex";

    x = document.getElementById("showScreen");
    x.style.display = "block";
}

function remClick(){
    canvas.onclick = function(){
        console.log("発火削除");
    }
}

//クリック判定がボタン位置かを判定する関数
//fillRectと同じ書き方にしてる
function hitCheck(btnX, btnY, btnW, btnH){
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
    return new Promise(function(resolve) {
  
       setTimeout(function() {resolve()}, msec);
  
    })
 }


//初回起動時のタイトル画面読み込み処理
title();



