//const MainbattleCanvas = document.getElementById("MainC");
//const MainbtlCtx = MainbattleCanvas.getContext("2d");

//MainbattleCanvas.width = window.innerWidth - 30;
//MainbattleCanvas.height = window.innerHeight - 30;



//const battleCanvas = document.createElement("battleCanvas");
//const btlCtx = battleCanvas.getContext("2d");

//battleCanvas.width = MainbattleCanvas.width;
//battleCanvas.height = MainbattleCanvas.height;

//MainbtlCtx.drawImage(battleCanvas,0,0);


//　↑↑↑ここまでデバッグ用の処理のため、消しても大丈夫



//定数の定義
const loopTime = 1000; //モブがワープする時間間隔(ミリ秒：1000で1秒)
const enmRect = 100; //敵モブの大きさ　初期設定100
let hitCountFirst = 5 //敵モブの体力　初期設定5
let hitCount = hitCountFirst; //敵モブの現在の体力
const enmBarrier = 3; //敵モブのバリア動作率　初期設定3　＝　1/3でバリア解除状態
let barrier = 0; //バリア発動フラグ
let enmPoint = {}; //雑魚敵の座標処理
let battleClear = false; //雑魚戦のクリア処理フラグ
let minorBattleInterval = 0;
let scrolls = [0,0,0,0,0,0,0,0,0,0]


//画像読み込み用のバッファ　最初に読み込んでおくことで処理高速化と安定化
const imageBG = new Image();
const imageEnm = new Image();
const imageBoxOpen = new Image();
const imageBoxClose = new Image();
const imageCloud = new Image();
const imagePlainScroll = new Image();

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


//minorBattle("./src/enm1.jpg","./src/start.jpg");



//====================ここからタイトル画面処理==================
let btnPos ={};

function title(){
    const titleImg = new Image();
    titleImg.src = "./src/title.jpg";
    const btnImg = new Image();
    btnImg.src = ""


    //x：定数
    //y：下から100の位置、
    //w：xと等間隔になるように
    //h：キャンバスサイズの1/10
    btnPos = {
        x : 60,
        y : canvas.height-100,
        w : canvas.width-(60 * 2),
        h : canvas.height/10
    }

    titleImg.addEventListener("load",function(){

        titleCtx.drawImage(titleImg,0,0,titleCanvas.width,titleCanvas.height);

        //テスト用　ボタン素材できるまでは色つきのみで対応
        titleCtx.fillStyle="rgb(100,100,100)";
        titleCtx.fillRect(btnPos.x, btnPos.y, btnPos.w, btnPos.h);

        //本番用　ボタン素材できたら置き換え
        /*
        titleCtx.drawImage(btnImg,btnPos.x,btnPos.y,btnPos.w,btnPos.h);
        */

       titleCtx.font = "italic bold 40px sans-serif";
       let startMsg = "START!"; //ボタンに表示するメッセージ
       titleCtx.fillStyle = "rgb(255,0,0)";
       let fontWidth = titleCtx.measureText(startMsg).width;
       titleCtx.fillText(startMsg,(titleCanvas.width - fontWidth)/2, btnPos.y + (btnPos.h/2)+10);


        ctx.drawImage(titleCanvas,0,0);
        

        canvas.addEventListener("click",clickCheckTitle);
    });
};

function clickCheckTitle(e){
    const rect = canvas.getBoundingClientRect();
    point = {
        x : e.clientX  - rect.left,
        y : e.clientY  - rect.top
    };

    const hit = (btnPos.x <= point.x && point.x <= (btnPos.x + btnPos.w)) && 
                (btnPos.y <= point.y && point.y <= (btnPos.y + btnPos.h));
    console.log(point);
    console.log(btnPos);
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
    console.log("walking.....")
    canvas.removeEventListener("click",clickCheckTitle);

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

    imageBG.src = "./src/start.jpg"

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

    imageBG.src = "./src/start.jpg"

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
        imageEnm.src = "./src/enm1.jpg"
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

    minorBattle("./src/enm1.jpg","./src/start.jpg");
}


function minorBattle(enmSrc, bgSrc){

    canvas.removeEventListener("click",clickCheckTitle);
    canvas.addEventListener("click",checkClickEnm);
    imageEnm.src = enmSrc;
    imageBG.src = bgSrc;

    minorBattleMusic.play();
    


    //一定時間ごとに繰り返す処理
    function mainProc(){
        console.log("before mainProc EnmPoint");
        console.log(enmPoint);
        drawBG(battleCanvas);
        enmPoint = drawEnm(battleCanvas);
        console.log("after mainProc EnmPoint");
        console.log(enmPoint);
        console.log("copy screen");
        ctx.drawImage(battleCanvas,0,0);
        console.log(battleClear);
        if(battleClear == true){
            clearInterval(minorBattleInterval);
            battleClear = false;
            canvas.removeEventListener("click", checkClickEnm);
            canvas.addEventListener("click", clickCheckTitle);
            openScroll();
        }
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
            w : enmX + enmRect,
            h : enmY + enmRect  
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
function checkClickEnm(e){
    const rect = canvas.getBoundingClientRect();
    point = {
        x : e.clientX  - rect.left,
        y : e.clientY  - rect.top
    };

    //btlCtx.fillStyle="rgb(255,0,0)";
    //btlCtx.fillRect(point.x-25,point.y-25,50,50);

    const hit = (enmPoint.x <= point.x && point.x <= enmPoint.w) && 
                (enmPoint.y <= point.y && point.y <= enmPoint.h);

    console.log(hit)

    if(hit){
        if(barrier <= 1){
            ctx.fillStyle="red";
            ctx.font = '48px serif';
            ctx.fillText("HIT!!", enmPoint.x, enmPoint.y);


            console.log("HIT! Hit count is " + hitCount);
            
            hitCount = hitCount -1;
            if(hitCount==0){
                alert("Clear!!");
                hitCount = hitCountFirst;
                battleClear = true;
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
    console.log("in event listener  x: " + point.x + "/ y: " + point.y);

};
//===================ここまで雑魚戦時の処理====================

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
    canvas.removeEventListener("click",checkClickEnm)
    canvas.addEventListener("click",openBox);

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
        canvas.removeEventListener("click",openBox);
        canvas.addEventListener("click",scrollSet);
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
        scrollCtx.drawImage(imagePlainScroll,100,100,canvas.width-200, canvas.width-200);

        for(i=0;i<=scrLen;i++){
            if(scrolls[i]<10){
                scrolls[i]++;
                chapterIndex = i + 1;
                stageIndex = scrolls[i];
                console.log(chapterIndex + " - " + stageIndex);
                
                stage = chapterIndex+"-"+stageIndex;
                console.log(stage);

                let a = document.getElementById("scrList");
                let b = a.getElementsByTagName("td");
                for(i=0; i<b.length; i++){
                    if(b[i].innerText==stage){
                        console.log(b[i].innerText);
                        console.log(b[i+1].innerText);
                        console.log(b[i+2].innerText);
                        
                        
                        let lineHeight = 1.5;
                        let y = canvas.height/2;

                        //ヘッダー用のフォント設定
                        let fontSize = 24;
                        scrollCtx.fillStyle = "rgb(50,50,50)";
                        scrollCtx.font = fontSize + " sans-selif";

                        scrollCtx.fillText(b[i+1].innerText,100,100);

                        let inTex = b[i+2].innerHTML;
                        console.log(inTex);
                        let inTexList = inTex.split("<br>");
                        console.log(inTexList);

                        //ヘッダー用のフォント設定
                        fontSize = 18;
                        scrollCtx.fillStyle = "rgb(50,50,50)";
                        scrollCtx.font = fontSize + " sans-selif";

                        for(j=0;j<inTexList.length;j++){
                            var line = inTexList[j];
                            console.log(line);
                            var addY = fontSize;
                            if(j>0){
                                addY += fontSize * lineHeight * j;
                            }
                            scrollCtx.fillText(line,0,y + addY);
                        }

                        break;
                    }
                }

                break;
            }
        }
        ctx.drawImage(scrollCanvas,0,0,canvas.width,canvas.height);

        if(scrolls[scrolls.length-1]==10){
            alert("Game Completed!! Congrats!!");
            console.log(scrolls);
            canvas.removeEventListener("click",scrollSet);
            canvas.addEventListener("click",returnTitle);
        }else{
            console.log(scrolls);
            canvas.removeEventListener("click",scrollSet);
            canvas.addEventListener("click",returnTitle);
        };
    });
}

function showScroll(){
    
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
    canvas.removeEventListener("click",checkClickEnm)
    canvas.addEventListener("click",clickCheckTitle);
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


//sleep関数 ミリ秒で使う
function sleep(msec) {
    return new Promise(function(resolve) {
  
       setTimeout(function() {resolve()}, msec);
  
    })
 }


//初回起動時のタイトル画面読み込み処理
title();



