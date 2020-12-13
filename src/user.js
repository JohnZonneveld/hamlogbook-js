let csInput
let pwInput
let emRegisterInput
let gsInput
let profileData = {}

class User {
    constructor(attributes) {
        if (attributes) {
            this.callsign = attributes.callsign
            this.userId = attributes.id
            this.email = attributes.email
            this.my_qth = attributes.my_qth
        } 
    }
}

function editProfile() {
    console.log("editProfile clicked")
    state.page = "editProfile"
    render()
}

function showProfilePage() { 
    document.getElementById("logoffButton").classList.remove("hidden")
    document.getElementById("contactsButton").classList.remove("hidden")
    document.getElementById("editProfileButton").classList.remove("hidden")
    infoBox.innerHTML += `
        <div id="profileDiv">
            <h4 class="text-center text-info">Your profile:</h4>
            <div class="table-responsive">
                <table class="table table-sm table-borderless table-condensed table-hover">
                    <tr>
                        <td><label class="text- text-info">Callsign: </h3></td><td>${currentUser.callsign}</td>
                    </tr>
                    <tr>
                        <td><label class="text-center text-info">Email: </h3></td><td>${currentUser.email}</td>
                    </tr>
                    <tr>
                        <td><label class="text-center text-info">Grid Square: </h3></td><td>${currentUser.my_qth}</td>
                    </tr>
                </table>
            </div>    
        </div>    
    `
}

function userForm() {
    let title
    let user
    if (state.page == "editProfile") {
        title = "Edit Profile"
        document.getElementById("logoffButton").classList.remove("hidden")
        document.getElementById("profileButton").classList.remove("hidden")
        document.getElementById("contactsButton").classList.remove("hidden")
        user = currentUser
    } else {
        document.getElementById("homeButton").classList.remove("hidden")
        title = "Create Profile"
        user = new User
    }
    infoBox.innerHTML += `
        <h2 class="text-center text-info">${title}</h2>
        <div id="profileDiv">
            <form>
                <div class="form-group form-inline ">
                    <label for="callsign" class="col-sm-3 text-info">Callsign: </label>
                    <input type="text" class="col-sm-6 form-control" id="callsign" value="${(typeof user.callsign == 'undefined') ? "":user.callsign}" required>
                </div>
                <div class="form-group form-inline">
                    <label for="email" class="col-sm-3 text-info">Email: </label>
                    <input type="email" class="col-sm-6 form-control" id="email" value="${typeof user.email == "undefined" ? "" : user.email}" required>
                </div>
                <div class="form-group form-inline">
                    <label for="my_qth" class="col-sm-3 text-info">Grid Square: </label>
                    <input type="text" class="col-sm-6 form-control" id="my_qth" value="${typeof user.my_qth == "undefined" ? "" : user.my_qth}" required pattern="[A-R]{2}[0-9]{2}([a-x]{2})?([0-9]{2})?">
                </div>
                <div class="form-group form-inline">
                    <label for="password" class="col-sm-3 text-info">Password:</label>
                    <input type="password" name="password" id="password" class="col-sm-6 form-control" placeholder="password">
                </div>
            </form>
        </div>
    `
    if (state.page == "register") {
        document.getElementById("password").setAttribute("required","")
    }
}

function readUserForm() {
    csInput = document.getElementById("callsign").value
    pwInput = document.getElementById("password").value
    emInput = document.getElementById("email").value
    gsInput = document.getElementById("my_qth").value
    profileData = {
        user: {
            callsign: csInput,
            password: pwInput,
            email: emInput,
            my_qth: gsInput
        }
    }
}

function profileSubmitButton() {
    if (state.page == "editProfile") {
        infoBox.innerHTML += `
            <br>
            <button type="button" name="updateProfile" class="btn btn-info">Update Profile</button>
        `
    } else {
        infoBox.innerHTML += `
            <br>
            <input id="btn" type="button" name="submitProfile" class="btn btn-info" value="Complete Registration">  
        `
    }
}

function updateProfile() {
    readUserForm()
    fetch(baseUrl+`/users/${currentUser.userId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer: ${localStorage.getItem("jwt")}`
        },
        body: JSON.stringify(profileData)
    })
    .then(response => response.json())
    .then(json => {
        localStorage.setItem("jwt", json.auth_token)
        // is session timed out, go to log in
        if (json.message) {
            createInfo(json.message)
            backToLogin()
        } else {
            if (json.errors) {
                // if errors encountered, display errors but stay on page
                createInfo(json.errors)
            } 
            else {
                // if successful display profile and create and set currentUser
                userData=json.user.data.attributes
                state.page = "profile"
                currentUser = new User(userData)
                createInfo(json.success)
                render()
            }
        }
    })
}

function submitProfile() {
    readUserForm()
    fetch(baseUrl+`/auth/register`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(profileData)
    })
    .then(response => response.json())
    .then(json => {
        localStorage.setItem("jwt", json.auth_token)
        // if registration fails and errors encountered, display errors
        if (json.errors) {
            createInfo(json.errors)
        } 
        else {
            // if successful display profile page
            userData=json.user.data.attributes
            state.page = "profile"
            currentUser = new User(userData)
            createInfo(json.success)
            render()
        }
   })
}