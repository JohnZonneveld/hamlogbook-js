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
    if (state.page == "registerProfile") {
        document.getElementById("password").setAttribute("required","")
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

function updateProfile(e) {
    e.preventDefault()
    const csProfileInput = document.querySelector("#callsign").value
    const pwProfileInput = document.querySelector("#password").value
    const mqProfileInput = document.querySelector("#my_qth").value
    const emProfileInput = document.querySelector("#email").value
    const updateProfileData = {user: {
        callsign: csProfileInput,
        password: pwProfileInput,
        email: emProfileInput,
        my_qth: mqProfileInput
        }
    }
    fetch(baseUrl+`/users/${currentUser.userId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer: ${localStorage.getItem("jwt")}`
        },
        body: JSON.stringify(updateProfileData)
        
    })
    .then(response => response.json())
    .then(json => {
        if (json.message) {
            createInfo(json.message)
            backToLogin()
        } else {
            if (json.errors) {
                localStorage.setItem("jwt", json.auth_token)
                createInfo(json.errors)
                state.page = "login"
                render()
            } 
            else {
                userData=json.user.data.attributes
                state.page = "profile"
                currentUser = new User(userData)
                createInfo(json.success)
                render()
            }
        }
    })
}

function registerProfile() {
    console.log("register clicked")
    state.page = "registerProfile"
    render()
}

function registerPage() {
    document.getElementById("homeButton").classList.remove("hidden")
    infoBox.innerHTML += registerForm
}

function submitProfile() {
    csRegisterInput=document.getElementById("callsign").value.toUpperCase()
    pwRegisterInput=document.getElementById("password").value
    emRegisterInput=document.getElementById("email").value
    gsRegisterInput=document.getElementById("my_qth").value
    const registerProfileData = {user: {
        callsign: csRegisterInput,
        password: pwRegisterInput,
        email: emRegisterInput,
        my_qth: gsRegisterInput
        }
    }
    fetch(baseUrl+`/auth/register`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(registerProfileData)
    })
    .then(response => response.json())
    .then(json => {
        localStorage.setItem("jwt", json.auth_token)
        if (json.message) {
            createInfo(json.message)
            backToLogin()
        } else {
            if (json.errors) {
                createInfo(json.errors)
            } 
            else {
                userData=json.user.data.attributes
                state.page = "profile"
                currentUser = new User(userData)
                createInfo(json.success)
                render()
            }
        }
   })

}

