//const MainCanvas = document.getElementById("MainC");
//const MainCTX = MainCanvas.getContext("2d");

//MainCanvas.width = window.innerWidth - 30;
//MainCanvas.height = window.innerHeight - 30;



//const canvas = document.createElement("canvas");
//const ctx = canvas.getContext("2d");

//canvas.width = MainCanvas.width;
//canvas.height = MainCanvas.height;

//MainCTX.drawImage(canvas,0,0);


const canvas = document.getElementById("MainC");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth - 30;
canvas.height = window.innerHeight - 30;

const enmRect = 50;
let hitCount = 5;

const imageBG = new Image();
imageBG.src = "./src/start.jpg";

const imageEnm = new Image();
imageEnm.src = "./src/enm1.jpg";



imageBG.addEventListener("load", function(){
    drawBG(canvas);
});

let enmPoint = {};
imageEnm.addEventListener("load", function(){
    enmPoint = drawEnm(canvas);
});

canvas.addEventListener("click", e =>{
    const canvas = document.getElementById("MainC");


    const rect = canvas.getBoundingClientRect();
    point = {
        x : e.clientX  - rect.left,
        y : e.clientY  - rect.top
    };


    console.log(point);

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

        drawBG(canvas,"./src/start.jpg");
        enmPoint = drawEnm(canvas);
    }else{
        console.log("Miss");
    }
    console.log("in event listener  x: " + point.x + "/ y: " + point.y);

});


function drawBG(canvas){
    console.log("***Draw Back Ground***");
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imageBG, 0, 0, canvas.width, canvas.height);
}





function drawEnm(canvas){
    console.log("***Draw Enemy***");

    let enmX = Math.floor(Math.random() * (canvas.width - enmRect));
    let enmY = Math.floor(Math.random() * (canvas.height - enmRect));

    const ctx = canvas.getContext("2d");
    ctx.drawImage(imageEnm, enmX, enmY, enmRect, enmRect);
    console.log("===ENM w/h===")
    console.log(imageEnm.width);
    console.log(imageEnm.height);
    console.log("=============")

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
