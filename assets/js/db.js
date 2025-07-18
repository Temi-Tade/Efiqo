let DATA;
let genAI;


firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // alert()
    }
})

function writeToDB(id, data, callback) {
    CREATE_MODAL(document.querySelector(".loader-wrap").innerHTML); //spinner
    window.onclick = function(e){
        if (e.target === document.querySelector("#modalbg")) {
            return;
        }
    }
    
    db.collection("users").doc(id)
    .update(data)
    .then(() => {
        console.log("update successfull");
        getUserData(id);
        callback();
    })
    .catch((error) => {
        console.error(error);
        CREATE_MODAL("An error occured. Please try again");
    });
}

function updateDB(id, data, callback) {
    CREATE_MODAL(document.querySelector(".loader-wrap").innerHTML); //spinner
    window.onclick = function(e){
        if (e.target === document.querySelector("#modalbg")) {
            return;
        }
    }

    db.collection("users").doc(id)
    .update(data)
    .then(() => {
        document.querySelector("#modalbg").style.display = "none";
        // console.log("update successfull");
        callback();
    })
    .catch((error) => {
        console.error(error);
        CREATE_MODAL("An error occured. Please try again.");
    });
}

function getUserData(id){
    CREATE_MODAL(document.querySelector(".loader-wrap").innerHTML); //spinner
    window.onclick = function(e){
        if (e.target === document.querySelector("#modalbg")) {
            return;
        }
    }

    db.collection("users").doc(id)
    .get()
    .then((doc) => {
        if (doc.exists) {
            user_data = doc.data();
            localStorage.setItem("efiqo user data", JSON.stringify(user_data));
            profile = JSON.parse(localStorage.getItem("efiqo user data"));
            FETCH_USER_PROFILE();
            document.querySelector("#modalbg").style.display = "none";
        }
    })
    .catch(error => {
        // console.log(error.toString())
        if (error.toString().includes("offline")) {
            CREATE_MODAL("<i class='fa-solid fa-info-circle'></i> Cannot fetch data. Check your connection and try again.");
            return;
        }
        CREATE_MODAL("An error occured while fetching data.");
    })
}

function getGenData(callback) {
    CREATE_MODAL(document.querySelector(".loader-wrap").innerHTML); //spinner
    window.onclick = function(e){
        if (e.target === document.querySelector("#modalbg")) {
            return;
        }
    }

    db.collection("generate").doc("model")
    .get()
    .then((doc) => {
        document.querySelector("#modalbg").style.display = "none";
        DATA = doc.data();
        callback(DATA);
    })
    .catch(error => {
        console.log(error);
        CREATE_MODAL("An error occured while trying to connect.");
    });
}