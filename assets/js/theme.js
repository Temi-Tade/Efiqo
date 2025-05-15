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
    // console.log(btn.value);

    if (btn.value === "device") {
        if (window.matchMedia("(prefers-color-scheme: light)").matches) {
            document.querySelector("link.userdef").href = "/assets/css/lightmode.css";
        } else {
            document.querySelector("link.userdef").href = "";
        }
        btn.setAttribute("class", "fa-solid fa-laptop transparent-btn");
    }else if(btn.value === "dark"){
        document.querySelector("link.userdef").href = "";
        btn.setAttribute("class", "fa-regular fa-moon transparent-btn");
        btn.innerText = "";
    }else{
        document.querySelector("link.userdef").href = "/assets/css/lightmode.css";
        btn.setAttribute("class", "fa-regular fa-sun transparent-btn");
        btn.innerText = "";
    }

    var request = indexedDB.open("efiqo");

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
                // console.log(error.message);
            }
        }
    }
}

//set theme
function LOAD_THEME(btn){
    var request = indexedDB.open("efiqo");
    request.onsuccess = function(){
        var trx = request.result.transaction("user_data");
        var objectStore = trx.objectStore("user_data");
        var userData = objectStore.getAll();
        
        userData.onsuccess = async function(ev){
            var data = await ev.target.result[0]
            if(!data) return;
            var theme = data.theme;
            if (theme === "device") {
                if (window.matchMedia("(prefers-color-scheme: light)").matches) {
                    document.querySelector("link.userdef").href = "/assets/css/lightmode.css";
                } else {
                    document.querySelector("link.userdef").href = "/assets/css/index.css";
                }
                btn.setAttribute("class", "fa-solid fa-laptop transparent-btn");
                btn.value = "device";
            }else if(theme === "dark"){
                document.querySelector("link.userdef").href = "/assets/css/index.css";
                btn.setAttribute("class", "fa-regular fa-moon transparent-btn");
                btn.value = "dark";
            }else{
                document.querySelector("link.userdef").href = "/assets/css/lightmode.css";
                btn.setAttribute("class", "fa-regular fa-sun transparent-btn");
                btn.value = "light";
            }
        }
    }
}

LOAD_THEME(document.querySelector("header nav ul li button"))