import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai';

function runFunction(e){
    genAI = new GoogleGenerativeAI(e.data);
}
getGenData((e) => runFunction(e));

const responseSchema = {
    type: "array",
    items: {
        type: "object",
        properties: {
          question: { type: "string", description: "The question on the topic" },
          answer: { type: "string", description: "Answer to the question" },
          options: {
            type: "array",
            items: {
                type: "string",
                // description: "An array of 4 strings containing possible answers to the question"
            },
            description: "An array of 4 strings containing possible answers to the question"
        }
        },
        required: ["question", "answer", "options"],
    }
};

document.querySelector("#gen-btn").onclick = function(){
    CREATE_MODAL(`
        <form id='gen-form' autocomplete="off" spellcheck="false">
            <h3>Create Quiz with Efi <img src="../../images/Efi2.png" alt="Efi" width="30"></h3>
            <div class='field'>
                <input type='text' id='prompt-course' placeholder='Course (e.g. Economics)' required/> 
            </div>

            <div class='field'>
                <input type='text' id='prompt-topic' placeholder='Topic (e.g. Economic systems)' required/> 
            </div>

            <div class='field'>
                <input type='number' inputmode='numeric' pattern='[0-9]*' id='prompt-number' placeholder='Questions (e.g. 10)' min='5' max='20' required/> 
            </div>

            <div class='btn-wrap'>
                <button type='submit'>Create <img src="../../images/Efi2.png" alt="Efi" width="30"></button>
            </div>
            <p>
                <small><em><i class='fa-solid fa-info-circle'></i> Efi can make mistakes, just like you, so always double-check it</em></small>
            </p>
        </form>    
    `);

    
    document.querySelector("#modal #gen-form").onsubmit = function(e) {
        e.preventDefault();

        let course = document.querySelector("#prompt-course");
        let topic = document.querySelector("#prompt-topic");
        let number = document.querySelector("#prompt-number");

        main(course.value.trim(), topic.value.trim(), number.value);

        quizData = {
            name: "",
            desc: "",
            questions: [],
            mode: "create",
            id: crypto.randomUUID(),
            timeStamp: new Date().toUTCString(),
            by: JSON.parse(localStorage.getItem("efiqo user data"))?.email
        };
        quizData.name = topic.value.trim();
    }
}

async function main(course, topic, number) {
    try {
        CREATE_MODAL(document.querySelector(".buddy-loader").innerHTML);
        window.onclick = function(e){
            if (e.target === document.querySelector("#modalbg")) {
                return;
            }
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema
            }
        });

        const prompt = `create ${number} questions on the topic - ${topic}, in the subject ${course}.`;

        console.log(prompt);

        const result = await model.generateContent(prompt);
        const response = await result.response;

        const text = response.text();
        console.log(text);

        profile = JSON.parse(localStorage.getItem("efiqo user data"));
        quizData.questions = [...JSON.parse(text)];
        profile.quizzes.push(quizData);

        updateDB(profile.email, {quizzes: profile.quizzes}, () => {
            sessionStorage.setItem("efiqo temp data", JSON.stringify(quizData));
            localStorage.setItem("efiqo user data", JSON.stringify(profile));
            hide(document.querySelector('#quiz-data'));
            show(document.querySelector('#quiz-wrap'));
            getQuizInfo();
            PREVIEW_QUIZ(ind);
        });

        console.log(quizData);
    } catch (error) {
        console.error("Error generating content:", error);
        console.error("Error: Could not get response from AI. Check console for details.");
        CREATE_MODAL("An error occured, please try again.");
    }
}