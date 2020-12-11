class User {
    constructor({callsign, id, email, my_qth}){
        this.callsign = callsign
        this.userId = id
        this.email = email
        this.my_qth = my_qth
    }
}

function editProfile() {
    console.log("editProfile clicked")
    state.page = "editProfile"
    render()
}

function editProfilePage() {
    document.getElementById("logoffButton").classList.remove("hidden")
    document.getElementById("profileButton").classList.remove("hidden")
    document.getElementById("contactsButton").classList.remove("hidden")
    infoBox.innerHTML += `
        <h2 class="text-center text-info">Edit Profile</h2>
        <div id="profileDiv">
            <form>
                <div class="form-group">
                    <label for="callsign" class="text-info">Callsign: </label>
                    <input type="text" class="form-control" id="callsign"  value="${currentUser.callsign}">
                </div>
                <div class="form-group">
                    <label for="email" class="text-info">Email: </label>
                    <input type="text" class="form-control" id="email" value="${currentUser.email}">
                </div>
                <div class="form-group">
                    <label for="my_qth" class="text-info">Grid Square: </label>
                    <input type="text" class="form-control" id="my_qth" value="${currentUser.my_qth}">
                </div>
                <div class="form-group">
                    <label for="password" class="text-info">Password:</label>
                    <input type="password" name="password" id="password" class="form-control" placeholder="Update your password">
                </div>
                <button type="button" name="updateProfile" class="btn btn-info">Update Profile</button>
            </form>
        </div>
    `
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
                debugger
                userData=json.user.data.attributes
                state.page = "profile"
                currentUser = new User(userData)
                createInfo(json.success)
                render()
            }
        }
   })

}
