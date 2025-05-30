let quizData;
let ind = 0;
const QUIZ_DATA_FORM = document.querySelector("#quiz-data form");

if (JSON.parse(sessionStorage.getItem("efiqo temp data"))){
    quizData = JSON.parse(sessionStorage.getItem("efiqo temp data"));
    profile = JSON.parse(sessionStorage.getItem("efiqo user data"));
    hide(QUIZ_DATA_FORM);
    show(document.querySelector("#quiz-wrap"));

    if (quizData.by !== profile.email) {
        if (quizData.questions.length === 0) {
            CREATE_MODAL("No questions have been set here here");
            window.onclick = function(e){
                if (e.target === document.querySelector("#modalbg")) {
                    return;
                }
            }
        }

        getQuizInfo();
        PREVIEW_QUIZ(ind);
        document.querySelector(".quiz-preview-actions").style.display = 'none';
        document.querySelector("#preview-btn").innerHTML = ""
    }
} 

const QUIZ_FORM = document.querySelector("#quiz-form");
const QUESTIONS = quizData ? quizData.options : [];

var quiz;
var question;

class Quiz{
    constructor(name, desc){
        this.name = name;
        this.desc = desc;
        this.questions = [];
        this.mode = "create";
        this.id = crypto.randomUUID();
        this.timeStamp = new Date().toUTCString();
        this.by = JSON.parse(sessionStorage.getItem("efiqo user data")).email;
        this.attempts = [];
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
                if(input.checked) hide(document.querySelector("#no-answer"));
                question.setAnswer(input.parentElement.querySelector("span").innerHTML);
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
    profile = JSON.parse(sessionStorage.getItem("efiqo user data"));

    document.querySelector("#quiz-details").innerHTML = `
        <div class='quiz-title'>
            <h3>${quizInfo.name}</h3>
        </div>
        <p><small>${quizInfo.desc}</small></p>
        <div class='quiz-config-options' style='justify-content: ${(quizInfo.by !== profile.email) ? "center" : "space-between"}'>
            <p>Mode: ${quizInfo.mode}</p>
            <button id='preview-btn' class='transparent-btn preview-btn' onclick="PREVIEW_QUIZ(ind)" style='display: ${(quizInfo.by !== profile.email) ? "none" : "block"}'>Preview <i class='fa-solid fa-caret-right'></i></button>
        </div>
    `
}

if(quizData) getQuizInfo();

QUIZ_DATA_FORM.onsubmit = function (event) {
    profile = JSON.parse(sessionStorage.getItem("efiqo user data"));

    event.preventDefault();
    quiz = new Quiz(event.target.querySelector("#quiz-name").value.trim(), event.target.querySelector("#quiz-desc").value.trim());
    
    sessionStorage.setItem("efiqo temp data", JSON.stringify(quiz));
    quizData = JSON.parse(sessionStorage.getItem("efiqo temp data"));
    profile.quizzes.push(quizData);

    sessionStorage.setItem("efiqo user data", JSON.stringify(profile));
    updateDB(profile.email, {quizzes: profile.quizzes}, () => {
        QUIZ_DATA_FORM.reset();
        hide(event.target.parentElement);
        show(document.querySelector("#quiz-wrap"));
        getQuizInfo();
    });
}

function createQuestion(text){
    question = new Question(text);
    show(document.querySelector("#option"));
    show(document.querySelector("#question-preview"));
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
}

QUIZ_FORM.querySelector("#add-to-quiz-btn").onclick = function(){
    profile = JSON.parse(sessionStorage.getItem("efiqo user data"));

    if (quizData.questions.length >= 20) {
        CREATE_MODAL(document.querySelector("#get-premium").innerHTML);
        document.querySelector("#reason").innerHTML = "<h3>You have run out of questions</h3><br/><p>Upgrade to premium to enjoy creating unlimited questions and quizzes.</p><br/>";
        return;
    }

    QUIZ_FORM.querySelector("#question").value = "";
    document.querySelector("#create-question-btn").disabled = true;
    if(quizData){
        quizData.questions.push(JSON.parse(JSON.stringify(question)));
        quiz = quizData;
    }else{
        quiz.addQuestion(question);
    }

    // sessionStorage.setItem("efiqo user data", JSON.stringify(profile));
    profile.quizzes.forEach((q, i) => {
        if (q.id === quiz.id) {
            profile.quizzes[i] = quiz;
            sessionStorage.setItem("efiqo temp data", JSON.stringify(profile.quizzes[i]));
            sessionStorage.setItem("efiqo user data", JSON.stringify(profile));
        }
    })

    updateDB(profile.email, {quizzes: profile.quizzes}, () => {
        document.querySelector("#question-preview").innerHTML = "";
        hide(document.querySelector("#submit"));
        hide(document.querySelector("#option"));
    });
}

function PREVIEW_QUIZ(index) {
    if(location.pathname.includes("attempt")) document.querySelector("#next-btn").disabled = true;
    show(document.querySelector("#quiz-preview-wrap"));
    hide(document.querySelector("#question-preview"));
    hide(document.querySelector("#quiz-form"));
    document.querySelector("#preview-btn").style.display = 'none'

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
            // if(quizData.questions[index].answer === input.value) input.checked = true;
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
        document.querySelector("#submit-btn").setAttribute("disabled", "");

        if (ind >= quizData.questions.length - 1){
            document.querySelector("#next-btn").style.display = "none";
            document.querySelector("#submit-btn").style.display = "block";

            if (quizData.questions.length === arrName.length) {
                document.querySelector("#submit-btn").removeAttribute("disabled");
            }
        }
    }
}

function DELETE_QUESTION() {
    quizData.questions.splice(ind, 1);

    profile = JSON.parse(sessionStorage.getItem("efiqo user data"));
    profile.quizzes.forEach((q, i) => {
        if (q.id === quizData.id) {
            profile.quizzes[i] = quizData;
            sessionStorage.setItem("efiqo temp data", JSON.stringify(profile.quizzes[i]));
            sessionStorage.setItem("efiqo user data", JSON.stringify(profile));
        }
    })
    updateDB(profile.email, profile, () => {
        ind = 0;
        PREVIEW_QUIZ(ind);
    });
}