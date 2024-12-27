var themes = ["device", "light", "dark"];

//todo: theme toggle bug
function TOGGLE_THEME(btn) {
    if (btn.value === "device") {
        btn.value = "light";
    } else if (btn.value === "light"){
        btn.value = "dark"
    }else{
        btn.value = ("device");
    }
    console.log(btn.value);

    if (btn.value === "device") {
        if (window.matchMedia("(prefers-color-scheme: light)")) {
            document.querySelector("link.userdef").href = "/assets/css/lightmode.css";
        } else {
            document.querySelector("link.userdef").href = "";
        }
        btn.setAttribute("class", "material-symbols-outlined transparent-btn");
        btn.innerText = "brightness_6";
        CREATE_MODAL("TOGGLE THEME: System Default");
    }else if(btn.value === "dark"){
        document.querySelector("link.userdef").href = "";
        btn.setAttribute("class", "fa-solid fa-moon transparent-btn");
        btn.innerText = "";
        CREATE_MODAL("TOGGLE THEME: Dark");

    }else{
        document.querySelector("link.userdef").href = "/assets/css/lightmode.css";
        btn.setAttribute("class", "fa-solid fa-sun transparent-btn");
        btn.innerText = "";
        CREATE_MODAL("TOGGLE THEME: Light");
    }
    setTimeout(() => {
        document.querySelector("#modalbg").style.display = "none";
    }, 1500);

    var request = indexedDB.open("ace-it");

    request.onsuccess = function(){
        var trx = request.result.transaction("user_data", "readwrite");
        var objectStore = trx.objectStore("user_data");
        var userData = objectStore.getAll();

        userData.onsuccess = async function(e){
            var data = e.target.result;
            data[0].theme = btn.value;
            try {
                objectStore.put(data[0]);
            } catch (error) {
                console.log(error.message);
            }
        }
    }
}

//set theme
function LOAD_THEME(btn){
    var request = indexedDB.open("ace-it");
    request.onsuccess = function(){
        var trx = request.result.transaction("user_data");
        var objectStore = trx.objectStore("user_data");
        var userData = objectStore.getAll();
        
        userData.onsuccess = async function(ev){
            var data = await ev.target.result[0] || {theme: "device"};
            var theme = data.theme;
            if (theme === "device") {
                if (window.matchMedia("(prefers-color-scheme: light)")) {
                    document.querySelector("link.userdef").href = "/assets/css/lightmode.css";
                } else {
                    document.querySelector("link.userdef").href = "";
                }
                btn.setAttribute("class", "material-symbols-outlined transparent-btn");
                btn.innerText = "brightness_6";
                btn.value = "device";
                // CREATE_MODAL("TOGGLE THEME: Device");
            }else if(theme === "dark"){
                document.querySelector("link.userdef").href = "";
                btn.setAttribute("class", "fa-solid fa-moon transparent-btn");
                btn.value = "dark";
                // CREATE_MODAL("TOGGLE THEME: Dark");
            }else{
                document.querySelector("link.userdef").href = "/assets/css/lightmode.css";
                btn.setAttribute("class", "fa-solid fa-sun transparent-btn");
                btn.value = "light";
                // CREATE_MODAL("TOGGLE THEME: Light");
            }
        }
    }
}

LOAD_THEME(document.querySelector("header nav ul li button"))