//const MainCanvas = document.getElementById("MainC");
//const MainCTX = MainCanvas.getContext("2d");

//MainCanvas.width = window.innerWidth - 30;
//MainCanvas.height = window.innerHeight - 30;



//const canvas = document.createElement("canvas");
//const ctx = canvas.getContext("2d");

//canvas.width = MainCanvas.width;
//canvas.height = MainCanvas.height;

//MainCTX.drawImage(canvas,0,0);


//　↑↑↑ここまでデバッグ用の処理のため、消しても大丈夫



//定数の定義
const loopTime = 1500; //モブがワープする時間間隔(ミリ秒：1000で1秒)
const enmRect = 100; //敵モブの大きさ　初期設定100
let hitCount = 5; //敵モブの体力　初期設定5


//画像のファイル名　最初に読み込んでおくことで処理高速化と安定化
const imageBG = new Image();
imageBG.src = "./src/start.jpg";

const imageEnm = new Image();
imageEnm.src = "./src/enm1.jpg";



//ゲーム画面の初期化
const canvas = document.getElementById("MainC");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth - 30;
canvas.height = window.innerHeight - 30;


//最初のゲーム画面処理
imageBG.addEventListener("load", function(){
    drawBG(canvas);
});

let enmPoint = {};
imageEnm.addEventListener("load", function(){
    enmPoint = drawEnm(canvas);
});



//クリック時の判定
canvas.addEventListener("click", e =>{
    const rect = canvas.getBoundingClientRect();
    point = {
        x : e.clientX  - rect.left,
        y : e.clientY  - rect.top
    };

    //ctx.fillStyle="rgb(255,0,0)";
    //ctx.fillRect(point.x-25,point.y-25,50,50);


    const hit = (enmPoint.x <= point.x && point.x <= enmPoint.w) && 
                (enmPoint.y <= point.y && point.y <= enmPoint.h);

    console.log(hit)

    if(hit){
        console.log("HIT! Hit count is " + hitCount);
        
        hitCount = hitCount -1;
        if(hitCount==0){
            alert("Clear!!");
            hitCount = 5;
        };

        drawBG(canvas);
        enmPoint = drawEnm(canvas);
    }else{
        console.log("Miss");
    }
    console.log("in event listener  x: " + point.x + "/ y: " + point.y);

});


//一定時間ごとに繰り返す処理
function mainProc(){
    console.log("before mainProc EnmPoint");
    console.log(enmPoint);
    drawBG(canvas);
    enmPoint = drawEnm(canvas);
    console.log("after mainProc EnmPoint");
    console.log(enmPoint);
}

//背景の処理
function drawBG(canvas){
    console.log("***Draw Back Ground***");
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imageBG, 0, 0, canvas.width, canvas.height);
}

//敵画像の処理
function drawEnm(canvas){
    console.log("***Draw Enemy***");

    let enmX = Math.floor(Math.random() * (canvas.width - enmRect));
    let enmY = Math.floor(Math.random() * (canvas.height - enmRect));

    const ctx = canvas.getContext("2d");
    ctx.drawImage(imageEnm, enmX, enmY, enmRect, enmRect);

    const enmPath = {
        x : enmX,
        y : enmY,
        w : enmX + enmRect,
        h : enmY + enmRect  
    };
    console.log("canvas h:" + canvas.height + " / canvas w:" + canvas.width);
    console.log(enmPath);
    return enmPath;
}

//モブの一定間隔ジャンプ処理
setInterval(mainProc,1500);
