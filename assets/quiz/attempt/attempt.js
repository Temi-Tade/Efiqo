PREVIEW_QUIZ(ind);
document.title = `Quiz | ${quizData.name}`;

const USER_ANSWERS = [];

function saveUserAnswer(answer){
    if (ind === quizData.questions.length - 1) {
        document.querySelector("#submit-btn").removeAttribute("disabled");
    }
    USER_ANSWERS[ind] = answer.innerHTML;
    document.querySelector("#next-btn").removeAttribute("disabled");
}

document.querySelector("#prev-btn").setAttribute("onclick", `GO_TO_PREV_QUESTION(USER_ANSWERS)`);
document.querySelector("#next-btn").setAttribute("onclick", `GO_TO_NEXT_QUESTION(USER_ANSWERS)`);

function SUBMIT_QUIZ() {
    var prompt = confirm(`You are about to submit your attempt for the quiz - ${quizData.name}. Do you want to proceed?`);
    let score = 0;

    if (prompt) {
        quizData.questions.forEach((question, index) => {
            if (question.answer === USER_ANSWERS[index]) {
                score++;
            }
        })
        document.querySelector("#result-wrap").innerHTML = `<p><small>Final score</small>${score}/${quizData.questions.length}</p>`;

        profile = JSON.parse(localStorage.getItem("efiqo user data"));
        profile.quizzes.forEach((q, i) => {
            if (q.id === quizData.id) {
                profile.quizzes[i] = quizData;
                sessionStorage.setItem("efiqo temp data", JSON.stringify(profile.quizzes[i]));
                localStorage.setItem("efiqo user data", JSON.stringify(profile));
            }
        });
        
        updateDB(profile.email, profile, () => {
            hide(document.querySelector("#quiz"));
            show(document.querySelector("#result"));
    
            quizData.questions.forEach((question, index) => {
                document.querySelector("#corrections").innerHTML += `
                    <li class='correction-question'>
                        <p>${question.question}</p>
                        <!--<ul class='options'></ul>-->
                        <p>The correct answer is <strong><em>${question.answer}</em></strong></p>
                        <p>You selected <strong><em>${USER_ANSWERS[index]}</em></strong></p>
                    </li>
                `
                // quizData.questions[index].options.forEach(option => {
                //     [...document.querySelectorAll("#result .options")][index].innerHTML += `
                //         <li>
                //             <label>
                //                 <input type='radio' name='option' value='${option}'/>
                //                 <span>${option}</span>
                //             </label>
                //         </li>
                //     `;
                // });
            })
        });
    }
}