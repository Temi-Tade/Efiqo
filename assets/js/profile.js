let data;
let blob;
let file;

function FETCH_USER_PROFILE(btn){
    var request = indexedDB.open("efiqo");
    request.onsuccess = function(){
        var trx = request.result.transaction("user_data");
        var objectStore = trx.objectStore("user_data");
        var userData = objectStore.getAll();
        
        userData.onsuccess = async function(ev) {
            data = await ev.target.result;
            document.querySelector("#profile-image").innerHTML = data.length > 0 && data[0].pfp.url ? `<img src='${data[0].pfp.url}' width='50'>` : `<i class='fa-solid fa-user'></i>`;
            [...document.querySelectorAll(".get-started")].map(el => el.style.display = data.length === 0 ? 'block' : 'none');
            document.querySelector(".create-new-btn").disabled = data.length === 0 ? true : false;
            document.querySelector("#greeting").innerHTML = data.length === 0 ? "" : `Hello, ${data[0].userName} 👋`;
            [...document.querySelectorAll(".signed-in")].map(el => el.style.display = data.length === 0 ? 'block' : 'none');
            [...document.querySelectorAll(".signed-out")].map(el => el.style.display = data.length === 0 ? 'none' : '');
        };
    };
};

function VIEW_PROFILE() {
    //todo: convert dob
    CHECK_PREMIUM();
    try {
        CREATE_MODAL(`
            <form id="user-profile-form" autocomplete="off">
                <div class='edit-profile-btn-wrap'>
                    <button class="transparent-btn" id="edit-profile" type='button'>Edit Profile <i class='fa-solid fa-edit'></i></button>
                </div>
    
                <h4>MY PROFILE</h4><br>
    
                <div class='field pfp-field'>
                    <img id="avatar" src='${!data[0].pfp.url ? "./assets/images/default_avatar.png" : data[0].pfp.url}' alt="User Avatar" loading='lazy' draggable="false"/>
                    <label for='pfp' id='upload-pfp'>Upload Avatar <i class='fa-solid fa-upload'></i></label>
                    <input type='file' name='pfp' id='pfp' value='${data[0].pfp.file.name}' accept='*.png, *.jpg, *.jpeg, *.tiff, *.gif, *.webp' disabled/>
                </div>
    
                <h5>Personal Information</h5><br>
                
                <div class='field'>
                    <label for='uname'>USER NAME</label>
                    <input type='text' name='uname' id='uname' value='${data[0].userName}' disabled/>
                </div>
    
                <div class='field'>
                    <label for='fname'>FULL NAME</label>
                    <input type='text' name=fname id='fname' value='${data[0].fullName}' disabled/>
                </div>
    
                <div class='field'>
                    <label for='dob'>DATE OF BIRTH</label>
                    <input type='date' name='dob' id='dob' value='${data[0].dob}' disabled/>
                </div>
    
                <div class='field'>
                    <label for='gender'>SEX</label>
                    <select name='gender' id='gender' value='${data[0].gender}' disabled>
                        <option value="">--select--</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>
    
                <h5>Contact Information</h5>
                <div class='field'>
                    <label for='email'>EMAIL ADDRESS</label>
                    <input type='email' name='email' id='email' inputmode=email value='${data[0].email}' disabled/>
                </div>
    
                <div class='field'>
                    <label for='tel'>PHONE NUMBER (with country code)</label>
                    <input type='tel' name='tel' id='tel' inputmode='tel'  value='${data[0].tel}' disabled/>
                </div>
    
                <h5>Academic Information</h5>
                <div class='field'>
                   <label for='edu_level'>CURRENT LEVEL OF EDUCATION</label>
                    <select name='edu_level' id='edu_level' value='${data[0].level}' disabled>
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
                    <button type='button' class="transparent-btn" onclick="IS_EARLY_ACCESS()">Get Premium <span class="fa-regular fa-star"></span></button>
                </div>
    
                <div class='field update-field'>
                    <button>Update Profile <i class='fa-solid fa-refresh'></i></button>
                </div>

                <div class='field'> 
                    <ul class="terms">
                        <li><button type="button" onclick="IS_EARLY_ACCESS()//INIT_SHARE()" class="transparent-btn">Share efIQo <span class="fa-solid fa-share-nodes"></span></button></li>
                        <li><button type="button" onclick="IS_EARLY_ACCESS();//window.open('https:\/\/buymeacoffee.com/temiloluwa')" class="transparent-btn">Support efIQo <span class="fa-solid fa-donate"></span></button></li>
                        <li><button type="button" class="transparent-btn" onclick="DISPLAY_TERMS()">Terms of Use</button></li>
                    </ul>
                </div>

                <div class='field contact-field'>
                    <div class="contact">
                        <ul type="none">
                            <li><a href="mailto:dev.mode006@gmail.com" class="fa-regular fa-envelope"></a></li>
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
            if (option.value === data[0].gender || option.value === data[0].level) {
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
            });
            parent.querySelector(".update-field button").style.display = "block";
            parent.querySelector(".delete-field button").style.display = "none";
            parent.querySelector(".pfp-field label").style.display = "block";
        }
    
        parent.onsubmit = function(e){
            e.preventDefault();
            var request = indexedDB.open("efiqo");
            request.onsuccess = function(){
                var trx = request.result.transaction("user_data", "readwrite");
                var objectStore = trx.objectStore("user_data");
                var userData = objectStore.getAll();
                
                userData.onsuccess = async function(ev) {
                    data = await ev.target.result;
                    data[0].userName = parent.querySelector("#uname").value;
                    data[0].fullName = parent.querySelector("#fname").value;
                    data[0].dob = parent.querySelector("#dob").value;
                    data[0].gender = parent.querySelector("#gender").value;
                    data[0].email = parent.querySelector("#email").value;
                    data[0].tel = parent.querySelector("#tel").value;
                    data[0].level = parent.querySelector("#edu_level").value;
                    data[0].pfp.url = blob || data[0].pfp.url;
                    data[0].pfp.file = file || data[0].pfp.file;
                    objectStore.put(data[0]);
                };
            };
    
            [...parent.querySelectorAll(":disabled")].map(field => {
                field.disabled = true;
            });
            parent.querySelector(".update-field button").style.display = "none";
            parent.querySelector(".delete-field button").style.display = "block";
            parent.querySelector(".pfp-field label").style.display = "none";
            alert("Profile Updated!");
            FETCH_USER_PROFILE();
        }

        document.querySelector(".delete-field button").onclick = function() {
            var prompt = confirm("You are about to delete your Efiqo account. This action is permanent and cannot be undone. Do you wish to continue?");
            if (!prompt) return;
            //var request = indexedDB.open("efiqo", 1);
            var deleteRequest = indexedDB.deleteDatabase("efiqo")
            deleteRequest.onsuccess = function() {
                CREATE_MODAL("Account successfuly deleted");
                history.go(0);
            }

            deleteRequest.onblocked = () => {
                CREATE_MODAL("Please wait while we delete your account");
                setTimeout(() => {
                    history.go(0);
                }, 1500);
            }

            deleteRequest.onerror = () => {
                CREATE_MODAL("An error occured.");
            }
        }
    } catch (error) {
        // console.error(error, "No user profile found")
    }
};

FETCH_USER_PROFILE(document.querySelector("header nav ul li button"));