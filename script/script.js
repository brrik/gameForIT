const canvas = document.getElementById("MainC");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let cursorPoint = [];

window.onload = function(){
    let imagePath = "./src/start.jpg";
    drawBG(canvas, imagePath);

    canvas.addEventListener("click", function (){

        let imagePath = "./src/start.jpg";
        drawBG(canvas,imagePath);
        let enmPath = "./src/enm1.jpg";
        drawEnm(canvas, enmPath);

        console.log(cursorPoint);
    });
    console.log(cursorPoint);

}

canvas.addEventListener("click", function(e){
    const rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    if(x>cursorPoint[0] && y>cursorPoint[1] && x<cursorPoint[2] && y<cursorPoint[3]){
        console.log("HIT");
    }
})









function drawBG(canvas,imagePath){
    const imageBG = new Image();
    imageBG.addEventListener("load",function (){
        const ctx = canvas.getContext("2d");
        ctx.drawImage(imageBG, 0, 0, canvas.width, canvas.height);
    });
    imageBG.src = imagePath;
}





function drawEnm(canvas,imagePath){
    const imageEnm = new Image();
    imageEnm.src = imagePath;
    let enmX = Math.floor(Math.random() * (canvas.width - imageEnm.width));
    let enmY = Math.floor(Math.random() * (canvas.height - imageEnm.height));
    imageEnm.addEventListener("load",function (){
        const ctx = canvas.getContext("2d");
        ctx.drawImage(imageEnm, enmX, enmY);
    });
    cursorPoint[0] = enmX;
    cursorPoint[1] = enmY;
    cursorPoint[2] = enmX + imageEnm.width;
    cursorPoint[3] = enmY + imageEnm.height;
}
