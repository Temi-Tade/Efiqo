let flashcardSets;
let quizSets;
let flashcardsFromDB = [];
let quizzesFromDB = [];

if (new URLSearchParams(location.href).has("share_id") && (new URLSearchParams(location.href).get("type") === "flashcard") && localStorage.getItem("efiqo user data")) {
    CREATE_MODAL(document.querySelector(".loader-wrap").innerHTML); //spinner
    db.collection("users")
        .where("flashcards", "!=", "[]")
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc, i) => {
                if(doc.data().flashcards.length !== 0) flashcardsFromDB.push(...doc.data().flashcards);
        })
        
        flashcardsFromDB.forEach((flashcard, index) => {
            if (flashcard.id === new URLSearchParams(location.href).get("share_id")) {
                sessionStorage.setItem("efiqo temp data", JSON.stringify(flashcard));
                location.href = `https://efiqo-app.web.app/assets/flashcard/index.html?&share_id=${sessionStorage.getItem("efiqo share data")}&type=flashcard`
            }else if (index === flashcardsFromDB.length - 1 && !sessionStorage.getItem("efiqo temp data")) {
                alert("This flashcard does not exist, it may have been deleted by the creator.");
                location.href = `https://efiqo-app.web.app/`;
            }
        })
    })
    .catch((error) => {
        console.error(error);
        CREATE_MODAL("An error occured while trying to fetch data");
    })
}

if (new URLSearchParams(location.href).has("share_id") && (new URLSearchParams(location.href).get("type") === "quiz") && localStorage.getItem("efiqo user data")) {
    CREATE_MODAL(document.querySelector(".loader-wrap").innerHTML); //spinner
    db.collection("users")
        .where("quizzes", "!=", "[]")
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc, i) => {
                if(doc.data().quizzes.length !== 0) quizzesFromDB.push(...doc.data().quizzes);
        })
        
        quizzesFromDB.forEach((quiz, index) => {
            if (quiz.id === new URLSearchParams(location.href).get("share_id")) {
                sessionStorage.setItem("efiqo temp data", JSON.stringify(quiz));
                location.href = `https://efiqo-app.web.app/assets/quiz/create/index.html?&share_id=${sessionStorage.getItem("efiqo share data")}&type=quiz`
            } else if (index === quizzesFromDB.length - 1 && !sessionStorage.getItem("efiqo temp data")) {
                alert("This quiz does not exist, it may have been deleted by the creator.");
                location.href = `https://efiqo-app.web.app/`;
            }
        })
    })
    .catch((error) => {
        console.error(error);
        CREATE_MODAL("An error occured while trying to fetch data");
    })
}

const TOGGLE_MATERIALS_LIST = (parent) => {
    parent.nextElementSibling.classList.toggle("expand");
};

if (localStorage.getItem("efiqo user data")) getUserData(JSON.parse(localStorage.getItem("efiqo user data")).email);

//get saved flashcards
function GET_CARDS(target){
    if (localStorage.getItem("efiqo user data")) {
        profile = JSON.parse(localStorage.getItem("efiqo user data"));
        flashcardSets = profile.flashcards;
    } else {
        return;
    }

    target.innerHTML = "";
    if (flashcardSets.length === 0) {
        target.innerHTML = "<p class='no-data'>You have not created any sets yet.</p>";
    }

    flashcardSets.forEach(flashcard => {
        let info = `"Decks: ${flashcard.number}\nCreated on: ${flashcard.created}\nId: ${flashcard.id}"`;
        target.innerHTML += `
            <li title=${info}>
                <button class='saved-flashcard'>${flashcard.name}</button>
            </li>
        `;
    });
    
    document.querySelector(".quota").innerHTML = `Quota: ${flashcardSets.length}/7`;

    [...document.querySelectorAll(".saved-flashcard")].forEach((val, i) => {
        val.onclick = function(event){
            event.preventDefault();
            CREATE_MODAL(`
                <div id='recent-info'>
                    <h3>${flashcardSets[i].name}</h3>
                    <strong><em>${flashcardSets[i].desc}</em></strong>
                    <table>
                        <tr>
                            <th>Decks</th>
                            <td>${flashcardSets[i].number}</td>
                        </tr>
                        <tr>
                            <th>Id</th>
                            <td>${flashcardSets[i].id}</td>
                        </tr>
                        <tr>
                            <th>Created On</th>
                            <td>${flashcardSets[i].created}</td>
                        </tr>
                    </table>
                    <div id='recent-actions'>
                        <button id="open-recent">open <i class='fa-solid fa-arrow-up-right-from-square'></i></button>
                        <button id="del-recent">delete <i class='fa-solid fa-trash'></i></button>
                    </div>
                </div>
            `);

            document.querySelector("#open-recent").onclick = function(){
                sessionStorage.setItem("efiqo temp data", JSON.stringify(flashcardSets[i]));
                location.pathname = "./assets/flashcard/index.html";
            }
                    
            document.querySelector("#del-recent").onclick = function(){
                var confirmUserAction = confirm(`WARNING! You are about to delete the Set - ${flashcardSets[i].name} and all its related data. This action cannot be reversed. Do you wish to continue?`);
                if (confirmUserAction) {
                    profile.flashcards.splice(i, 1);
                    // console.log(profile.flashcards);
                    updateDB(profile.email, {flashcards: profile.flashcards}, () => history.go(0));
                    localStorage.setItem("efiqo user data", JSON.stringify(profile));
                }else{
                    alert("Delete operation cancelled by user.");
                    return;
                }
            }
        }
    });
};

// get quizzes
function GET_QUIZZES(target){
    if (localStorage.getItem("efiqo user data")) {
        profile = JSON.parse(localStorage.getItem("efiqo user data"));
        quizSets = profile.quizzes;
    } else {
        return;
    }
    
    target.innerHTML = "Loading...";
    target.innerHTML = "";
            
    target.innerHTML = "";
    if (quizSets.length === 0) {
        target.innerHTML = "<p class='no-data'>You have not created any sets yet.</p>";
    }

    quizSets.forEach(quiz => {
        let info = `"Questions: ${quiz.questions.length}\nCreated on: ${quiz.timeStamp}\nId: ${quiz.id}"`;
        target.innerHTML += `
            <li title=${info}>
                <button class='saved-quiz'>${quiz.name}</button>
            </li>
        `;
    });
    
    document.querySelector(".quota").innerHTML = `Quota: ${quizSets.length}/7`;

    [...document.querySelectorAll(".saved-quiz")].forEach((val, i) => {
        val.onclick = function(event){
            event.preventDefault();
            CREATE_MODAL(`
                <div id='recent-info'>
                    <h3>${quizSets[i].name} </h3>
                    <strong><em>${quizSets[i].desc}</em></strong>
                    <table>
                        <tr>
                            <th>Questions</th>
                            <td>${quizSets[i].questions.length}</td>
                        </tr>
                        <tr>
                            <th>Id</th>
                            <td>${quizSets[i].id}</td>
                        </tr>
                        <tr>
                            <th>Created On</th>
                            <td>${quizSets[i].timeStamp}</td>
                        </tr>
                    </table>
                    <div id='recent-actions'>
                        <button id="open-recent">open <i class='fa-solid fa-arrow-up-right-from-square'></i></button>
                        <button id="del-recent">delete <i class='fa-solid fa-trash'></i></button>
                    </div>
                </div>
            `);

            document.querySelector("#open-recent").onclick = function(){
                sessionStorage.setItem("efiqo temp data", JSON.stringify(quizSets[i]));
                location.pathname = "./assets/quiz/create/index.html";
            }
                    
            document.querySelector("#del-recent").onclick = function(){
                var confirmUserAction = confirm(`WARNING! You are about to delete the Set - ${quizSets[i].name} and all its related data. This action cannot be reversed. Do you wish to continue?`);
                if (confirmUserAction) {
                    profile.quizzes.splice(i, 1);
                    updateDB(profile.email, {quizzes: profile.quizzes}, () => history.go(0));
                    localStorage.setItem("efiqo user data", JSON.stringify(profile));
                }else{
                    alert("Delete operation cancelled by user.");
                    return;
                }
            }
        }
    });
}

function CREATE_NEW(material){
    if (sessionStorage.getItem("efiqo temp data")) {
        sessionStorage.removeItem("efiqo temp data");
    }

    if (!profile.isPremiumUser) {
        if (material === "flashcard" && flashcardSets.length >= 7) {
            CREATE_MODAL(document.querySelector("#get-premium").innerHTML);
            document.querySelector("#reason").innerHTML = "<h3>You have run out of free sets</h3><br/><p>Upgrade to premium to enjoy creating unlimited sets.</p><br/>";
            return;
        }else if (material === "quiz" && quizSets.length >= 7) {
            CREATE_MODAL(document.querySelector("#get-premium").innerHTML);
            document.querySelector("#reason").innerHTML = "<h3>You have run out of free sets</h3><br/><p>Upgrade to premium to enjoy creating unlimited sets.</p><br/>";
            return;
        }
    }
    location.pathname = `./assets/${material === "flashcard" ? "flashcard" : "quiz/create"}/index.html`;
}

GET_QUIZZES(window.innerWidth >= 600 ? document.querySelector("#sidebar-quizzes") : document.querySelector("#recent ul"));
GET_CARDS(window.innerWidth >= 600 ? document.querySelector("#sidebar-flashcards") : document.querySelector("#recent ul"));

async function INIT_SHARE(){
    if ("share" in navigator) {
        try {
            await navigator.share({
                text: "Make your study sessions more engaging with efIQo, your all-in-one study toolkit!",
                title: "efIQo",
                url: "https://efiqo-app.web.app/",
            });
        } catch (error) {
            console.error(error);
        }
    } else {
        CREATE_MODAL(`
            <p class=error-head>Share action not supported by device or browser.</p>
            <ul type='none' class='error'>
                <li>Try:</li>
                <li>Reloading this page</li>
                <li>Updating your browser</li>
                <li>Opening this page on a different browser</li>
                <li>Opening this page on a different device</li>
            </ul>
        `);
    }
}

function DISPLAY_TERMS(){
    CREATE_MODAL(`
        <h3>TERMS OF USE</h3>
        <ul class='privacy-policy error' type='none'>
            <li>By using our tool, you agree to the following terms and conditions:</li>
            <li>That some of your personal information would and information regarding your device, browser, operating system and location would be collected.</li>
            <li>That the collected information would be used for the following purposes:
                <ul type='none'>
                    <li>To provide and improve our services.</li>  
                    <li>To analyze how our tool is used.</li>  
                    <li>To protect our website and users.</li>  
                </ul>
            </li>
            <li>That we may share your personal information with third parties like service, hosting and analytic providers if required.</li>            
        </ul>

        <div class='error'>
            <h4>Your Rights</h4>
            <p>You reserve the right to:</p>
            <ul type='none'>
                <li>Access your personal information.</li>  
                <li>Correct your personal information.</li>
                <li>Delete your personal information.</li>  
            </ul>
        </div>

        <div class='error'>
            <h4>Update to Privacy Policy</h4>
            <p>&nbsp;We may update this Privacy Policy at intervals, we would notify you of any changes by posting it on our homepage.</p>
        </div>

        <div class='error'>
            <h4>Your Rights</h4>
            <p>&nbsp;For further enquires, contact us at <a href="mailto:tenderluxetechenterprises@gmail.com">tenderluxetechenterprises@gmail.com</a></p>
        </div>
    `);
}

function CHECK_PREMIUM(){
    if (JSON.parse(localStorage.getItem("efiqo user data"))) {
        [...document.querySelectorAll(".premium")].map(el => {
            el.style.display = JSON.parse(localStorage.getItem("efiqo user data")).isPremiumUser ? "none" : "block";
        });
    } else {
        return;
    }
}

CHECK_PREMIUM();

let dbData = [];

function getDataFromDB() {
    CREATE_MODAL(document.querySelector(".loader-wrap").innerHTML); //spinner
    window.onclick = function(e){
        if (e.target === document.querySelector("#modalbg")) {
            return;
        }
    }

    db.collection("users")
        .where("email", "!=", "")
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc, i) => {
                dbData.push(...doc.data().flashcards);
                dbData.push(...doc.data().quizzes);
            });

            document.querySelector("#filtered-list").innerHTML = "";
            dbData.forEach(data => {
                document.querySelector("#filtered-list").innerHTML += `
                    <li>
                        <button class='transparent-btn'>
                            <span class='name'>${data.name}</span>
                        </button>
                        <span class='${data.flashcards ? "fa-solid fa-layer-group" : "fa-regular fa-question-circle"} num'>
                            <small>${data.flashcards ? data.number : data.questions.length}</small>
                        </span>
                    </li>
                `; 
            })
            document.querySelector("#modalbg").style.display = 'none';

            [...document.querySelectorAll("#filtered-list button")].forEach((btn, i) => {
                btn.onclick = function(){
                    // console.log(dbData[i]);
                    sessionStorage.setItem("efiqo temp data", JSON.stringify(dbData[i]));
                    location.pathname = `./assets/${dbData[i].flashcards ? "flashcard" : "quiz/create"}/index.html`;
                }
            });
        })
        .catch((error) => {
            CREATE_MODAL("An error occured");
            console.error(error);
        })
}


function SEARCH_DB(param) {
    if (param.trim().length === 0) {
        document.querySelector("#filtered-list").innerHTML = "";
        dbData.forEach(data => {
            document.querySelector("#filtered-list").innerHTML += `
                <li>
                    <button class='transparent-btn'>
                        <span class='name'>${data.name}</span>
                    </button>
                    <span class='${data.flashcards ? "fa-solid fa-layer-group" : "fa-regular fa-question-circle"} num'>
                        <small>${data.flashcards ? data.number : data.questions.length}</small>
                    </span>
                </li>
            `;
        });

        return;
    }

    let filteredList = [];
    dbData.filter((data) => {
        if(data.name.toLowerCase().indexOf(param.trim().toLowerCase()) > -1){
            filteredList.push(data);
            document.querySelector("#filtered-list").innerHTML = "";

            filteredList.forEach((el, i) => {
                document.querySelector("#filtered-list").innerHTML += `
                    <li>
                        <button class='transparent-btn'>
                            <span class='name'>${el.name}</span>
                        </button>
                        <span class='${el.flashcards ? "fa-solid fa-layer-group" : "fa-regular fa-question-circle"} num'>
                            <small>${el.flashcards ? el.number : el.questions.length}</small>
                        </span>
                    </li>
                `;
            });
        }else{
            if (filteredList.length === 0) {
                document.querySelector("#filtered-list").innerHTML = `
                    <div class='search-not-found'>
                        <p style='font-size: 5rem'>🤔</p>
                        <p>Oops. We could not find what you are looking for.</p>
                    </div>
                `;
            }
        }
    })
}

function INIT_SEARCH() {
    dbData = [];
    getDataFromDB();
    document.querySelector('#search-wrap').removeAttribute('hidden');

    document.querySelector("#close-btn").onclick = function(){
        document.querySelector('#search-wrap').setAttribute('hidden', '');
    }
}

function INIT_PAY() {
    profile = JSON.parse(localStorage.getItem("efiqo user data"));
    let isBetaUser = BETA_USERS.some(user => user.email === profile.email);
    
    if (isBetaUser && !profile.isPremiumUser) {
        alert("For being a part of our early access users, you get 50% off on your first premium purchase!");
        CREATE_MODAL(document.querySelector("#betauserspaynow").innerHTML);
    } else {
        CREATE_MODAL(document.querySelector("#paynow").innerHTML);
    }
}

document.querySelector("#read-pdf-doc").onchange = function(e){
    const fileReader = new FileReader();
    const file = e.target.files[0];
    console.log(file);

    fileReader.onloadend = function (ev) {
        document.querySelector(".search-bar").style.display = "none";
        document.querySelector("#embed-wrap").style = "display: block";
        document.querySelector("#reading").style.height = "100%";
        document.querySelector("embed").src = ev.target.result;
        document.querySelector(".file-picker-wrap").style.display = "none";
        // widgets (fcs, quizzes)
        // timer
        // two PDFs 
        // collapse sidebar
        // responsive sidebar
    }

    fileReader.readAsDataURL(file);
     
    document.querySelector("#pdf-menu-btn").onclick = function(e) {
        if(e.target.classList.contains("fa-bars")) {
            e.target.setAttribute("class", "fa-solid fa-x");
            e.target.title = "Close Menu";
            document.querySelector(".embed-menu-options").style.height = "fit-content";
        }else{
            e.target.setAttribute("class", "fa-solid fa-bars");
            e.target.title = "Open Menu";
            document.querySelector(".embed-menu-options").style.height = "0";
        }
    }
    
    document.querySelector("#close-pdf-btn").onclick = function (e) {
        document.querySelector(".search-bar").style.display = "flex";
        document.querySelector("#embed-wrap").style = "display: none";
        document.querySelector("#reading").style.height = "90%";
        document.querySelector("embed").src = "";
        document.querySelector(".file-picker-wrap").style.display = "grid";
        document.querySelector(".file-picker-wrap input").value = "";

        document.querySelector("#pdf-menu-btn").setAttribute("class", "fa-solid fa-bars");
        document.querySelector("#pdf-menu-btn").title = "Open Menu";
        document.querySelector(".embed-menu-options").style.height = "0";

        if (document.fullscreenEnabled) {
            document.exitFullscreen();
        }
    }

    document.querySelector("#focus-mode-btn").onclick = function(e) {
        const element = document.querySelector("#embed-wrap");
        if (document.fullscreenElement) {
            document.exitFullscreen();
            e.target.innerHTML = "Focus Mode <i class='fa-solid fa-eye'></i>";
            return;
        }

        document.onfullscreenchange = function (e) {
            console.log(e)
        }

        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullScreen) {
            element.webkitRequestFullScreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullScreen) {
            element.msRequestFullScreen();
        }

        e.target.innerText = "Exit Focus Mode";
    }
}

function SEARCH_RECENT(param) {
    const recents = [...document.querySelectorAll(".saved-flashcard"), ...document.querySelectorAll(".saved-quiz")];

    // if (!param.trim()) return;

    recents.forEach((term => {
        if (term.innerHTML.toLowerCase().indexOf(param.toLowerCase().trim()) > -1) {
            term.parentElement.style.display = 'block';
        } else {
            term.parentElement.style.display = "none";
        }
    }));
}