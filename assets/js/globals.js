const dynamicText = document.querySelector("#dynamic");
const words = ["Simple", "Sleek", "Effective"];
let charIndex = 0;
let wordIndex = 0;
let isDeleting = false;
let profile;
let flashcardSets;
let isLoggedIn = false;
const isEarlyAccess = true;

const CREATE_MODAL = (text, isClosable) => {
    document.querySelector("#modalbg").style.display = "block";
    document.querySelector("#modalbg").animate({
        opacity: ["0", "1"],
    }, {
        iterations: 1,
        duration: 500,
    })
    document.querySelector("#modal").innerHTML = text

    window.onclick = (ev) => {
        if (ev.target === document.querySelector("#modalbg")) {
            document.querySelector("#modalbg").animate({
                opacity: ["1", "0"],
            }, {
                iterations: 1,
                duration: 500,
            });
            setTimeout(() => {
                document.querySelector("#modalbg").style.display = "none"
            }, 490);
        };
    };
};