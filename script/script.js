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


minorBattle("./src/enm1.jpg","./src/start.jpg");

//====================ここからタイトル画面処理==================
function title(){

}
//====================ここまでタイトル画面処理==================


//====================ここから雑魚戦時の処理====================
function minorBattle(enmSrc, bgSrc){
    imageEnm.src = enmSrc;
    imageBG.src = bgSrc;

    minorBattleMusic.play();
    

    //起動時の画面読み込み処理
    imageBG.addEventListener("load", function(){
        drawBG(battleCanvas);
    });

    let enmPoint = {};
    imageEnm.addEventListener("load", function(){
        enmPoint = drawEnm(battleCanvas);
    });


    let battleClear = false;


    //クリック時の判定を追加
    canvas.addEventListener("click", e =>{
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

            drawBG(battleCanvas);
            enmPoint = drawEnm(battleCanvas);
            ctx.drawImage(battleCanvas,0,0);
        }else{
            console.log("Miss");
        }}else{
            ctx.fillStyle="white";
            ctx.font = '48px serif';
            ctx.fillText('防御された！', enmPoint.x, enmPoint.y);
            console.log("Barriered!!");
        };
        console.log("in event listener  x: " + point.x + "/ y: " + point.y);

    });




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
            clearInterval(minorBattle);
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


    function fillCanv(){
        fillCtx.fillStyle = "rgb(255,0,0)";
        fillCtx.fillRect(0,0,canvas.width,canvas.height);
    }



    //モブの一定間隔ジャンプ処理
    const minorBattle = setInterval(mainProc,1500);
}
//===================ここまで雑魚戦時の処理====================