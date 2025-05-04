let index = 0;
let isEdit = false;
let card;
var flashcardData = sessionStorage.getItem("efiqo temp data") ? JSON.parse(sessionStorage.getItem("efiqo temp data")) : {
    name: "",
    desc : "",
    flashcards: [],
    number: 0,
    id : crypto.randomUUID(),
    created : new Date().toUTCString(),
};

const TOGGLE_FORMS = (e, el, other) => {
    e.preventDefault();
    
    var trx = request.result.transaction("flashcards", "readwrite");
    var flashcardObjStore = trx.objectStore("flashcards");
    flashcardObjStore.add(flashcardData);
    sessionStorage.setItem("efiqo temp data", JSON.stringify(flashcardData));

    if (el.style.display === "block") {
        el.style.display = "none";
        other.style.display = "flex";
    }else{
        el.style.display = "none";
        other.style.display = "flex";
    }

    document.querySelector("#info h3").innerHTML = flashcardData.name;
    document.querySelector("#info em").innerHTML = flashcardData.desc;
};

const VALIDATE_FLASHCARD_NAME = (val) => {
    if (val.length >= 4) {
        document.querySelector("#flashcard-name-btn").disabled = false;
    } else {
        document.querySelector("#flashcard-name-btn").disabled = true;
    }
    flashcardData.name = val;
}

const SET_DESC = (val) => {
    flashcardData.desc = val;
}

const CREATE_MODAL = (text) => {
    document.querySelector("#modalbg").style.display = "block"
    document.querySelector("#modalbg").animate({
        opacity: ["0", "1"],
    }, {
        iterations: 1,
        duration: 500,
    });
    document.querySelector("#modal").innerHTML = text;

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

function ROTATE_CARD(card) {
    card.animate({
        transform: ["rotateY(-180deg)", "rotateY(0deg)"]
    }, {
        duration: 250,
        iterations: 1
    });
    if (card.querySelector(".card-text").innerHTML === flashcardData.flashcards[index].term) {
        card.querySelector(".card-text").innerHTML = flashcardData.flashcards[index].img ? `<img src='${flashcardData.flashcards[index].img.url}'/>` : "";
        card.querySelector(".card-text").innerHTML += `<div>${flashcardData.flashcards[index].def}</div>`;
    } else {
        card.querySelector(".card-text").innerHTML = flashcardData.flashcards[index].term;
    };
};

const ANIMATE_CARD = (direction) => {
    document.querySelector(".card").animate({
        transform: [`translateX(${direction === "prev" ? "-10rem" : "10rem"})`, "translateX(0)"],
    }, {
        duration: 200,
        iterations: 1
    });
}

const PREVIEW_CARD = (content) => {
    document.querySelector("#preview").innerHTML = `
        <div class='card-wrap' onclick=ROTATE_CARD(this) oncontextmenu=SHOW_MENU(event) ontouchstart=TOUCH_START(event) ontouchend=TOUCH_END(event)>
            <div class="card">
                <p class="card-text">${content}</p>
            </div>
        </div>
    `;

    let startX, startY;
    TOUCH_START = (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }

    TOUCH_END = (e) => {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;

        const diffX = endX - startX;
        const diffY = endY - startY;

        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0) {
                GO_TO_PREV_CARD();
            } else {
                GO_TO_NEXT_CARD();
            }
        }
    }

    SHOW_MENU = (e) => {
        e.preventDefault();
        document.querySelector("#contextmenu").style = `display: block; top: 20%; left: 30%`;
        window.onclick = (e) => {
            if (e.target !== document.querySelector("#contextmenu")) {
                document.querySelector("#contextmenu").style.display = "none";
            };
        };
    };
};

const ADD_CARD = () => {
    // index = 0;
    document.querySelector("#preview").innerHTML = "";
    if (!isEdit) {
        index = flashcardData.flashcards.length - 1;
    }
    PREVIEW_CARD(flashcardData.flashcards[index].term);
    FLASHCARD_COUNT();
    SET_PROGRESS();
};

//code for flashcard starts here //

class Flashcard{
    constructor(term, def, img){
        this.term = term;
        this.def = def;
        this.img = img;
    };
    add(){
        if (flashcardData.flashcards.length >= 20) {
            CREATE_MODAL(document.querySelector("#get-premium").innerHTML);
            document.querySelector("#reason").innerHTML = "<h3>You have run out of free flashcards</h3><br/><p>Upgrade to premium to enjoy creating unlimited flashcards.</p><br/>";
            return;
        } else {
            flashcardData.flashcards.push({
                term: this.term,
                def: this.def,
                img: this.img,
            });
            var trx = request.result.transaction("flashcards", "readwrite");
            var flashcardObjStore = trx.objectStore("flashcards");
            var data = flashcardObjStore.get(flashcardData.id);
    
            data.onsuccess = function(){
                flashcardData.number = flashcardData.flashcards.length;
                flashcardObjStore.put(flashcardData);
            }   
        }
    }
    delete(ind){
        flashcardData.flashcards.splice(ind, 1);
        flashcardData.number = flashcardData.flashcards.length;
    }
    edit(i){
        CREATE_MODAL(`
            <h3>Edit flashcard</h3>
            <form autocomplete="off" spellcheck="false">
                ${document.querySelector("#flashcard-data form").innerHTML}
            </form>
        `);
        document.querySelector("#modal #main-file-picker").id = "edit-file-picker";
        document.querySelector("#modal #added-images").id = "edit-added-images";
        document.querySelector("#modal #add-image").id = "edit-add-image";
        document.querySelector("#modal label").setAttribute("for", "edit-add-image");
        document.querySelector("#modal .number").style.display = "none";
        document.querySelector("#modal form button").textContent = "Save Changes";
        document.querySelector("#modal form #term").value = flashcardData.flashcards[i].term;
        document.querySelector("#modal form #def").value = flashcardData.flashcards[i].def;

       if(flashcardData.flashcards[i].img) document.querySelector("#edit-added-images").innerHTML = `<img width='100' src='${flashcardData.flashcards[i].img.url}'/>`;

        document.querySelector("#modal form").onsubmit = (e) => {
            e.preventDefault();
            flashcardData.flashcards[i] = new Flashcard(document.querySelector("#modal form #term").value, document.querySelector("#modal form #def").value, sessionStorage.getItem("flashcard-image") ? JSON.parse(sessionStorage.getItem("flashcard-image")) : undefined);
            ADD_CARD();
            isEdit = !isEdit;
            var trx = request.result.transaction("flashcards", "readwrite");
            var objectStore = trx.objectStore("flashcards");
            var data = objectStore.get(flashcardData.id);
        
            data.onsuccess = function(){
                objectStore.put(flashcardData);
            }
            document.querySelector("#modalbg").animate({
                opacity: ["1", "0"],
            }, {
                iterations: 1,
                duration: 500
            })
            setTimeout(() => {
                document.querySelector("#modalbg").style.display = "none"
            }, 490);
        }
    }
}

function ADD_IMAGE(filepicker) {
    // console.log(e);
    var file = filepicker.files[0];
    var fileReader = new FileReader();
    
    fileReader.onload = function(ev) {
        if (isEdit) {
            document.querySelector("#edit-added-images").innerHTML = `<img width='70' src='${ev.target.result}'/>`;
        }else{
            document.querySelector("#added-images").innerHTML = `<img width='70' src='${ev.target.result}'/>`;
        }
        sessionStorage.setItem("flashcard-image", JSON.stringify({name: file.name ,url: ev.target.result}));
    }

    fileReader.readAsDataURL(file);
    filepicker.parentElement.previousElementSibling.value = file.name;
}

function MOBILE_PREVIEW(el) {
    if (el.classList.contains("set-up")) {
        document.querySelector("#flashcard-preview").style.display = "block";
        document.querySelector("#flashcard-data form").style.display = "none";
        el.innerHTML = "&larr;";
        el.setAttribute("class", "prev");
    } else {
        document.querySelector("#flashcard-preview").style.display = "none";
        document.querySelector("#flashcard-data form").style.display = "block";
        el.innerHTML = "Preview Flashcards";
        el.setAttribute("class", "set-up");
    }
}

document.querySelector("#flashcard-data form").onsubmit = (ev) => {
    ev.preventDefault();
    card = new Flashcard(document.querySelector("#flashcard-data form #term").value.trim(), document.querySelector("#flashcard-data form #def").value.trim(), sessionStorage.getItem("flashcard-image") ? JSON.parse(sessionStorage.getItem("flashcard-image")) : undefined);
    card.add();
    ADD_CARD();
    // FLASHCARD_COUNT();
    document.querySelector("#flashcard-data form").reset();
    sessionStorage.removeItem("flashcard-image");
    document.querySelector("#added-images").innerHTML = "";
}

function DELETE_FLASHCARD(){
    document.querySelector("#contextmenu").style.display = "none";
    card = new Flashcard(flashcardData.flashcards[index].term, flashcardData.flashcards[index].def);
    card.delete(index);
    // console.log(flashcardData);
    var trx = request.result.transaction("flashcards", "readwrite");
    var flashcardObjStore = trx.objectStore("flashcards");
    flashcardObjStore.put(flashcardData);
    if (flashcardData.flashcards.length) {
        PREVIEW_CARD(flashcardData.flashcards[0].term);
        index = 0;
        FLASHCARD_COUNT();
        SET_PROGRESS();
    }else{
        document.querySelector("#preview").innerHTML = "<p style='padding: 1rem; text-align: center'>No flashcards added yet.</p>";
        document.querySelector("#flashcard-count").innerHTML = "";
        document.querySelector("#level").style.width = "0%";
    }
}

function EDIT_CARD(){
    if (!flashcardData.flashcards.length) {
        CREATE_MODAL('OOPS... You have not added any flashcards yet.');
        return;
    }
    document.querySelector("#contextmenu").style.display = "none";
    isEdit = !isEdit;
    card = new Flashcard(flashcardData.flashcards[index].term, flashcardData.flashcards[index].def, );
    card.edit(index);
}

const GO_TO_PREV_CARD = () => {
    try{
        if (index <= 0) {
            index = 0;
            if (flashcardData.flashcards.length) {
                CREATE_MODAL("<p class='error-head'>You have reached the first flashcard</p>");                
            }else{
                CREATE_MODAL('OOPS... You have not added any flashcards yet.');
            }
        }else{
            index--;
            PREVIEW_CARD(flashcardData.flashcards[index].term);
            ANIMATE_CARD("prev");
            FLASHCARD_COUNT();
            SET_PROGRESS();
        }
    }catch(error){
        // console.log(error);
    }
}

const GO_TO_NEXT_CARD = () => {
    try{
        if (index >= flashcardData.flashcards.length - 1) {
            index = flashcardData.flashcards.length - 1;
            if (flashcardData.flashcards.length) {
                CREATE_MODAL(`
                    <p class='error-head'>You have reached the last Flashcard.</p>
                    <div class='end-of'>
                        <button onclick='history.go(-1)'>Go to Home <i class='fa-solid fa-home'></i></button>
                    </div>
                `);
            }else{
                CREATE_MODAL('OOPS... You have not added any flashcards yet.');
            }
        }else{
            index++;
            PREVIEW_CARD(flashcardData.flashcards[index].term);
            ANIMATE_CARD("next");
            SET_PROGRESS();
            FLASHCARD_COUNT();
        }
    }catch(error){
        // console.log(error);
    }
}

const FLASHCARD_COUNT = () => {
    document.querySelector("#flashcard-count").innerHTML = `${index+1} of ${flashcardData.flashcards.length}`;
    document.querySelector(".number").innerHTML = flashcardData.flashcards.length ? `${flashcardData.flashcards.length} ${flashcardData.flashcards.length > 1 ? "flashcards" : "flashcard"} added` : "No flashcards added yet.";
}

const SET_PROGRESS = () => {
    document.querySelector("#level").style.width = `${((index + 1) / flashcardData.flashcards.length) * 100}%`
}

//todo: user must close any active sessions to create new FC
if (sessionStorage.getItem("efiqo temp data")) {
    request.onsuccess = function(){
        var trx = request.result.transaction("flashcards", "readwrite");
        var flashcardObjStore = trx.objectStore("flashcards");
        var x = flashcardObjStore.get(flashcardData.id);
        x.onsuccess = function (ev) {
            sessionStorage.setItem("efiqo temp data", JSON.stringify(ev.target.result));
            flashcardData = ev.target.result;
            document.querySelector("title").innerHTML = `efIQo | ${flashcardData.name}`;
            if (flashcardData.flashcards.length) {
                PREVIEW_CARD(flashcardData.flashcards[0].term);
                // ADD_CARD();
                SET_PROGRESS();
                FLASHCARD_COUNT();
            }
        }
    }

    document.querySelector("#flashcard-data").style.display = "flex";
    document.querySelector("#flashcard-name").style.display = "none";
    
    var session = JSON.parse(sessionStorage.getItem("efiqo temp data"));
    // document.querySelector("h1").innerHTML = "";
    document.querySelector("#info h3").innerHTML = session.name;
    document.querySelector("#info em").innerHTML = session.desc;

    flashcardData = session;
    flashcardData.flashcards = session.flashcards;
    if (flashcardData.flashcards.length) {
        PREVIEW_CARD(flashcardData.flashcards[0].term);
        SET_PROGRESS();
        FLASHCARD_COUNT();
    }else{
        document.querySelector("#preview").innerHTML = "<p style='padding: 1rem; text-align: center'>No flashcards added yet.</p>";
    }
}