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
const loopTime = 1500; //モブがワープする時間間隔(ミリ秒：1000で1秒)
const enmRect = 100; //敵モブの大きさ　初期設定100
let hitCount = 5; //敵モブの体力　初期設定5
const enmBarrier = 3; //敵モブのバリア動作率　初期設定3　＝　1/3でバリア解除状態
let barrier = 0; //バリア発動フラグ
let enmPoint = {}; //雑魚敵の座標処理
let battleClear = false; //雑魚戦のクリア処理フラグ
let minorBattleInterval = 0;

//画像読み込み用のバッファ　最初に読み込んでおくことで処理高速化と安定化
const imageBG = new Image();
const imageEnm = new Image();

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
       let fontHeight = titleCtx.measureText(startMsg).height;
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
        minorBattle("./src/enm1.jpg","./src/start.jpg");
    }
    
};
//====================ここまでタイトル画面処理==================


//====================ここから雑魚戦時の処理====================
function minorBattle(enmSrc, bgSrc){

    canvas.removeEventListener("click",clickCheckTitle);
    canvas.addEventListener("click",checkClickEnm);
    imageEnm.src = enmSrc;
    imageBG.src = bgSrc;

    minorBattleMusic.play();
    


    //起動時の画面読み込み処理
    btlCtx.fillStyle = "rgb(0,0,0)";
    btlCtx.fillRect(0,0,battleCanvas.width,battleCanvas.height);
    btlCtx.fillStyle = "rgb(255,255,255)";

    btlCtx.font = "italic bold 100px sans-serif";
    let btlMsg = "Battle Start!!"
    let fontWidth = btlCtx.measureText(btlMsg).width;
    btlCtx.fillText(btlMsg,(battleCanvas.width - fontWidth)/2, battleCanvas.height/2);


    mainProc();

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
            title();
        }
    }




    //背景の処理
    function drawBG(battleCanvas){
        console.log("***Draw Back Ground***");
        const btlCtx = battleCanvas.getContext("2d");
        btlCtx.drawImage(imageBG, 0, 0, battleCanvas.width, battleCanvas.height);
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
    minorBattleInterval = setInterval(mainProc,1500);
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

    if(barrier <= 1){
    const hit = (enmPoint.x <= point.x && point.x <= enmPoint.w) && 
                (enmPoint.y <= point.y && point.y <= enmPoint.h);

    console.log(hit)

    if(hit){
        console.log("HIT! Hit count is " + hitCount);
        
        hitCount = hitCount -1;
        if(hitCount==0){
            alert("Clear!!");
            hitCount = 5;
            battleClear = true;
        };
        /*
        drawBG(battleCanvas);
        enmPoint = drawEnm(battleCanvas);
        ctx.drawImage(battleCanvas,0,0);
        */
    }else{
        console.log("Miss");
    }}else{
        ctx.fillStyle="white";
        ctx.font = '48px serif';
        ctx.fillText('防御された！', enmPoint.x, enmPoint.y);
        console.log("Barriered!!");
    };
    console.log("in event listener  x: " + point.x + "/ y: " + point.y);

};
//===================ここまで雑魚戦時の処理====================

function returnTitle(){
    clearInterval(minorBattleInterval);
    canvas.removeEventListener("click",checkClickEnm)
    canvas.addEventListener("click",clickCheckTitle);
    ctx.drawImage(titleCanvas,0,0);
}



title();
