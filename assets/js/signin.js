const firebaseConfig = {
    apiKey: "AIzaSyC5Asd569nYv3Izm0Rbf1vebuaspmDyi-k",
    authDomain: "efiqo-app.firebaseapp.com",
    projectId: "efiqo-app",
    storageBucket: "efiqo-app.firebasestorage.app",
    messagingSenderId: "516937865681",
    appId: "1:516937865681:web:c91acfd07f1783d194a8f0",
    measurementId: "G-LL86ZK79Z7"
}

firebase.initializeApp(firebaseConfig);
const provider = new firebase.auth.GoogleAuthProvider();
const db = firebase.firestore();

let profile;

function registerUser(email) {
    db.collection("users").doc(email)
    .get()
    .then((doc) => {
        if (doc.exists) {
            user_data = doc.data();
            localStorage.setItem("efiqo user data", JSON.stringify(user_data));
            history.go(0);
        } else {
            db.collection("users").doc(email)
                .set(user_data)
                .then(() => {history.go(0);})
                .catch((error) => {
                    console.log(error);
                    CREATE_MODAL("An error occured. Please try again");
                })
            }
        })
        .catch((error) => {
            console.log(error);
            CREATE_MODAL("An error occured. Please try again");
        })
}

function signInWithGoogle(){
    CREATE_MODAL(document.querySelector(".loader-wrap").innerHTML); //spinner
    window.onclick = function(e){
        if (e.target === document.querySelector("#modalbg")) {
            return;
        }
    }
    firebase.auth().signInWithPopup(provider)
    .then((result) => {
        if (result) {
            const user = result.user;

            user_data.email = user.email;
            user_data.fullName = user.displayName;
            user_data.pfp.url = user.photoURL;
            user_data.pfp.file = user.photoURL;
            user_data.tel = user.providerData[0].phoneNumber ? user.providerData[0].phoneNumber : "";
            user_data.userName = user.displayName.slice(0, user.displayName.indexOf(" "));
            BETA_USERS.forEach(betauser => {
                if (betauser.email === user.email) {
                    user_data.isBetaUser = true;
                }
            })

            profile = user_data;
            localStorage.setItem("efiqo user data", JSON.stringify(user_data));

            registerUser(user_data.email);
        } else {
            return;
        }
    })
    .catch((error) => {
        CREATE_MODAL("An error occured while trying to sign you in. Please try again.");
        console.error(error);
    });
}


[...document.querySelectorAll(".signup")].map(el => {
    el.onclick = () => {
        CREATE_MODAL(document.querySelector("#signupform").innerHTML);
        document.querySelector("#modal #signinbtn").addEventListener("click", signInWithGoogle);
    }
});

function signOut(){
    CREATE_MODAL(document.querySelector(".loader-wrap").innerHTML); //spinner
    window.onclick = function(e){
        if (e.target === document.querySelector("#modalbg")) {
            return;
        }
    }

    firebase.auth().signOut().then(() => {
        profile = null;
        localStorage.removeItem("efiqo user data");
        sessionStorage.removeItem("efiqo temp data");
        history.go(0);
    }).catch((error) => {
        CREATE_MODAL("An error occured. Please try again.")
        console.error("An error occurred", error);
    })
}