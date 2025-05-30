var themes = ["device", "light", "dark"];

//todo: theme toggle bug
function TOGGLE_THEME(btn) {
    profile = JSON.parse(sessionStorage.getItem("efiqo user data"));

    if (btn.value === "device") {
        btn.value = "light";
    } else if (btn.value === "light"){
        btn.value = "dark"
    }else{
        btn.value = ("device");
    }

    if (btn.value === "device") {
        if (window.matchMedia("(prefers-color-scheme: light)").matches) {
            document.querySelector("link.userdef").href = "./assets/css/lightmode.css";
        } else {
            document.querySelector("link.userdef").href = "";
        }
        btn.setAttribute("class", "fa-solid fa-laptop transparent-btn");
    }else if(btn.value === "dark"){
        document.querySelector("link.userdef").href = "";
        btn.setAttribute("class", "fa-regular fa-moon transparent-btn");
        btn.innerText = "";
    }else{
        document.querySelector("link.userdef").href = "./assets/css/lightmode.css";
        btn.setAttribute("class", "fa-regular fa-sun transparent-btn");
        btn.innerText = "";
    }

    updateDB(profile.email, {theme: btn.value}, () => true);
    sessionStorage.setItem("efiqo user data", JSON.stringify({...profile, theme: btn.value}));
}

//set theme
function LOAD_THEME(btn){
    if (sessionStorage.getItem("efiqo user data")) {
        var theme = JSON.parse(sessionStorage.getItem("efiqo user data")).theme;
        
        if (theme === "device") {
            if (window.matchMedia("(prefers-color-scheme: light)").matches) {
                document.querySelector("link.userdef").href = "./assets/css/lightmode.css"
            } else {
                document.querySelector("link.userdef").href = "";
            }
            btn.setAttribute("class", "fa-solid fa-laptop transparent-btn");
            btn.value = "device";
        }else if(theme === "dark"){
            document.querySelector("link.userdef").href = "";
            btn.setAttribute("class", "fa-regular fa-moon transparent-btn");
            btn.value = "dark";
        }else{
            document.querySelector("link.userdef").href = "./assets/css/lightmode.css";
            btn.setAttribute("class", "fa-regular fa-sun transparent-btn");
            btn.value = "light";
        }
    }
}

LOAD_THEME(document.querySelector("header nav ul li button"));

// restore header position if logged in
if (sessionStorage.getItem("efiqo user data")) {
    document.querySelector("header").style.position = "static"
}