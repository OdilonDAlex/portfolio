const project0 = document.querySelector('#project0') ;
const project1 = document.querySelector('#project1') ;
const project2 = document.querySelector('#project2') ;
const project3 = document.querySelector('#project3') ;
const project4 = document.querySelector('#project4') ;
const prevButton = document.querySelector('.carousel-control-prev'); 
const nextButton = document.querySelector('.carousel-control-next'); 
const skills = document.querySelectorAll('.skill') ;
const titles = document.querySelectorAll('h1');
const paragraphes = document.querySelectorAll('p');
const btns = document.querySelectorAll('.btn');

smoothReveal(titles, delay=25);
smoothReveal(btns, delay=50);
smoothReveal(paragraphes);
smoothReveal(skills, delay=100, interval=75);

run([project3, project4, project0, project1, project2]);

function run( elements, interval=4000, timeDistance=2000) {
    
    elements.forEach( element => {
        let carousel = new bootstrap.Carousel(element, {
            interval: interval,
            touch: true
        })
    
        interval += timeDistance;
        carousel.cycle();
    });

 };


 function smoothReveal(elements, delay=75, interval=25){

    elements.forEach(element => {
        ScrollReveal().reveal(element, {delay: delay});
        delay += interval;
    })
 }