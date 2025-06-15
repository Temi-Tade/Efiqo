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
          term: { type: "string", description: "The term of the current flashcard" },
          def: { type: "string", description: "Definition of the current term" },
          img: { type: "string", description: "link to image, if necessary, use it only when necessary, if none return ''" }
        },
        required: ["term", "def", "img"],
    }
};

document.querySelector("#gen-btn").onclick = function(){
    CREATE_MODAL(`
        <form id='gen-form' autocomplete="off" spellcheck="false">
            <h3>Create Flashcard with Efi <img src="../images/Efi2.png" alt="Efi" width="30"></h3>
            <div class='field'>
                <input type='text' id='prompt-course' placeholder='Course/Subject (e.g. Engineering)' required/> 
            </div>

            <div class='field'>
                <input type='text' id='prompt-topic' placeholder='Topic (e.g. Fluid mechanics)' required/> 
            </div>

            <div class='field'>
                <input type='number' inputmode='numeric' pattern='[0-9]*' id='prompt-number' placeholder='Number (e.g. 10)' min='5' max='20' required/> 
            </div>

            <div class='btn-wrap'>
                <button type='submit'>Create <img src="../images/Efi2.png" alt="Efi" width="30"></button>
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

        flashcardData.name = topic.value.trim();
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

        const prompt = `create ${number} flashcards on the topic - ${topic}, in the subject ${course}.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;

        const text = response.text();

        profile = JSON.parse(localStorage.getItem("efiqo user data"));
        flashcardData.flashcards = [...JSON.parse(text)];
        flashcardData.number = flashcardData.flashcards.length;
        profile.flashcards.push(flashcardData);

        updateDB(profile.email, {flashcards: profile.flashcards}, () => {
            sessionStorage.setItem("efiqo temp data", JSON.stringify(flashcardData));
            localStorage.setItem("efiqo user data", JSON.stringify(profile));
            document.querySelector('#flashcard-name').style.display = 'none';
            document.querySelector('#flashcard-data').style.display = 'block';
            PREVIEW_CARD(flashcardData.flashcards[0].term);
            SET_PROGRESS();
            FLASHCARD_COUNT();
        });

    } catch (error) {
        console.error("Error generating content:", error);
        console.error("Error: Could not get response from AI. Check console for details.");
        CREATE_MODAL("An error occured, please try again.");
    }
}