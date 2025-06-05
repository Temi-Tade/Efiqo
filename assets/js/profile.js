let blob;
let file;
let profileValues;
let isProfileComplete;
let usernameExists;

if (localStorage.getItem("efiqo user data")) {
    profileValues = Object.values(profile).filter((val) => val !== false)
    isProfileComplete = profileValues.some(val => !!val === false);

    if (isProfileComplete) {
        alert("Your profile appears to be incomplete. Kindly update your profile to start using efIQo");
        VIEW_PROFILE();
        window.onclick = function(e){
            if (e.target === document.querySelector("#modalbg")) {
                alert("Your profile appears to be incomplete. Kindly update your profile to start using efIQo");
                return;
            }
        }
    }
}

function FETCH_USER_PROFILE(){
    let sessionProfile;
    if (localStorage.getItem("efiqo user data")) {
        sessionProfile = JSON.parse(localStorage.getItem("efiqo user data"));
    }

    [...document.querySelectorAll(".get-started")].map(el => el.style.display = !sessionProfile ? 'block' : 'none');
    document.querySelector(".create-new-btn").disabled = !sessionProfile ? true : false;

    document.querySelector("#profile-image").innerHTML = sessionProfile && sessionProfile.pfp.url ? `<img src='${sessionProfile.pfp.url}' width='50' loading="lazy">` : `<i class='fa-solid fa-user'></i>`;
    if(sessionProfile) var displayName = sessionProfile.userName ? sessionProfile.userName : sessionProfile.fullName.slice(0, sessionProfile.fullName.indexOf(" "));
    document.querySelector("#greeting").innerHTML = !sessionProfile ? "" : `Hello, ${displayName} 👋`;

    [...document.querySelectorAll(".signed-in")].map(el => el.style.display = !sessionProfile ? 'block' : 'none');
    [...document.querySelectorAll(".signed-out")].map(el => el.style.display = !sessionProfile ? 'none' : '');
};

FETCH_USER_PROFILE();

function VALIDATE_USERNAME(val) {
    let dbUsernames = [];

    document.querySelector("#available-status").setAttribute("class", 'fa-solid fa-circle-notch fa-spin');
    document.querySelector("#available-status").style.color = "#eee";
    
    db.collection("users")
    .where("userName", "!=", "")
    .get()
    .then((querySnapshot) => {
        querySnapshot.forEach(doc => {
            dbUsernames.push(doc.data().userName);
        })

        dbUsernames.forEach(username => {
            if ((val.trim().length < 4) || (username.toLowerCase() === val.toLowerCase().trim())) {
                document.querySelector("#available-status").setAttribute("class", 'fa-solid fa-times');
                document.querySelector("#available-status").style.color = "red";
                document.querySelector(".update-field button").disabled = true;
                usernameExists = true;
                return;
            }else{
                document.querySelector("#available-status").setAttribute("class", 'fa-solid fa-check');
                document.querySelector("#available-status").style.color = "green";
                document.querySelector(".update-field button").disabled = false;
                usernameExists = false;
                return;
            }
        }) 
    });
}

function VIEW_PROFILE() {
    //todo: convert dob
    CHECK_PREMIUM();
    profile = JSON.parse(localStorage.getItem("efiqo user data"));

    try {
        CREATE_MODAL(`
            <form id="user-profile-form" autocomplete="off">
                <div class='edit-profile-btn-wrap'>
                    <button class="transparent-btn" id="edit-profile" type='button'>Edit Profile <i class='fa-solid fa-edit'></i></button>
                </div>
    
                <h4>MY PROFILE</h4><br>
    
                <div class='field pfp-field'>
                    <img id="avatar" src='${!profile.pfp.url ? "./assets/images/default_avatar.png" : profile.pfp.url}' alt="User Avatar" loading='lazy' draggable="false"/>
                    <label for='pfp' id='upload-pfp'>Upload Avatar <i class='fa-solid fa-upload'></i></label>
                    <input type='file' name='pfp' id='pfp' value='${profile.pfp.file.name}' accept='*.png, *.jpg, *.jpeg, *.tiff, *.gif, *.webp' disabled/>
                </div>
    
                <h5>Personal Information</h5><br>
                
                <div class='field'>
                    <label for='uname'>
                        USER NAME
                        <i id='available-status' class=''></i>
                    </label>
                    <input type='text' name='uname' id='uname' value='${profile.userName}' disabled oninput='VALIDATE_USERNAME(this.value)'/>
                </div>
    
                <div class='field'>
                    <label for='fname'>FULL NAME</label>
                    <input type='text' name=fname id='fname' value="${profile.fullName}" disabled/>
                </div>
    
                <div class='field'>
                    <label for='dob'>DATE OF BIRTH</label>
                    <input type='date' name='dob' id='dob' value='${profile.dob}' disabled/>
                </div>
    
                <div class='field'>
                    <label for='gender'>SEX</label>
                    <select name='gender' id='gender' value='${profile.gender}' disabled>
                        <option value="">--select--</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>
    
                <h5>Contact Information</h5>
                <div class='field'>
                    <label for='email'>EMAIL ADDRESS</label>
                    <input type='email' name='email' id='email' inputmode=email value='${profile.email}' disabled/>
                </div>
    
                <div class='field'>
                    <label for='tel'>PHONE NUMBER (with country code)</label>
                    <input type='tel' name='tel' id='tel' inputmode='tel'  value='${profile.tel}' disabled/>
                </div>
    
                <h5>Academic Information</h5>
                <div class='field'>
                   <label for='edu_level'>CURRENT LEVEL OF EDUCATION</label>
                    <select name='edu_level' id='edu_level' value='${profile.level}' disabled>
                        <option value="">--select--</option>
                        <option value="Pre-primary">Pre-primary</option>
                        <option value="Primary">Primary</option>
                        <option value="Secondary (High School)">Secondary (High School)</option>
                        <option value="College (Undergrad)">College (Undergrad)</option>
                        <option value="College (Postgrad)">College (Postgrad)</option>
                        <option value="others">Others</option>
                    </select>
                </div>

                <div class='premium'>
                    <button type='button' class="transparent-btn" onclick="CREATE_MODAL(document.querySelector('#get-premium').innerHTML);">Get Premium <span class="fa-regular fa-star"></span></button>
                </div>
    
                <div class='field update-field'>
                <button>Update Profile <i class='fa-solid fa-refresh'></i></button>
                </div>

                <div class='field'>
                    <button type='button' class='sign-out' onclick='signOut()'>Sign Out <i class='fa-solid fa-sign-out'></i></button>
                </div>

                <div class='field'> 
                    <ul class="terms">
                        <li><button type="button" onclick="INIT_SHARE()" class="transparent-btn">Share efIQo <span class="fa-solid fa-share-nodes"></span></button></li>
                        <li><button type="button" onclick="window.open('https:\/\/buymeacoffee.com/temiloluwa')" class="transparent-btn">Support efIQo <span class="fa-solid fa-donate"></span></button></li>
                        <li><button type="button" class="transparent-btn" onclick="DISPLAY_TERMS()">Terms of Use</button></li>
                    </ul>
                </div>


                <div class='field contact-field'>
                    <div class="contact">
                        <ul type="none">
                            <li><a href="mailto:tenderluxetechenterprises@gmail.com" class="fa-regular fa-envelope"></a></li>
                            <li><a href="https://x.com/Temi_tade2805/" class="fa-brands fa-x-twitter"></a></li>
                            <li><a href="https://t.me/kintade_/" class="fa-brands fa-telegram"></a></li>
                        </ul>
                    </div>
                </div>

                <div class='field delete-field'>
                    <button type='button'>Delete Account <i class='fa-solid fa-trash'></i></button>
                </div>
            </form>    
        `);
    
        var parent = document.querySelector("#user-profile-form");
    
        var options = [...parent.querySelectorAll("select option")];
        options.forEach(option => {
            if (option.value === profile.gender || option.value === profile.level) {
                option.selected = true;
            }
        })
    
        parent.querySelector("input[type=file]").onchange = function(e){
            var fileReader = new FileReader();
            file = e.target.files[0];
            fileReader.onload = function(e){
                parent.querySelector("img").src = e.target.result;
                blob = e.target.result;
            }
    
            fileReader.readAsDataURL(file);
        }
    
        document.querySelector("#edit-profile").onclick = function() {
            this.disabled = true;
            [...parent.querySelectorAll(":disabled")].map(field => {
                field.disabled = false;
                if (field.id === "email") {
                    field.disabled = true;
                }
            });
            parent.querySelector(".update-field button").style.display = "block";
            parent.querySelector(".delete-field button").style.display = "none";
            parent.querySelector(".pfp-field label").style.display = "block";
        }
    
        parent.onsubmit = function(e){
            e.preventDefault();

            if (usernameExists) {
                alert("Username already exists.");
                return;
            }
                
            profile.userName = parent.querySelector("#uname").value.trim();
            profile.fullName = parent.querySelector("#fname").value.trim();
            profile.dob = parent.querySelector("#dob").value.trim();
            profile.gender = parent.querySelector("#gender").value.trim();
            profile.email = parent.querySelector("#email").value.trim();
            profile.tel = parent.querySelector("#tel").value.trim();
            profile.level = parent.querySelector("#edu_level").value.trim();
            profile.pfp.url = blob || profile.pfp.url;
            // profile.pfp.file = file || profile.pfp.file;

            profileValues = Object.values(profile).filter((val) => val !== false)
            isProfileComplete = profileValues.some(val => !!val === false);
        
            if (isProfileComplete) {
                alert("Your profile appears to be incomplete. Kindly update your profile to start using efIQo");
                // VIEW_PROFILE();

                window.onclick = function(e){
                    if (e.target === document.querySelector("#modalbg")) {
                        alert("Your profile appears to be incomplete. Kindly update your profile to start using efIQo");
                        return;
                    }
                } 
            }else{
                writeToDB(profile.email, profile, () => {
                    alert("Profile successfully updated.");
                });
                parent.querySelector(".update-field button").style.display = "none";
                parent.querySelector(".delete-field button").style.display = "block";
                parent.querySelector(".pfp-field label").style.display = "none";
            }
        };
    
        document.querySelector(".delete-field button").onclick = function() {
            var prompt = confirm("You are about to delete your Efiqo account. This action is permanent and cannot be undone. Do you wish to continue?");
            if (!prompt) return;

            CREATE_MODAL("Deleting your account..."); //spinner
            window.onclick = function(e){
                if (e.target === document.querySelector("#modalbg")) {
                    return;
                }
            }
            
            //delete user account
            db.collection("users").doc(profile.email)
            .delete()
            .then(() => {
                profile = null;
                sessionStorage.removeItem("efiqo user data");
                sessionStorage.removeItem("efiqo temp data");
                history.go(0);
            })
            .catch((error) => {
                console.error(error);
                CREATE_MODAL("An error occured. Please try again.");
            })
        }
    } catch (error) {
        console.error(error);
        CREATE_MODAL("An error occured while loading your profile. Please refresh this page.");
    }
};