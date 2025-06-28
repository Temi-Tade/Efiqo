import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai';

function readGeneratedData(){
    updateDB(profile.email, {flashcards: profile.flashcards}, () => {
            sessionStorage.setItem("efiqo temp data", JSON.stringify(flashcardData));
            localStorage.setItem("efiqo user data", JSON.stringify(profile));
            document.querySelector('#flashcard-name').style.display = 'none';
            document.querySelector('#flashcard-data').style.display = 'block';
            PREVIEW_CARD(flashcardData.flashcards[0].term);
            SET_PROGRESS();
            FLASHCARD_COUNT();
            document.querySelector("#share-flashcard-btn").style.display = "block";
        });
}

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
            def: { type: "string", description: "Definition of the current term, make it as short, brief and concise as possible." },
            img: { 
                type: "object",
                properties: {
                    name: {type: "string", description: "short description of the image."},
                    url: {type: "string", description:"link to respective image,"}
                }
            }
        },
        required: ["term", "def",],
    }
};

document.querySelector("#gen-btn").onclick = function(){
    CREATE_MODAL(`
        <form id='gen-form' class='gen-form' autocomplete="off" spellcheck="false">
            <h3>Create Flashcard with Efi <img src="../images/Efi2.png" alt="Efi" width="30"></h3>

            <div class='field upload-field'>
                <button style='display: inline-block' class='upload-btn transparent-btn' type='button'><i class='fa-regular fa-file'></i> Upload a lecture material</button>
            </div>

            <div class='field'>
                <input type='text' id='prompt-course' placeholder='Course/Subject (e.g. Engineering)' required/> 
            </div>

            <div class='field'>
                <input type='text' id='prompt-topic' placeholder='Topic (e.g. Fluid mechanics)' required/> 
            </div>

            <div class='field'>
                <input type='number' inputmode='numeric' pattern='[0-9]*' id='prompt-number' placeholder='Decks (e.g. 10)' min='5' max='20' required/> 
            </div>

            <div class='btn-wrap'>
                <button type='submit'>Create <img src="../images/Efi2.png" alt="Efi" width="30"></button>
            </div>
            <p>
                <small><em><i class='fa-solid fa-info-circle'></i> Efi can make mistakes, just like you, so always double-check it</em></small><br/><br/>
                <small style='display: flex; align-items: center; justify-content: center'>Powered by Gemini <img src='../images/gemini-logo.png' width='20'/></small>
            </p>
        </form>
    `);

    document.querySelector('.upload-btn').onclick = function (){
        CREATE_MODAL(`
            <form id="gen-doc-form" class="gen-form" autocomplete="off">
                <h3>Create Flashcard with Efi <img src="../images/Efi2.png" alt="Efi" width="30"></h3>
                <div class="field" style='margin-top: .25rem'>
                    <small><em>Accepted document type: PDF<br>Max. file size: 10MB</em></small><br><br>
                    <label class="doc-label" for="doc">Upload Document <i class="fa-regular fa-file"></i></label>
                    <input type="file" id="doc" accept=".pdf, application/pdf" required>
                    <small id='doc-name'></small>
                </div>

                <div class='field'>
                    <input type='text' id='course' placeholder='Course (e.g. Anatomy)' required/> 
                </div>
    
                <div class="field">
                    <input type="number" id="number" inputmode="numeric" pattern="[0-9]*" placeholder="Decks (e.g. 10)" min='5' max='20' required>
                </div>
    
                <div class='btn-wrap'>
                    <button type='submit'>Create <img src="../images/Efi2.png" alt="Efi" width="30"></button>
                </div>
                <p>
                    <small><em><i class='fa-solid fa-info-circle'></i> Efi can make mistakes, just like you, so always double-check it</em></small><br/><br/>
                    <small style='display: flex; align-items: center; justify-content: center'>Powered by Gemini <img src='../images/gemini-logo.png' width='20'/></small>
                </p>
            </form>    
        `);

        document.querySelector("#doc").onchange = function(e){
            const file = e.target.files[0];
            console.log(file.size/1000000)
            if ((file.size/1000000 > 10) || file.type !== "application/pdf") {
                CREATE_MODAL(`
                    <p>Document must be a PDF and maximum file upload size is 10MB</p><br>
                    <p>Need to convert documents to PDF of compress large PDF files? Click <a style='color: #3451f7; text-decoration: underline; padding: 0' href='https://www.ilovepdf.com/' target='_blank'>here</a>
                `);
                return;
            }

            e.target.nextElementSibling.innerHTML = file.name;
        }

        document.querySelector("#gen-doc-form").onsubmit = async function(e) {
            e.preventDefault();
            const file = e.target.querySelector("#doc").files[0];

            if ((file.size/1000000 > 10) || file.type !== "application/pdf") {
                CREATE_MODAL(`
                    <p>Document must be a PDF and maximum file upload size is 10MB</p><br>
                    <p>Need to convert documents to PDF of compress large PDF files? Click <a style='color: #3451f7; text-decoration: underline; padding: 0' href='https://www.ilovepdf.com/' target='_blank'>here</a>
                `);
                return;
            }

            const course = e.target.querySelector("#course").value.trim();
            const number = e.target.querySelector("#number").value.trim();
            console.log(file);
            //loader
            e.target.querySelector("#doc").nextElementSibling.innerHTML = file.name;
            async function getFileParts(file){
                const fileReader = new FileReader();
                return new Promise((resolve, reject) => {
                    fileReader.onload = function() {
                        const base64Data = fileReader.result.split(',')[1];
                        console.log(base64Data.length);
                        resolve({
                            inlineData: {
                                data: base64Data,
                                mimeType: file.type
                            }
                        });
                    };
                    fileReader.onerror = reject;
                    fileReader.readAsDataURL(file);
                });
            }

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
            const fileParts = await getFileParts(file);
            const prompt = `You are a professor in the subject - ${course}, analyze this document and create ${number} flashcards.`;
        
            const result = await model.generateContent({
                contents: [
                    {
                        parts: [
                            fileParts,
                            { text: prompt }
                        ]
                    }
                ]
            });
        
            const response = await result.response;
            const text = response.text();
        
            profile = JSON.parse(localStorage.getItem("efiqo user data"));
            flashcardData.flashcards = [...JSON.parse(text)];
            flashcardData.number = flashcardData.flashcards.length;
            flashcardData.name = course;
            profile.flashcards.push(flashcardData);
            document.querySelector("#info h3").innerHTML = flashcardData.name;
        
            readGeneratedData();
        
            console.log(text);
        }
    }

    
    document.querySelector("#modal #gen-form").onsubmit = function(e) {
        e.preventDefault();

        let course = document.querySelector("#prompt-course");
        let topic = document.querySelector("#prompt-topic");
        let number = document.querySelector("#prompt-number");

        main(course.value.trim(), topic.value.trim(), number.value);

        flashcardData.name = topic.value.trim();
        document.querySelector("#info h3").innerHTML = flashcardData.name;
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

        const prompt = `You are a professor of ${course}, create ${number} flashcards on the topic - ${topic}, in the subject ${course}.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;

        const text = response.text();

        profile = JSON.parse(localStorage.getItem("efiqo user data"));
        flashcardData.flashcards = [...JSON.parse(text)];
        flashcardData.number = flashcardData.flashcards.length;
        profile.flashcards.push(flashcardData);

        readGeneratedData();

    } catch (error) {
        console.error("Error generating content:", error);
        console.error("Error: Could not get response from AI. Check console for details.");
        CREATE_MODAL("An error occured, please try again.");
    }
}