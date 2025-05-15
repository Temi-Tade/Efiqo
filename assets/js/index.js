const dynamicText = document.querySelector("#dynamic");
const words = ["Simple", "Sleek", "Effective"];
let charIndex = 0;
let wordIndex = 0;
let isDeleting = false;
let profile;
let flashcardSets;
let quizSets;
const isEarlyAccess = true;

function IS_EARLY_ACCESS() {
    if (isEarlyAccess) {
        CREATE_MODAL(`
            <p>Oops... This feature is not available during early access.</p>
        `);
    }
    return;
}

const TOGGLE_MATERIALS_LIST = (parent) => {
    parent.nextElementSibling.classList.toggle("expand");
};

const TYPE_EFFECT = () => {
    let currentWord = words[wordIndex];
    let currentChar = currentWord.substring(0, charIndex);
    dynamicText.textContent = currentChar;

    if (!isDeleting && charIndex < currentWord.length) {
        charIndex++;
        setTimeout(TYPE_EFFECT, 300);
    } else if (isDeleting && charIndex > 0) {
        charIndex--;
        setTimeout(TYPE_EFFECT, 200);
    } else {
        isDeleting = !isDeleting;
        wordIndex = !isDeleting ? (wordIndex + 1) % words.length : wordIndex;
        setTimeout(TYPE_EFFECT, 1750);
    };
};

//get saved flashcards
function GET_CARDS(){
    var request = indexedDB.open("efiqo");
    request.onsuccess = function(){
        var trx = request.result.transaction("flashcards");
        var objectStore = trx.objectStore("flashcards");
        var keys = objectStore.getAll();
        let savedData;
        
        keys.onsuccess = async function(ev){
            savedData = await ev.target.result;
            flashcardSets = savedData;
            document.querySelector("#recent ul").innerHTML = "Loading...";
            document.querySelector("#recent ul").innerHTML = "";
            
            document.querySelector("#recent ul").innerHTML = "";
            if (!ev.target.result.length) {
                document.querySelector("#recent ul").innerHTML = "<p class='no-data'>You have not created any sets yet.</p>";
            }

            await ev.target.result.forEach(flashcard => {
                let info = `"Decks: ${flashcard.number}\nCreated on: ${flashcard.created}\nId: ${flashcard.id}"`;
                document.querySelector("#recent ul").innerHTML += `
                    <li title=${info}>
                        <button class='saved-flashcard'>${flashcard.name}</button>
                    </li>
                `;
                document.querySelector(".quota").innerHTML = `Quota: ${ev.target.result.length}/7`;
            });

            [...document.querySelectorAll("#recent .saved-flashcard")].forEach((val, i) => {
                val.onclick = function(event){
                    event.preventDefault();
                    CREATE_MODAL(`
                        <div id='recent-info'>
                            <h3>${savedData[i].name} </h3>
                            <strong><em>${savedData[i].desc}</em></strong>
                            <table>
                                <tr>
                                    <th>Decks</th>
                                    <td>${savedData[i].number}</td>
                                </tr>
                                <tr>
                                    <th>Id</th>
                                    <td>${savedData[i].id}</td>
                                </tr>
                                <tr>
                                    <th>Created On</th>
                                    <td>${savedData[i].created}</td>
                                </tr>
                            </table>
                            <div id='recent-actions'>
                                <button id="open-recent">open <i class='fa-solid fa-arrow-up-right-from-square'></i></button>
                                <button id="del-recent">delete <i class='fa-solid fa-trash'></i></button>
                                </div>
                        </div>
                    `);

                    document.querySelector("#open-recent").onclick = function(){
                        sessionStorage.setItem("efiqo temp data", JSON.stringify(savedData[i]));
                        window.open("./assets/flashcard/index.html","_parent");
                    }
                    
                    document.querySelector("#del-recent").onclick = function(){
                        var confirmUserAction = confirm(`WARNING! You are about to delete the Set - ${savedData[i].name} and all its related data. This action cannot be reversed. Do you wish to continue?`);
                        if (confirmUserAction) {
                            var trx = request.result.transaction("flashcards", "readwrite");
                            var objectStore = trx.objectStore("flashcards");
                            objectStore.delete(savedData[i].id);
                            history.go(0);
                        }else{
                            alert("Delete operation cancelled by user.")
                        }
                    }
                }
            });
        }
    }
};

// get quizzes
function GET_QUIZZES(){
    var request = indexedDB.open("efiqo", 1);

    request.onsuccess = function(){
        var trx = request.result.transaction("quizzes", "readwrite");
        var quiz_objStore = trx.objectStore("quizzes");
        var data = quiz_objStore.getAll();

        data.onsuccess = async function (e) {
            var quizzes = await e.target.result;
            quizSets = quizzes;

            document.querySelector("#recent ul").innerHTML = "";
            if (!quizzes.length) {
                document.querySelector("#recent ul").innerHTML = "<p class='no-data'>You have not created any quizzes yet.</p>";
            document.querySelector(".quota").innerHTML = "";
            }

            quizzes.forEach(quiz => {
                let info = `"Questions: ${quiz.questions.length}\nCreated on: ${quiz.timeStamp}\nId: ${quiz.id}"`;
                document.querySelector("#recent ul").innerHTML += `
                <li title=${info}>
                    <button class='saved-quiz'>${quiz.title}</button>
                </li>
            `;
            document.querySelector(".quota").innerHTML = `Quota: ${quizzes.length}/7`;
            });

            [...document.querySelectorAll("#recent .saved-quiz")].forEach((val, i) => {
                val.onclick = function(event){
                    event.preventDefault();
                    CREATE_MODAL(`
                        <div id='recent-info'>
                            <h3>${quizzes[i].title} </h3>
                            <strong><em>${quizzes[i].desc}</em></strong>
                            <table>
                                <tr>
                                    <th>Questions</th>
                                    <td>${quizzes[i].questions.length}</td>
                                </tr>
                                <tr>
                                    <th>Id</th>
                                    <td>${quizzes[i].id}</td>
                                </tr>
                                <tr>
                                    <th>Created On</th>
                                    <td>${quizzes[i].timeStamp}</td>
                                </tr>
                            </table>
                            <div id='recent-actions'>
                                <button id="open-recent">open <i class='fa-solid fa-arrow-up-right-from-square'></i></button>
                                <button id="del-recent">delete <i class='fa-solid fa-trash'></i></button>
                                </div>
                        </div>
                    `);

                    document.querySelector("#open-recent").onclick = function(){
                        sessionStorage.setItem("efiqo temp data", JSON.stringify(quizzes[i]));
                        window.open("./assets/quiz/create/index.html","_parent");
                    }
                    
                    document.querySelector("#del-recent").onclick = function(){
                        var confirmUserAction = confirm(`WARNING! You are about to delete the Set - ${quizzes[i].title} and all its related data. This action cannot be reversed. Do you wish to continue?`);
                        if (confirmUserAction) {
                            var trx = request.result.transaction("quizzes", "readwrite");
                            var objectStore = trx.objectStore("quizzes");
                            objectStore.delete(quizzes[i].id);
                            history.go(0);
                        }else{
                            alert("Delete operation cancelled by user.")
                        }
                    }
                }
            });
        }
    }
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
    window.open(`./assets/${material === "flashcard" ? "flashcard" : "quiz/create"}/index.html`, "_parent");
}

GET_QUIZZES();
GET_CARDS();

async function INIT_SHARE(){
    IS_EARLY_ACCESS();
    if ("share" in navigator) {
        try {
            await navigator.share({
                text: "efIQo. Your all-in-one study toolkit!",
                title: "efIQo",
                url: "http://127.0.0.1:5500/",
                
            });
        } catch (error) {
            CREATE_MODAL("An error occured while trying to share.");
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
    document.querySelector("#modal").scrollTo({top: 0});
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
    var request = indexedDB.open("efiqo");

    request.onsuccess = function() {
        var trx = request.result.transaction("user_data");
        var objectStore = trx.objectStore("user_data");
        var keys = objectStore.getAll();

        keys.onsuccess = async function(ev) {
            profile = await ev.target.result[0];
            if (profile) {
                [...document.querySelectorAll(".premium")].map(el => {
                    el.style.display = profile.isPremiumUser ? "none" : "block";
                });
            } else {
                return;
            }
        }
    }
}

CHECK_PREMIUM();