let quizData;
let ind = 0;
const QUIZ_DATA_FORM = document.querySelector("#quiz-data form");

if (JSON.parse(sessionStorage.getItem("efiqo temp data"))){
    quizData = JSON.parse(sessionStorage.getItem("efiqo temp data"));
    hide(QUIZ_DATA_FORM);
    show(document.querySelector("#quiz-wrap"));
} 

const QUIZ_FORM = document.querySelector("#quiz-form");
const QUESTIONS = quizData ? quizData.options : [];

var quiz;
var question;

class Quiz{
    constructor(title, desc){
        this.title = title;
        this.desc = desc;
        this.questions = [];
        this.mode = "create";
        this.id = crypto.randomUUID();
        this.timeStamp = new Date().toUTCString();
    }

    addQuestion(question){
        this.questions.push(question);
    }
}

class Question {
    constructor(question){
        this.question = question;
        this.options = [];
        this.answer = undefined;
    }

    setOption(option){
        if (this.options.includes(option)) {
            CREATE_MODAL("this option already exists");
            return
        }
        this.options.push(option);
        this.populateOptions();
    }
    
    removeOption(option){
        this.options.splice(this.options.indexOf(option), 1);
        if(this.options.length < 2) hide(document.querySelector("#submit"));
        this.populateOptions();
    }
    
    setAnswer(answer){
        this.answer = answer;
        if(this.options.length >= 2) show(document.querySelector("#submit"));
        [...document.querySelectorAll(".is-answer")].forEach(el => {
            el.innerHTML = "";
        })
    }

    populateOptions(){
        document.querySelector("#option-list").innerHTML = "";
        this.options.map(text => {
            document.querySelector("#option-list").innerHTML += `
            <li>
                <span class='option-text'>${text}</span>
                <button class='remove-option-btn transparent-btn'>&times;</button>
                <input type='radio' name='answer' class='answer' value=${text} title='Set Answer'/>
                <small class='is-answer'></small>
            </li>`;
        });

        [...document.querySelectorAll(".remove-option-btn")].forEach(button => {
            button.onclick = (ev) => {
                this.removeOption(ev.target.previousElementSibling.textContent);
            }
        });

        [...document.querySelectorAll(".answer")].forEach((input, i) => {
            input.onchange = () => {
                console.log(question)
                if(input.checked) hide(document.querySelector("#no-answer"));
                question.setAnswer(input.value);
                input.nextElementSibling.innerHTML = "<em>answer</em>";
            }
        })
    }

    addToQuiz(){
        QUESTIONS.push(this);
    }
}

function validateInput(inputElement, button){
    button.disabled = inputElement.value.trim() ? false : true;
}

function hide(el) {
    el.setAttribute("hidden", "");
}

function show(el){
    el.removeAttribute("hidden");
}

function getQuizInfo(){
    var quizInfo = quizData ? quizData : quiz;

    document.querySelector("#quiz-details").innerHTML = `
        <div class='quiz-title'>
            <h3>${quizInfo.title}</h3>
        </div>
        <p><small>${quizInfo.desc}</small></p>
        <div class='quiz-config-options'>
        <p>Mode: ${quizInfo.mode}</p>
            <button id='preview-btn' class='transparent-btn preview-btn' onclick="PREVIEW_QUIZ(ind)">Check Preview</button>
        </div>
    `
}

if(quizData) getQuizInfo();

QUIZ_DATA_FORM.onsubmit = function (event) {
    event.preventDefault();
    quiz = new Quiz(event.target.querySelector("#quiz-name").value.trim(), event.target.querySelector("#quiz-desc").value.trim());
    sessionStorage.setItem("efiqo temp data", JSON.stringify(quiz));
    quizData = JSON.parse(sessionStorage.getItem("efiqo temp data"));
    QUIZ_DATA_FORM.reset();
    hide(event.target.parentElement);
    show(document.querySelector("#quiz-wrap"));

    var request = indexedDB.open("efiqo", 1);

    request.onsuccess = function(){
        var trx = request.result.transaction("quizzes", "readwrite");
        var quiz_objStore = trx.objectStore("quizzes");

        quiz_objStore.put(quiz);
        getQuizInfo();
    }
}

function createQuestion(text){
    question = new Question(text);
    show(document.querySelector("#option"));
    show(document.querySelector("#question-preview"));
    console.log(question);
    document.querySelector("#question-preview").innerHTML = `
        <h3>${question.question}</h3>
        <p id='no-answer'><em>No answer selected</em></p>
        <ul id='option-list'></ul>
    `;
}

function addOption(option){
    question.setOption(option.value.trim()); 
    option.value = "";
    option.nextElementSibling.disabled = true;
    hide(document.querySelector("#submit"));
    show(document.querySelector("#no-answer"));
    console.log(question);
}

QUIZ_FORM.querySelector("#add-to-quiz-btn").onclick = function(){
    if (quizData.questions.length >= 20) {
        CREATE_MODAL(document.querySelector("#get-premium").innerHTML);
        document.querySelector("#reason").innerHTML = "<h3>You have run out of free flashcards</h3><br/><p>Upgrade to premium to enjoy creating unlimited flashcards.</p><br/>";
        return;
    }

    QUIZ_FORM.querySelector("#question").value = "";
    document.querySelector("#create-question-btn").disabled = true;
    if(quizData){
        quizData.questions.push(question);
        quiz = quizData;
    }else{
        quiz.addQuestion(question);
    }

    console.log(quiz);

    document.querySelector("#question-preview").innerHTML = "";
    hide(document.querySelector("#submit"));
    hide(document.querySelector("#option"));


    var request = indexedDB.open("efiqo", 1);

    request.onsuccess = function(){
        var trx = request.result.transaction("quizzes", "readwrite");
        var quiz_objStore = trx.objectStore("quizzes");

        var data = quiz_objStore.get(quizData ? quizData.id : quiz.id);
        data.onsuccess = function(){
            quiz_objStore.put(quiz);
            quizData = quiz;
            sessionStorage.setItem("efiqo temp data", JSON.stringify(quizData));
        }
    }
}

function PREVIEW_QUIZ(index) {
    if(location.pathname.includes("attempt")) document.querySelector("#next-btn").disabled = true;
    show(document.querySelector("#quiz-preview-wrap"));
    hide(document.querySelector("#question-preview"));
    hide(document.querySelector("#quiz-form"));
    document.querySelector("#preview-btn").style.display = 'none'

    // if(!quizData) return;
    if (quizData.questions.length < 1) {
        document.querySelector("#quiz-preview").innerHTML = "<p style='text-align: center; font-style: italic'>No questions added yet.</p>"
    }
    if(quizData){
        quizData.mode = "preview";
    }else{
        quiz.mode = "preview";
    }
    getQuizInfo();

    document.querySelector(".back-btn").onclick = function(){
        hide(document.querySelector("#quiz-preview-wrap"));
        show(document.querySelector("#question-preview"));
        show(document.querySelector("#quiz-form"));

        if(quizData){
            quizData.mode = "create";
        }else{
            quiz.mode = "create";
        }
        getQuizInfo();
    }

    if(quizData.questions.length === 0) return;
    // quizData.questions.forEach((question, index) => {
        document.querySelector("#quiz-preview").innerHTML = `
            <div class='question-wrap'>
                <p class='question-count'>Question ${ind+1} of ${quizData.questions.length}</p>
                <div class="progress-wrap">
                    <div class="progress">
                        <span class="level" style='width: ${((ind+1)/quizData.questions.length)*100}%'></span>
                    </div>
                </div>
                <div class='question'>
                    ${quizData.questions[index].question}
                </div>
                <ul class='options'></ul>
            </div>
        `;
        quizData.questions[index].options.forEach(option => {
            document.querySelector(".options").innerHTML += `
                <li>
                    <label>
                        <input type='radio' name='option' value='${option}'/>
                        <span>${option}</span>
                    </label>
                </li>
            `;
        });
    // });
    [...document.querySelectorAll(".options input[type=radio]")].forEach(input => {
        if(location.pathname.includes("create")){
            input.setAttribute("disabled", "");
            if(quizData.questions[index].answer === input.value) input.checked = true;
        }else{
            input.setAttribute("oninput", `saveUserAnswer(this.nextElementSibling)`);
        }
    });

    if (location.pathname.includes("attempt")) {
        if (quizData.questions.length === 1){
            CREATE_MODAL("You only have one question in this quiz. Only quizzes with at least two questions can be attempted");
        }
    }
}

function GO_TO_PREV_QUESTION(arrName) {
    if (ind <= 0) {
        return;
    }
    ind--;
    PREVIEW_QUIZ(ind);

    if (location.pathname.includes("attempt")) {
        [...document.querySelectorAll(".options input[type=radio]")].forEach(input => {
            if(arrName[ind] === input.value) {
                input.checked = true;
                document.querySelector("#next-btn").removeAttribute("disabled");
            }
        })

        if (ind <= quizData.questions.length - 2) {
            document.querySelector("#next-btn").style.display = "block";
            document.querySelector("#submit-btn").style.display = "none";
        }
    }
}

function GO_TO_NEXT_QUESTION(arrName) {
    if (ind >= quizData.questions.length - 1) {
        return;
    }
    ind++;
    PREVIEW_QUIZ(ind);

    if (location.pathname.includes("attempt")) {
        [...document.querySelectorAll(".options input[type=radio]")].forEach(input => {
            if(arrName[ind] === input.value) {
                input.checked = true;
                document.querySelector("#next-btn").removeAttribute("disabled");
            }
        })

        if (ind >= quizData.questions.length - 1){
            document.querySelector("#next-btn").style.display = "none";
            document.querySelector("#submit-btn").style.display = "block";
        }
    }
}

function DELETE_QUESTION() {
    quizData.questions.splice(ind, 1);
    var request = indexedDB.open("efiqo", 1);

    request.onsuccess = function() {
        var trx = request.result.transaction("quizzes", "readwrite");
        var quiz_objStore = trx.objectStore("quizzes");
        quiz_objStore.put(quizData);
        sessionStorage.setItem("efiqo temp data", JSON.stringify(quizData));
        ind = 0;
        PREVIEW_QUIZ(ind);
    }
}