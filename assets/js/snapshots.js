const SNAPSHOTS = [
    {
        image: "./assets/images/idea-bulb.jpg",
        tagline: "Study smarter, more effectively and improve active recall"
    },
    {
        image: "./assets/images/A+_excellent.jpg",
        tagline: "Set yourself on the path to academic excellence."
    },
    {
        image: "./assets/images/improvement-graph.jpg",
        tagline: "Increase your productivity while you study."
    },
    {
        image: "./assets/images/studying-student.jpeg",
        tagline: "Supercharge your study sessions."
    }
]

function RENDER_SHAPSHOTS(snapshots) {
    snapshots.map((snapshot) => {
        document.querySelector("#snapshots_list").innerHTML += `
            <li>
                <div class="snapshot_card">
                    <img src=${snapshot.image} width="" loading='lazy' draggable='false'/>
                    <p class="snapshot_text">${snapshot.tagline}</p>
                </div>
            </li>
        `
    });
}

RENDER_SHAPSHOTS(SNAPSHOTS);