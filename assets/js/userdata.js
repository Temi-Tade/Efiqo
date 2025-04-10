function SIGN_UP(){
    CREATE_MODAL(`
        <form autocomplete="off" spellcheck="false" onsubmit='handleSignUp(event)'>
            <h3>Welcome Acer! Thank you for choosing Ace-It. Please register to create an account.</h3>
            <div class="field">
                <input type="text" name="fname" placeholder="FIRST NAME" class='req'/>
            </div>

            <div class="field">
                <input type="text" name="lname" placeholder="LAST NAME" class='req'/>
            </div>

            <div class="field">
                <input type="email" name="mail" placeholder="E-MAIL ADDRESS" class='req' required/>
            </div>

            <div class="btn-wrap">
                <button disabled id='signupbtn'>Sign Up</button>
            </div>
            <p class='log-in'>Have an account?<button class='transparent-btn'>Log In</button></p>
        </form>
    `);

    var inputs = [...document.querySelectorAll("#modal form .req")]
    inputs.map(input => {
        input.oninput = function(){
            // alert()
            if (inputs.every(input => input.value.trim())) document.querySelector("#signupbtn").disabled = false;
            else document.querySelector("#signupbtn").disabled = true;
        }
    });

    document.querySelector("#modal form").onsubmit = function(e){
        e.preventDefault();
    }
}

// if ("indexedDB" in window) {
//     var request = indexedDB.open("ace-it", 1);
//     request.onupgradeneeded = function(){
//         if (!request.result.objectStoreNames.contains("user_data")) {
//             request.result.createObjectStore("user_data", {keyPath: "userId"});
//             request.result.createObjectStore("flashcards", {keyPath: "id"});
//         }
//     }

//     request.onsuccess = function(){
//         // if (!request.result.objectStoreNames.contains("user_data")) {
//         //     alert()
//         //     request.result.createObjectStore("user_data", {keyPath: "userId"});
//         //     request.result.createObjectStore("flashcards", {keyPath: "id"});
//         // }
//         var user_data = {
//             userName: "",
//             theme: "device",
//             lastLogIn: new Date().toUTCString(),
//             userId: crypto.randomUUID(),
//             pfp: {
//                 file: "",
//                 url: ""
//             },
//             fullName: "",
//             gender: "",
//             dob: "",
//             email: "",
//             tel: "",
//             level: "",
//             isPremiumUser: false,
//         }

//         var trx = request.result.transaction("user_data", "readwrite");
//         var user_data_objStore = trx.objectStore("user_data");

//         var keys = user_data_objStore.getAll();
//         //check if user profile exists
//         keys.onsuccess = async function(ev){
//             if (await ev.target.result.length >= 1) {
//                 var theme = ev.target.result[0].theme;
//                 if (theme === "device") {
//                     if (window.matchMedia("(prefers-color-scheme: light)")) {
//                         document.querySelector("link.userdef").href = "../css/lightmode.css"
//                     } else {
//                         document.querySelector("link.userdef").href = "";
//                     }
//                     // CREATE_MODAL("TOGGLE THEME: Device");
//                 }else if(theme === "dark"){
//                     document.querySelector("link.userdef").href = "";
//                     // CREATE_MODAL("TOGGLE THEME: Dark");
//                 }else{
//                     document.querySelector("link.userdef").href = "../css/lightmode.css"
//                     // CREATE_MODAL("TOGGLE THEME: Light");
//                 }
//                 return;
//             } else {
//                 CREATE_MODAL(`
//                     <form autocomplete="off" spellcheck="false">
//                         <h3>Welcome Acer! Thank you for choosing Ace-It. Enter your name to continue.</h3>
//                         <div class="field">
//                             <input type="text" name="uname" placeholder="USERNAME"/>
//                         </div>

//                         <div class="btn-wrap">
//                             <button disabled>Continue</button>
//                         </div>
//                     </form>    
//                 `);

//                 window.onclick = function(e){
//                     if (e.target === document.querySelector("#modalbg")) {
//                         return;
//                     }
//                 }

//                 document.querySelector("#modalbg form input").oninput = function(ev){
//                     if (ev.target.value.trim().length >= 3) {
//                         document.querySelector("#modalbg form button").disabled = false;
//                     }else{
//                         document.querySelector("#modalbg form button").disabled = true;
//                     }
//                 }

//                 document.querySelector("#modalbg form").onsubmit = function(e){
//                     e.preventDefault();
//                     user_data.userName = [...new FormData(e.target).entries()][0][1];

//                     var trx = request.result.transaction("user_data", "readwrite");
//                     var user_data_objStore = trx.objectStore("user_data");
//                     user_data_objStore.add(user_data);

//                     e.target.reset();
//                     document.querySelector("#modalbg").animate({
//                         opacity: ["1", "0"],
//                     }, {
//                         iterations: 1,
//                         duration: 500
//                     })
//                     setTimeout(() => {
//                         document.querySelector("#modalbg").style.display = "none"
//                     }, 490);
//                     history.go(0);
//                 }
//             }
//         }
//     }

//     request.onerror = function(){
//         // console.error("An error occured while accessing database");
//     }
// } else {
//     CREATE_MODAL(`
//         An error occured while trying to create a database. Try:
//         <ul>
//             <li>Updating your browser</li>
//             <li>Accessing this page on another browser</li>
//         </ul>
//     `)
// };

SIGN_UP();