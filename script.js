"use strict";


document.addEventListener("DOMContentLoaded", () => {
    function defineSlidersWidth() {

    }

    const colorsPallete = ["red", "green", "blue", "gray", "pink", "cyan", "brown", "yellow"],
          sliderInner = document.querySelector(".slider .slider-inner");
        

    function createSlides(countOfSlides, sliderInner, countOfVisibleSlides, visibleSlides, invisibleSlides){
        if (countOfSlides <= 0) {
            return;
        }

        for (let i = 0; i < countOfSlides; i++) {
            const element = document.createElement("div");
            element.classList.add("slider-inner__item");
            element.style.backgroundColor = colorsPallete[i];
            element.addEventListener("click", () => {
                document.querySelector("body").style.backgroundColor = element.style.backgroundColor;
            });
            console.log(document);
            if (i < countOfVisibleSlides) {
                sliderInner.append(element);
                visibleSlides.push(element);
            } else {
                invisibleSlides.push(element);
            }
        }
    }

    function computeSlidersWidth(sliderInner, slides) {
        slides.forEach(element => {
            element.style.width = `${element.clientWidth}px`; 
        });

        sliderInner.style.width = `${slides[0].offsetWidth * (slides.length)}px`;
        sliderInner.style.marginLeft = `-${slides[0].offsetWidth * 2}px`;
    }

    function getTransformValue(element) {
        return element.style.getPropertyValue("transform").slice(11, -3);
    }

    function bindSwitchToTopButtons(visibleSlides, invisibleSlides) {
        const leftButton = document.querySelector("#left-button"),
              rightButton = document.querySelector("#right-button");

        let offset = visibleSlides[0].offsetWidth;

        function moveSlides(offset) {
            let firstCoordX = +getTransformValue(visibleSlides[0]);
            firstCoordX += offset;
            let coordX = firstCoordX ? firstCoordX : 0;
            offset = offset >= 0 ? offset : -offset; 
            visibleSlides.forEach(item => {
                item.style.transform = `translateX(${coordX}px)`;
                coordX += offset;
            });
        }


        let timer;

        function moveSlidesToLeft() {
            const element = invisibleSlides.pop(0);
            visibleSlides.push(element);
            sliderInner.insertAdjacentElement("beforeend", element);

            moveSlides(-offset);

            const firstElement = visibleSlides.shift();
            invisibleSlides.push(firstElement);
            firstElement.remove();
            firstElement.style.transform = "None";
        }

        function moveSlidesToRight() {
            const element = invisibleSlides.pop();
            visibleSlides.unshift(element);
            sliderInner.insertAdjacentElement("afterbegin", element);


            moveSlides(offset);

            const lastElement = visibleSlides.pop();
            invisibleSlides.unshift(lastElement);
            lastElement.remove();
            lastElement.style.transform = "None";
        }

        let shifting = false;

        function wrapperSlidersSwitch(func, clickDelay, autoSwitchDelay) {
            if (!timer) {
                if (!shifting) {
                    shifting = true;
                    func();
                    setTimeout(() => shifting = false, clickDelay);
                }
                timer = setInterval(func, autoSwitchDelay);
            }
        }

        leftButton.addEventListener('mousedown', () => {
            wrapperSlidersSwitch(moveSlidesToRight, 300, 400);
        });

        rightButton.addEventListener('mousedown', () => {
            wrapperSlidersSwitch(moveSlidesToLeft, 300, 400);
        });

        leftButton.addEventListener('touchstart', () => {
            wrapperSlidersSwitch(moveSlidesToRight, 300, 400);
        });

        rightButton.addEventListener('touchstart', () => {
            wrapperSlidersSwitch(moveSlidesToLeft, 300, 400);
        });

        document.addEventListener('mouseup', () => {
            if (timer){
               clearInterval(timer);
               timer = undefined;
            }
        });

        document.addEventListener('touchend', () => {
            if (timer){
               clearInterval(timer);
               timer = undefined;
            }
        });

    }

    function beautifySlides(visibleSlides, invisibleSlides, offset) {
        let x = 0;
        const firstClone = invisibleSlides.shift();
        sliderInner.insertAdjacentElement("afterbegin", firstClone);
        visibleSlides.unshift(firstClone);

        const lastClone = invisibleSlides.pop();
        sliderInner.insertAdjacentElement("beforeend", lastClone);
        visibleSlides.push(lastClone);



        visibleSlides.forEach(item => {
            x += offset;
            item.style.transform = `translateX(${x}px)`;
        });
    }

    (function main () {
        const countOfVisibleSlides = 5,
              countOfSlides = 8,
              visibleSlides = [],
              invisibleSlides = [];
        createSlides(countOfSlides, sliderInner, countOfVisibleSlides, visibleSlides, invisibleSlides);
        const offset = visibleSlides[0].offsetWidth;
        computeSlidersWidth(sliderInner, visibleSlides);
        beautifySlides(visibleSlides, invisibleSlides, offset);
        bindSwitchToTopButtons(visibleSlides, invisibleSlides);
    })();
});