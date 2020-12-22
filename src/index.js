// Switch between either local or heroku environment
const baseUrl = "http://localhost:3000"
// const baseUrl = "https://hamlogbook.herokuapp.com"

const buttons = document.getElementsByClassName("btn")
let infoBox = document.querySelector("#container-box")

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
            <input id="btn" type="button" name="login" class="btn btn-info" value="Login">
            <input id="btn" type="button" name="register" class="btn btn-info" value="Register">
        </form>
    </div>
`

// All navigation buttons are created hidden
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


function hasToken(){
    if (!!localStorage.getItem("jwt")){
        loginWithToken(localStorage.getItem("jwt"))
    } else {
        render()
    }
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
function loginHandler() {
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

function register() {
    console.log("register clicked")
    state.page = "register"
    render()
}

function render(id){
    infoBox.innerHTML = navigationBar
    switch (state.page){
        // first page people see to log in
        case "login":
            infoBox.innerHTML += loginPage
            // buttons for login and register
            const registerButton = buttons.register
            const loginButton = buttons.login
            // event listeners for those buttons
            loginButton.addEventListener("click", loginHandler)
            registerButton.addEventListener("click", register)
        break; 
        case "register":
            userForm()
            profileSubmitButton()
            const submitProfileButton = buttons.submitProfile
            submitProfileButton.addEventListener("click", submitProfile)
        break;
        case "profile":
            showProfilePage()
        break;
        case "editProfile":
            userForm()
            profileSubmitButton()
            const updateProfileButton = buttons.updateProfile
            updateProfileButton.addEventListener("click", updateProfile)
        break;
        case "contacts":
            getContacts()
        break;
        case "addContact":
            contactForm()
            contactSubmitButton()
            const submitAddContactButton = buttons.submitAddContact
            submitAddContactButton.addEventListener("click", submitAddContact)
        break;
        case "contactDetail":
            contactDetail = getDisplayContactDetail(id)
        break;
        case "displayContact":
            displayContact()
        break;
        case "editContact":
            contactForm()
            contactSubmitButton()
            const submitEditContactButton = buttons.submitEditContact
            submitEditContactButton.addEventListener("click", submitEditContact)
        break;
    }
    // Almost every page is rendered through render() so we have a central place
    // for the eventListeners for the navigation bar buttons
    const editPofileButton = buttons.editProfile
    const logoffButton = buttons.logoff
    const contactsButton = buttons.contacts
    const addContactButton = buttons.addContact
    const homeButton = buttons.homeButton
    const profileButton = buttons.profileButton
    const deleteContactButton = buttons.deleteContactButton
    logoffButton.addEventListener("click", logoff)
    contactsButton.addEventListener("click", getContacts)
    profileButton.addEventListener("click", function () {
            state.page = "profile"
            render()
        })
    editProfileButton.addEventListener("click", editProfile)
    editContactButton.addEventListener("click", function () {
            state.page = "editContact"
            render()
        })
    addContactButton.addEventListener("click", function () {
            state.page = "addContact"
            render()
        })
    homeButton.addEventListener("click", function () {
            state.page = "login"
            render()
        })
    deleteContactButton.addEventListener("click", deleteContact)
}

hasToken()