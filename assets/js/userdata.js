if ("indexedDB" in window) {
    var request = indexedDB.open("learnaptiq", 1);
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
            pfp: {
                file: "",
                url: ""
            },
            fullName: "",
            gender: "",
            dob: "",
            email: "",
            tel: "",
            level: "",
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
                document.querySelector("#signup").onclick = () => {
                    CREATE_MODAL(document.querySelector("#signupform").innerHTML);

                    // window.onclick = function(e){
                    //     if (e.target === document.querySelector("#modalbg")) {
                    //         return;
                    //     }
                    // }
    
                    document.querySelector("#modalbg form input").oninput = function(ev){
                        if (ev.target.value.trim().length >= 3) {
                            document.querySelector("#modalbg form button").disabled = false;
                        }else{
                            document.querySelector("#modalbg form button").disabled = true;
                        }
                    }
    
                    document.querySelector("#modalbg form").onsubmit = function(e){
                        e.preventDefault();
                        user_data.userName = [...new FormData(e.target).entries()][0][1];
    
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
                        }, 490);
                        history.go(0);
                    }
                }

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