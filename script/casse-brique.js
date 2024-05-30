const canvas = document.querySelector("div.casse-brique .mainContainer canvas") ;
var score = document.querySelector("#score") ;
const info = document.querySelector("div.playGame") ;


console.log(canvas) ;

const canvasHeight = 450 ;
const canvasWidth = 600 ;

var rectRowNumber = 4 ;
var rectColNumber = 12 ;
var rectNumber = rectRowNumber*rectColNumber ;

// fin du jeu 
var end = false ;


const ctx = canvas.getContext("2d") ;
ctx.canvas.width = canvasWidth ;
ctx.canvas.height = canvasHeight ;


// definition des propriétés de l'objet rect 
const rectWidth = (canvasWidth - 80) / (rectColNumber + 2) ;
const rectHeight = 17 ;
const margin = ((canvasWidth - 80) -  rectWidth*rectColNumber) / (2*rectColNumber) ;
var maxRectPosY; 
// const margin = 10 ;

// bar
const barWidth = 2*rectWidth ;
const barHeight = (0.7)*rectHeight ;
const barVx = 10 ;


// circle
const radius = 10;
var circleVx ;
var circleVy ;

function Circle(posX, posY){
    this.posX = posX,
    this.posY = posY,
    this.radius = radius,
    this.Vx = circleVx,
    this.Vy = circleVy
}

function Bar(posX, posY){
    this.posX = posX,
    this.posY = posY,
    this.width = barWidth,
    this.height = barHeight,
    this.Vx = barVx
}

colors = ['#2c698d', '#fff', '#272643', '#e3e3e3', '#e3f6f5'] ;
function Rect(posX = 0, posY = 0){
        this.posX = posX,
        this.posY = posY,
        this.width = rectWidth,
        this.height = rectHeight,
        this.dead = false
        this.color = (function(){
            let colorId = Math.floor(Math.random() * colors.length) ;

            return colors[colorId] ;
        })() ;
}

// matrice des rectangles 
var listRect ;
var matRect ;

matRect = [] ;
maxRectPosY = 0 ;
for(let i = 1; i <= rectRowNumber; i++){

    listRect = [] ;
    for(let j = 1; j <= rectColNumber; j++){
        let rect ;

        if(j == 1){
            rect = new Rect(margin + 40, (i+1)*2.5*margin + (i-1)*rectHeight) ;
        }
        else{
            rect = new Rect(rectWidth + listRect[j-2].posX + 2*margin, (i+1)*2.5*margin + (i-1)*rectHeight) ;
            // console.log(listRect) ;
        }
        
        if(rect.posY > maxRectPosY){
            maxRectPosY = rect.posY ;
        }
        listRect.push(rect) ;
    }
    matRect.unshift(listRect) ;
}


// creation des rectangle
function drawRect(){
    
    matRect.forEach(list_ => {
        list_.forEach(rect =>{

            if(!rect.dead){
                ctx.beginPath() ;
                ctx.rect(rect.posX, rect.posY, rect.width, rect.height) ;
                // console.log(rect.color) ;
                ctx.fillStyle = rect.color ;
                ctx.fill() ;
                ctx.stroke() ;
                ctx.closePath() ;
            }
            // ctx.strokeStyle = '#333' ;
            // ctx.stroke() ;
        })
    });

}

// barre
var bar;
function drawBar(){

    if(!bar){
        bar = new Bar((canvasWidth / 2) - (barWidth / 2), canvasHeight - barHeight  - 2) ;
    }

    ctx.beginPath() ;
    ctx.fillStyle = "#2c698d" ;

    ctx.rect(bar.posX, bar.posY, bar.width, bar.height) ;
    ctx.fill() ;
    ctx.stroke() ;
    ctx.closePath() ;
} 


// circle
var circle ;
var colorBall;
function drawCircle(){
    
    if(!circle){
        circle = new Circle((canvasWidth / 2), canvasHeight - barHeight - 2 - radius) ;
    }

    ctx.beginPath() ;
    ctx.fillStyle = "#2c698d" ;

    ctx.arc(circle.posX, circle.posY, circle.radius, 0, 2*Math.PI) ;

    if(!colorBall){
        colorBall = (function(){
            let colorId = Math.floor(Math.random() * 4 ) ;
            return colors[colorId] ;
        })() ;
    }

    ctx.fillStyle = colorBall ;
    ctx.stroke() ;
    
    ctx.fill() ;
    ctx.closePath() ;
}

// initialisation de l'aire de Jeu
function initGameArea(){
    drawRect() ;
    drawBar() ;
    drawCircle() ;    
}


initGameArea() ;

// animé la balle
function moveCircle(cursorX, cursorY){
    
    if(!circleVx){
        let y = absoluteValue(cursorY - canvas.offsetTop - circle.posY) ;
        let x = absoluteValue(cursorX - canvas.offsetLeft - circle.posX) ;
        let teta = Math.acos( x / (Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)))) ;

        if(cursorX - canvas.offsetLeft>= circle.posX){
            circleVx = Math.cos(teta) ;
        }
        else {
            circleVx = -Math.cos(teta) ;
        }
        circleVy = -Math.sin(teta) ;

        // let modV = Math.sqrt(Math.pow(circleVx, 2) + Math.pow(circleVy, 2)) ;
        // // circleVx /= modV ;
        // // circleVy /= modV ;

        circle.Vx = (4)*circleVx ;
        circle.Vy = (4)*circleVy ;

    }

    // circle.Vy = -circle.Vy ;
    if((circle.posX + circle.Vx + circle.radius < canvasWidth) && (circle.posX + circle.Vx - circle.radius > 0)){
        circle.posX += circle.Vx ;
    }
    else {
        circle.Vx = -circle.Vx ;
        circle.posX += circle.Vx ;
    }

    
    if((circle.posY + circle.Vy + circle.radius < canvasHeight) && (circle.posY + circle.Vy - circle.radius > 0) ){
        circle.posY += circle.Vy ;
    }
    else {
        circle.Vy = -circle.Vy ;
        circle.posY += circle.Vy ;
    }

    
    if(bar.posY - circle.posY - circle.radius<= 0){
        if(( bar.posX <= circle.posX - circle.radius ) && (circle.posX + circle.radius <= bar.posX + bar.width)){
            circle.Vy =-circle.Vy ;
        }
        else{
            end = true ;
        }
    }

}


function collision(){
    matRect.forEach(list_ =>{
        list_.forEach(rect => {
            if(!rect.dead){
                if((rect.posX <= circle.posX + 3*circle.Vx ) && (rect.posX + rectWidth >=3*circle.Vx + circle.posX)){
                    if(( circle.posY - circle.radius + 3*circle.Vy<= rect.posY + (rect.height / 2) )&&( rect.posY + rect.height / 2 ) >= circle.posY + circle.radius + 3*circle.Vy){
                        rect.dead = true ;

                        circle.Vx = -circle.Vx ;
                        circle.Vy = -circle.Vy ;
                    }
                }
            }
        })
    })
}

function drawPoint(x, y){
    ctx.beginPath() ;
    ctx.fillStyle = "red" ;
    ctx.arc(x, y, 1, 0, 2*Math.PI) ;
    ctx.fill() ;
    ctx.closePath() ;
}

// approximation en utilisant l'equation du contour de la balle
// subDiv : nombre de subdivision du largeur et hauteur des rectangles
function collisionV2(subDivX, subDivY){
    let collision = false ; 

    matRect.forEach(list_ =>{
        list_.forEach(rect => {
            collision = false ;
            if(!rect.dead){

                // drawLine(rect.posX, rect.posY, rect.posX + rect.width, rect.posY) ;
                // drawLine(rect.posX, rect.posY, rect.posX, rect.posY + rect.height) ;
                for(let i = subDivX; i >= 1; i--) {

                    for(let j = 1; j < subDivY; j++){
                        let x = rect.posX + (j*rect.width) / (subDivX) ;
                        let y = rect.posY + (i*rect.height) / (subDivY) ;
                        
                        // console.log(x + ' ' + y) ;
                        // drawPoint(x, y) ;
                        if(pointCloseToBall(x, y)){
                            rect.dead = true;

                            collision = true ;

                            circle.Vy = -circle.Vy ;
                            circle.Vx += 0.1 ;
                            circle.Vy += 0.1 ;

                            rectNumber-- ;

                            colorBall = undefined ;
                            score.innerText = "Score : " + parseInt(((rectRowNumber*rectColNumber - rectNumber)*100)/(rectRowNumber*rectColNumber)) + '%'  ;


                            break ;
                        }
                    }

                    if(collision){
                        break;
                    }
                }
            }
        })
    })
}

function drawLine(x, y, xx, yy){
    ctx.beginPath() ;

    ctx.moveTo(x, y) ;
    ctx.lineTo(xx, yy) ;

    ctx.stroke() ;
    ctx.closePath() ;
}

function pointCloseToBall(x, y){
    let value = Math.pow(absoluteValue(x - circle.posX), 2) + Math.pow(absoluteValue(y - circle.posY), 2) ;
    if((Math.pow(circle.radius, 2) - 0.5 <= value) && (value <= Math.pow(circle.radius, 2) + 0.5 )){
        return true;
    }
    return false ;
}

function absoluteValue(value){
    return value >= 0 ? value : -value ;
}

var win = false;
function runGame(cursorX, cursorY){
    ctx.clearRect(0, 0, canvasWidth, canvasHeight) ;


    if(rectNumber <= 0){
        end = true ;
        win = true ;
    }
    if(end){

        circle.Vx = 0;
        circle.Vy = 0;
        if(win){
            score.innerHTML = "Bravo, vous avez gagné!" ;
        }else {
            score.innerHTML = "Fin de la partie, vous avez perdu!" ;

            canvas.style.backgroundColor = "rgb(220, 90, 90)"
        }
        setTimeout( ()=>{
            window.location.href = "./index.html" ;
        }, 10) ;
    }

    moveCircle(cursorX, cursorY) ;

    if(circle.posY <= maxRectPosY + 1.5*rectHeight){
            collisionV2(90, 90) ;
    }

    initGameArea() ;
    
    
    requestAnimationFrame(runGame) ;
}

canvas.addEventListener('mousemove', (event_) =>{

    bar.posX = event_.clientX - canvas.offsetLeft - (bar.width / 2);
    
    if(bar.posX < 0){
        bar.posX = 0;
    }
    if(bar.posX + bar.width > canvasWidth){
        bar.posX = canvasWidth - bar.width ;
    }
})

var isRunning = false;
canvas.addEventListener('click', (event_)=>{

    console.log(isRunning) ;
    
    if(!isRunning ){

        info.style.display = "none" ;

        let cursorX = event_.clientX ;
        let cursorY = event_.clientY ;

        isRunning = true ;
        runGame(cursorX, cursorY) ;
    }
})
