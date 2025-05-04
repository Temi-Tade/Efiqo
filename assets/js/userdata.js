if ("indexedDB" in window) {
    var request = indexedDB.open("efiqo", 1);
    request.onupgradeneeded = function(){
        if (!request.result.objectStoreNames.contains("user_data")) {
            request.result.createObjectStore("user_data", {keyPath: "userId", autoIncrement: true});
            request.result.createObjectStore("flashcards", {keyPath: "id", autoIncrement: true});
        }
    }

    request.onsuccess = function(){ 
        var user_data = {
            userName: "",
            theme: "device",
            lastLogIn: new Date().toUTCString(),
            userId: crypto.randomUUID(),
            pfp: {file: "", url: ""},
            fullName: "",
            gender: "",
            dob: "",
            email: "",
            tel: "",
            level: "",
            isBetaUser: false,
            isPremiumUser: false,
        }

        var trx = request.result.transaction("user_data", "readwrite");
        var user_data_objStore = trx.objectStore("user_data");

        var keys = user_data_objStore.getAll();
        //check if user profile exists
        keys.onsuccess = async function(ev){
            if (await ev.target.result.length >= 1) {
                var theme = ev.target.result[0].theme;
                if (theme === "device") {
                    if (window.matchMedia("(prefers-color-scheme: light)")) {
                        document.querySelector("link.userdef").href = "./assets/css/lightmode.css"
                    } else {
                        document.querySelector("link.userdef").href = "";
                    }
                }else if(theme === "dark"){
                    document.querySelector("link.userdef").href = "";
                }else{
                    document.querySelector("link.userdef").href = "./assets//css/lightmode.css"
                }
                return;
            } else {
                [...document.querySelectorAll(".signup")].map(el => {
                    el.onclick = () => {
                        CREATE_MODAL(document.querySelector("#signupform").innerHTML);
                        document.querySelector("#modalbg form input").oninput = function(ev){
                            if (ev.target.validity.valid) {
                                document.querySelector("#modalbg form button").disabled = false;
                            }else{
                                document.querySelector("#modalbg form button").disabled = true;
                            }
                        }
        
                        document.querySelector("#modalbg form").onsubmit = function(e){
                            e.preventDefault();
                            var betaUser;
                            var input_email = [...new FormData(e.target).entries()][0][1].trim();
                            for(let user of BETA_USERS) {
                                if (user.email.toLowerCase() === input_email.trim().toLowerCase()) {
                                    CREATE_MODAL("Loading... Please wait.");
                                    betaUser = user;
                                    user_data.email = user.email;
                                    user_data.fullName = `${user.firstName} ${user.lastName}`;
                                    user_data.isBetaUser = true;
                                    var trx = request.result.transaction("user_data", "readwrite");
                                    var user_data_objStore = trx.objectStore("user_data");
                                    user_data_objStore.add(user_data);
                
                                    e.target.reset();
                                    document.querySelector("#modalbg").animate({
                                        opacity: ["1", "0"],
                                    }, {
                                        iterations: 1,
                                        duration: 500
                                    })
                                    setTimeout(() => {
                                        document.querySelector("#modalbg").style.display = "none"
                                        history.go(0);
                                    }, 490);
                                    break;
                                }else{
                                    betaUser = undefined;
                                }
                            }
                            CREATE_MODAL(betaUser ? "Fetching beta user Information" : "<h1>Oops!</h1>Invalid credentials. Ensure you provide the email address you used during early access registration. Register for early access<a href='https://forms.gle/xPnuMzqSHwe9iBXy7' class='link'>here</a>and try again later (24 hours maximum).");
                        }
                    }
                })
            }
        }
    }

    request.onerror = function(){
        // console.error("An error occured while accessing database");
    }
} else {
    CREATE_MODAL(`
        An error occured while trying to create a database. Try:
        <ul>
            <li>Updating your browser</li>
            <li>Accessing this page on another browser</li>
        </ul>
    `)
};