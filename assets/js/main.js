const CREATE_MODAL = (text) => {
    document.querySelector("#modalbg").style.display = "block";
    document.querySelector("#modalbg").animate({
        opacity: ["0", "1"],
    }, {
        iterations: 1,
        duration: 500,
    })
    document.querySelector("#modal").innerHTML = text
    document.querySelector("#modal").scrollTop = 0;

    window.onclick = (ev) => {
        if (ev.target === document.querySelector("#modalbg")) {
            document.querySelector("#modalbg").animate({
                opacity: ["1", "0"],
            }, {
                iterations: 1,
                duration: 500,
            });
            setTimeout(() => {
                document.querySelector("#modalbg").style.display = "none"
            }, 490);
        };
    };
};

const BETA_USERS = [
    {
        firstName: "Muhammad Jamshaid",
        lastName: "Ali",
        email: "jamshaid8081@gmail.com"
    },
    {
        firstName: "Deen",
        lastName: "",
        email: "Sharafadeenadewale35@gmail.com"
    },
    {
        firstName: "Dhanamjay",
        lastName: "",
        email: "kanipakkamdhanamjay@gmail.com"
    },
    {
        firstName: "Mrunank",
        lastName: "Pawar",
        email: "mrunankpawar05@gmail.com"
    },
    {
        firstName: "Levi",
        lastName: "",
        email: "Levinstar116@gmail.com"
    },
    {
        firstName: "Kehinde",
        lastName: "David",
        email: "omotosokehinde2002@gmail.com"
    },
    {
        firstName: "Oluwatobiloba",
        lastName: "",
        email: "oluwatobilobafemi25@gmail.com"
    },
    {
        firstName: "Heesak",
        lastName: "",
        email: "adesuyiojo04@gmail.com"
    },
    {
        firstName: "Temiloluwa",
        lastName: "Akintade",
        email: "akintadetemi19@gmail.com"
    },
    {
        firstName: "abhi",
        lastName: "",
        email: "abhi394040@gmail.com"
    },
    {
        firstName: "God'sfavour",
        lastName: "",
        email: "engineeringtheimpossible5@gmail.com"
    },
    {
        firstName: "Robust",
        lastName: "King",
        email: "paulabodunrin03@gmail.com"
    },
    {
        firstName: "Daniel",
        lastName: "Akinade",
        email: "danielscholaressay04@gmail.com"
    },
    {
        firstName: "Christiana",
        lastName: "Ilesanmi",
        email: "ilesanmichristiana29@gmail.com"
    }
];

var user_data = {
    userName: "",
    theme: "device",
    createdOn: new Date().toUTCString(),
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
    flashcards: [],
    quizzes: []
}