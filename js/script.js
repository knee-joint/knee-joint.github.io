window.addEventListener('DOMContentLoaded', () => {
    const menu = document.querySelector('.menu'),
    hiddenMenu = document.querySelector('.hidden_menu'),
    menuItem = document.querySelectorAll('.menu_item');    
    // Это нужно отсюда убрать!
    let mainPreviewIdx = 0,
    curHero = "";
    // ----------
    
    




    const sliderInner = document.querySelector("div.top_preview_container .slider .slider__inner"),
          mainPreview = document.querySelector("div.main_preview_hero"),
          
          skins = {};


    function bindHiddenMenu() {
        hiddenMenu.addEventListener("click", () => {
            // menu.classList.toggle('menu_hide');
            menu.classList.toggle('menu_show');
        });

        menuItem.forEach(item => {
            item.addEventListener('click', () => {
                menu.classList.toggle('menu_show');
                // menu.classList.toggle('menu_hide');
            });
        });
    }

    class Hero {
        constructor(name, skins) {
            this.name = name;
            this.skins = skins;
        }


        createElement() {
            const hero = document.createElement('div');
            hero.classList.add("hero");
            hero.style.background = `url("${this.skins[0]}") center center/contain no-repeat`;
            hero.id = this.name; 

            return hero;
        }

    }

    const heroesData = {};

    
    async function getAndRenderHeroes(serverUrl, countOfVisibleHeroes, visibleSlides, invisibleSlides) {
        return await fetch(serverUrl)
            .then(data => data.json())
            .then(data => {
                // Render heroes to top_preview and main_preview
                data.heroes.forEach((item, i) => {
                    const hero = new Hero(item.name, item.skins);
                    heroesData[item.name] = hero;
                    const heroElement = hero.createElement();

                    if (i < countOfVisibleHeroes) {
                        visibleSlides.push(heroElement);
                        sliderInner.insertAdjacentElement("afterbegin", heroElement);
                    } else {
                        invisibleSlides.push(heroElement);
                    }

                    if (i === 0) {
                        curHero = hero.name;
                    }
                });

                return data;
            });          
    }




    function bindSwitchMainPreview() {
        document.querySelector(".top_preview_container").addEventListener("click", e => {
            const hero = e.target.id;
            if (hero) {
                mainPreviewIdx = 0;

                curHero = heroesData[hero].name;
                mainHeroRender(curHero, mainPreviewIdx);
            }
        });
    }

    function getTransformValue(element) {
        return element.style.getPropertyValue("transform").slice(11, -3);
    }

    function bindSwitchToTopButtons(visibleSlides, invisibleSlides, offset) {
        const leftButton = document.querySelector("div.top_preview_container .buttons .left_button"),
              rightButton = document.querySelector("div.top_preview_container .buttons .right_button");


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
    
    const mainPreviewHero = document.querySelector(".main_preview_hero");
    const mainPreviewContainer = document.querySelector(".main_preview_container");

    function renderMainPreviewSkins(curHero, mainPreviewIdx) {
        const mainPreviewSkins = document.querySelectorAll(".main_preview_hero__skin");
        const amountSkins = heroesData[curHero].skins.length;
        const leftSkinIdx = mainPreviewIdx + 1 >= amountSkins ? 0 : mainPreviewIdx + 1;
        const rightSkinIdx = mainPreviewIdx - 1 < 0 ? amountSkins - 1 : mainPreviewIdx - 1;
        mainPreviewSkins[0].style.background = `url("${heroesData[curHero].skins[leftSkinIdx]}") center center/cover no-repeat`;
        mainPreviewSkins[2].style.background = `url("${heroesData[curHero].skins[rightSkinIdx]}") center center/cover no-repeat`;
    }

    function mainHeroRender(heroName, curIdx) {
        // const element = document.documentElement;
        if (curIdx === 0) {
            document.documentElement.style.setProperty("--main-color", "black");
        } else {
            document.documentElement.style.setProperty("--main-color", "rgb(90, 90, 90)");
        }
        // hero.src = heroesData[curHero].skins[curIdx];
        // hero.alt = `hero ${curHero}`;
        mainPreview.style.background = `url("${heroesData[heroName].skins[curIdx]}") center center/cover no-repeat`;
        renderMainPreviewSkins(curHero, curIdx);
        // console.log(`url('${heroesData[heroName].skins[curIdx]}') center center cover no-repeat`);
        // console.log(getComputedStyle(element).getPropertyValue("--main-color"));
        // mainPreview.insertAdjacentElement('afterbegin', hero);
    }

    

    mainPreviewContainer.addEventListener("click", (event) => {
        if (event.target.className === "left_arrow") {
            if (mainPreviewIdx <= 0) {
                mainPreviewIdx = heroesData[curHero].skins.length - 1;
            } else {
                mainPreviewIdx -= 1;
            }
        } else if (event.target.className === "right_arrow") {
            if (mainPreviewIdx >= heroesData[curHero].skins.length - 1) {
                mainPreviewIdx = 0;
            } else {
                mainPreviewIdx += 1;
            }
        }
        mainHeroRender(curHero, mainPreviewIdx);
        renderMainPreviewSkins(curHero, mainPreviewIdx);
    });
    
    function createSlider(sliderInner, visibleSlides, invisibleSlides) {
        const slideWidth = visibleSlides[3].offsetWidth + 1;
        visibleSlides.forEach(item => {
            item.style.width = `${slideWidth}px`;
        });
        invisibleSlides.forEach(item => {
            item.style.width = `${slideWidth}px`;
        });

        sliderInner.style.marginLeft = `-${slideWidth * 2 + 2}px`;
        sliderInner.style.width = `${slideWidth * (visibleSlides.length + invisibleSlides.length)}px`;
        return slideWidth;
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



    (async function main() {
        const countOfVisibleHeroes = 5,
              visibleSlides = [], 
              invisibleSlides = [];

        const data = await getAndRenderHeroes("server.json", countOfVisibleHeroes, visibleSlides, invisibleSlides);
        const offset = createSlider(sliderInner, visibleSlides, invisibleSlides);
        beautifySlides(visibleSlides, invisibleSlides, offset);
        bindHiddenMenu();
        bindSwitchToTopButtons(visibleSlides, invisibleSlides, offset);
        mainHeroRender(curHero, mainPreviewIdx);
        renderMainPreviewSkins(curHero, mainPreviewIdx);
        bindSwitchMainPreview();
    })();


});
