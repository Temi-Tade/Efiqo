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

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // console.log(user);
    }
})

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
            sessionStorage.setItem("efiqo user data", JSON.stringify(user_data));
            profile = JSON.parse(sessionStorage.getItem("efiqo user data"));
            FETCH_USER_PROFILE();
            document.querySelector("#modalbg").style.display = "none";
        }
    });
}