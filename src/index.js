let infoBox = document.querySelector("#container-box")
const baseUrl = "http://localhost:3000"
// const baseUrl = "https://hamlogbook.herokuapp.com"
const gMapsScript = "https://maps.googleapis.com/maps/api/js?callback=initMap&signed_in=true&key=AIzaSyBXq06q4pG6fATSosF-sSte5QK8WuanI1Q&language=en"
const infoLine = document.getElementById("infoViewPort")
const buttons = document.getElementsByClassName("btn")
let user = {}
let page

// set initial state and user
let state = {page: "login"}

const loginPage = `
    <h2 class="text-center text-info">Login</h2>
    <div id="loginDiv">
        <form id="login-form" class="form">
            <div id="form-group" class="form-group">
                <label for="callsign" class="text-info">Callsign:</label>
                <input type="text" name="callsign" id="callsign" class="form-control">
            </div>
            <div class="form-group">
                <label for="password" class="text-info">Password:</label>
                <input type="password" name="password" id="password" class="form-control">
            </div>
            <input id="btn" type="submit" name="login" class="btn btn-info" value="Login">
            <input id="btn" type="button" name="registerProfile" class="btn btn-info" value="Register">
        </form>
    </div>
`

const registerForm = `
    <h2 class="text-center text-info">Register</h2>
    <div id="registerProfileDiv">
        <form>
            <div class="form-group">
                <label for="callsign" class="text-info">Callsign: </label>
                <input type="text" class="form-control" id="callsign"placeholder="Callsign" required>
            </div>
            <div class="form-group">
                <label for="email" class="text-info">Email: </label>
                <input type="text" class="form-control" id="email"placeholder="Email" required>
            </div>
            <div class="form-group">
                <label for="my_qth" class="text-info">Grid Square: </label>
                <input type="text" class="form-control" id="my_qth" placeholder="Grid Square, format AA11((aa)(11))" pattern="[A-R]{2}[0-9]{2}([a-x]{2})?([0-9]{2})?" required>
            </div>
            <div class="form-group">
                <label for="password" class="text-info">Password:</label>
                <input type="password" name="password" id="password" class="form-control" placeholder="Password" required>
            </div>
            <input id="btn" type="button" name="submitProfile" class="btn btn-info" value="Complete Registration">
        </form>
    </div>
`

const navigationBar = `
        <div class="form-group text-left">
            <button type="button" name-"home" class="btn btn-info btn-md hidden" id="homeButton">Back To Login</button>
            <button type="button" name="logoff" class="btn btn-info btn-md hidden" id="logoffButton">Log Off</button>
            <button type="button" name="profile" class="btn btn-info btn-md hidden" id="profileButton">Profile</button>
            <button type="button" name="editProfile" class="btn btn-info btn-md hidden"id="editProfileButton">Edit Profile</button>
            <button type="button" name="contacts" class="btn btn-info btn-md hidden" id="contactsButton">Contacts</button>
            <button type="button" name="addContact" class="btn btn-info btn-md hidden" id="addContactButton">Add Contact</button>
            <button type="button" name="editContact" class="btn btn-info btn-md hidden" id="editContactButton">Edit Contact</button>
            <button type="button" name="deleteContact" class="btn btn-danger btn-md hidden" id="deleteContactButton">Delete Contact</button>
        </div>
    `

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

function render(id){
    infoBox.innerHTML = navigationBar
    switch (state.page){
        // first page people see to log in
        case "login":
            infoBox.innerHTML += loginPage
            // buttons for login and register page
            const registerButton = buttons.registerProfile
            const loginButton = buttons.login
            // event listeners for those buttons
            loginButton.addEventListener("click", function(e) {
                e.preventDefault()
                loginHandler(e)
            })
            registerButton.addEventListener("click", function(e) {
                e.preventDefault()
                registerProfile()
            })
        break; 
        case "registerProfile":
            registerPage()
            const submitProfileButton = buttons.submitProfile
            submitProfileButton.addEventListener("click", function(e) {
                e.preventDefault()
                submitProfile(e)
            })
        break;
        case "profile":
            showProfilePage()
        break;
        case "editProfile":
            editProfilePage()
            const updateProfileButton = buttons.updateProfile
            updateProfileButton.addEventListener("click", function(e) {
                e.preventDefault()
                updateProfile(e)
            })
        break;
        case "contacts":
            getContacts()
        break;
        case "addContact":
            ContactForm()
            addSubmitButton()
            const submitAddContactButton = buttons.submitAddContact
            submitAddContactButton.addEventListener("click", (e) => {
                    e.preventDefault()
                    submitAddContact(e)
                })
        break;
        case "contactDetail":
            contactDetail = getDisplayContactDetail(id)
        break;
        case "displayContact":
            displayContact()
        break;
        case "editContactDetail":
            ContactForm()
            const submitEditContactButton = buttons.submitEditContact
            submitEditContactButton.addEventListener("click", (e) => {
                e.preventDefault()
                submitEditContact(e)
            })
        break;
    }

    const editPofileButton = buttons.editProfile
    const logoffButton = buttons.logoff
    const contactsButton = buttons.contacts
    const addContactButton = buttons.addContact
    const homeButton = buttons.homeButton
    const profileButton = buttons.profileButton
    const deleteContactButton = buttons.deleteContactButton
    logoffButton.addEventListener("click", (e) => {
        e.preventDefault()
        logoff()
    })
    contactsButton.addEventListener("click", (e) => {
        e.preventDefault()
        contacts()
    })
    profileButton.addEventListener("click", (e) => {
        e.preventDefault()
        state.page = "profile"
        render()
    })
    editProfileButton.addEventListener("click", (e) => {
        e.preventDefault()
        editProfile()
    })
    editContactButton.addEventListener("click", (e) => {
        e.preventDefault()
        state.page = "editContactDetail"
        render()
    })
    addContactButton.addEventListener("click", (e) => {
        e.preventDefault
        state.page = "addContact"
        render()
    })
    homeButton.addEventListener("click", (e) => {
        e.preventDefault()
        state.page = "login"
        render()
    })
    deleteContactButton.addEventListener("click", (e) => {
        e.preventDefault()
        deleteContact()
    })
}

function hasToken(){
    if (!!localStorage.getItem("jwt")){
        loginWithToken(localStorage.getItem("jwt"))
    } else {
        render()
    }
}

function loginHandler(e) {
    e.preventDefault()
    console.log("login clicked")
    const csInput = document.querySelector("#callsign").value.toUpperCase()
    const pwInput = document.querySelector("#password").value
    const loginData = {user: {
        callsign: csInput,
        password: pwInput
        }
    }
    fetch(baseUrl+`/auth_user`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(loginData)
    })
    .then(response => response.json())
    .then(json => {
        localStorage.setItem("jwt", json.auth_token)
        if (json.errors) {
            createInfo(json.errors)
            state.page = "login"
            render()
        } else {
            userData=json.user.data.attributes
            state.page = "profile"
            currentUser = new User(userData)
            createInfo(json.success)
            render()
        }
    })
}

function loginWithToken(token){
    fetch(baseUrl+`/hastoken`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(
        response => response.json()
    )
    .then(json => {
        localStorage.setItem("jwt", json.auth_token)
        if (json.message) {
            createInfo(json.message)
            backToLogin()
        } else {
            currentUser = new User(json.userdata.data.attributes)
            state.page = "profile"
            render()
        }
    })
}

function logoff() {
    console.log("logoff clicked")
    localStorage.clear()
    state.page = "login"
    render()
}


function backToLogin() {
    localStorage.clear()
    state.page = "login"
    render()
}

hasToken()