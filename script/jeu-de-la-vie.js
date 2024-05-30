if (document.readyState) {
    let mainContainer = document.querySelector(".mainContainer") ;
    let form = document.querySelector(".form") ;
    var caseList = []
    var caseMatrix = []
    var gameLoop ; 

    form.addEventListener("submit", (event_) => {
        event_.preventDefault() ;
        let input = form.querySelector("input") ;
        var caseNumber = checkNumber(parseInt(input.value)) ;

        document.querySelector(".form").remove()
        
        let caseElement = document.createElement("div");
        caseElement.className = "case" ;
        // caseElement.style.width = (mainContainer.clientWidth / caseNumber) + 'px' ;
        // caseElement.style.height = (mainContainer.clientHeight / caseNumber) + 'px' ;

        for(let row = 1; row < caseNumber; row++){
            caseList = []
            for(let col = 1; col < caseNumber; col++){
                var case_ = {
                    posX: row,
                    posY: col,
                    element: caseElement.cloneNode(),
                    color: 'white'
                }
                
                case_.element.style.backgroundColor = case_.color ;
                caseList.push(case_) ;
                // case_.element.innerHTML = '(' + case_.posX + ', ' + case_.posY + ')' ;
                case_.element.style.gridRowStart = case_.posX ;
                case_.element.style.gridRowEnd = case_.posX + 1 ;
                case_.element.style.gridColumnStart = case_.posY ;
                case_.element.style.gridColumnEnd = case_.posY + 1 ;
                mainContainer.appendChild(case_.element) ;
            }
            caseMatrix.push(caseList) ;

        }


        for(caseList of caseMatrix){
            for(let case_ of caseList){
                case_.element.addEventListener("click", (event_) => {
                    console.log(case_.color);
                    if(case_.color == 'white'){
                        case_.color = 'black' ;
                    }
                    else {
                        case_.color = 'white' ;
                    }
    
                    case_.element.style.backgroundColor = case_.color ;
                })
            }
        }

        const runButton = document.querySelector(".runButton") ;
        runButton.style.display = "inline";

        runButton.addEventListener("click", (event_) =>{
            event_.preventDefault() ;

            if (runButton.textContent == "Re-faire une autre simulation"){
                window.location.reload() ;
            }
            else if(runButton.textContent == "Arrêter"){
                clearInterval(gameLoop) ;
                runButton.textContent = "Re-faire une autre simulation" ;
            }
            else{
                runButton.textContent = "Arrêter";
                run(caseNumber, 'black');
            }

        })
    }) ;

    function checkNumber(number){
        return Math.pow(Math.ceil(Math.sqrt(number)), 2) ;
    }

    function execute(caseNumber, color){
        let newMatrix = [] ;
        for(let caseList of caseMatrix){
            let newCaseList = [] ;
            for(let case_ of caseList){ 
               let closestCasesX = [case_.posX - 1, case_.posX + 1, case_.posX]
               let closestCasesY = [case_.posY - 1, case_.posY + 1, case_.posY]

               let closestCasePos = []
               for(let posX of closestCasesX){
                    if(posX < 1) continue ;
                    if(posX > caseNumber - 1) continue ;
                    for(let posY of closestCasesY){
                        if(posY < 1) continue ;
                        if(posY > caseNumber - 1) continue ;
                    
                        if(posX == case_.posX && posY == case_.posY) continue ;
                        
                        closestCasePos.push([posX, posY]) ;
                }
               }

               let casesList = []
               for(let pos of closestCasePos){
                    casesList.push(caseMatrix[pos[0] - 1][pos[1] - 1]) ;
               }

               let coloredCasesNumber = 0;
               for(let case_ of casesList){
                    if (case_.color == color) coloredCasesNumber++;
               }
            
               let newCase = {
                    posX: case_.posX ,
                    posY: case_.posY ,
                    element: case_.element,
                    color: case_.color
               }

               if(case_.color == color){
                    if(coloredCasesNumber > 3 || coloredCasesNumber < 2){
                        newCase.color = 'white' ;
                    }
               }
               else{
                    if(coloredCasesNumber == 3){
                        newCase.color = color ;
                    }
               }
               newCaseList.push(newCase) ;

            }
            newMatrix.push(newCaseList) ;
        }

        caseMatrix = newMatrix ;
    }

    function update(){
        for(let caseList of caseMatrix){
            for(let case_ of caseList){
                case_.element.style.backgroundColor = case_.color ;
            }
        }
    }


    function run(caseNumber, color){
        gameLoop = setInterval(()=>{
            execute(caseNumber, color) ;
            update() ;
        }, 50) ;        
    }
}