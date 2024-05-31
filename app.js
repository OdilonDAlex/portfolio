const project0 = document.querySelector('#project0') ;
const project1 = document.querySelector('#project1') ;
const project2 = document.querySelector('#project2') ;
const prevButton = document.querySelector('.carousel-control-prev'); 
const nextButton = document.querySelector('.carousel-control-next'); 
const skills = document.querySelectorAll('.skill') ;


run([project0, project1, project2]);

function run( elements ) {
    
    elements.forEach( element => {
        let carousel = new bootstrap.Carousel(element, {
            interval: 2000,
            touch: true
        })
    
        carousel.cycle();
    });

 };


 function smoothReveal(elements, delay=0, interval=75){

    elements.forEach(element => {
        scrollreveal().reveal(element, {delay: delay});
        delay += interval;
    })
 }