
window.onload = function(){
    const canvas = document.getElementById("MainC");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let imagePath = "./src/start.jpg";
    drawBG(canvas, imagePath);

    let cursorPoint = [];

    canvas.addEventListener("click", function (){
        const canvas = document.getElementById("MainC");
        let imagePath = "./src/start.jpg";
        drawBG(canvas,imagePath);
        let enmPath = "./src/enm1.jpg";
        drawEnm(canvas, enmPath);

        console.log(cursorPoint);
    });

}

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
    imageEnm.addEventListener("load",function (){
        const ctx = canvas.getContext("2d");
        let enmX = Math.floor(Math.random() * (window.innerWidth - imageEnm.width));
        let enmY = Math.floor(Math.random() * (window.innerHeight - imageEnm.height));
        ctx.drawImage(imageEnm, enmX, enmY);
    });
    imageEnm.src = imagePath;
    cursorPoint = [enmX, enmY, enmX + imageEnm.width, enmY + imageEnm.height];
}
