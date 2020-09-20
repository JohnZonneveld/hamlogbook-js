let infoBox = document.querySelector('#container-box')
const baseUrl = "http://localhost:3000"
const usersUrl = "http://localhost:3000/users/"
const loginUrl = "http://localhost:3000/auth_user"
const alertLine = document.getElementById("alertViewPort")
const buttons = document.getElementsByClassName("btn btn-info btn-md")
let user = {}
let token

// set initial state and user
let state = {page: 'login', user: null}

let loginPage = `
    <h2 class="text-center text-info">Login</h2>
    <div id="loginDiv">
        <hr>
        <form id="login-form" class="form">
            <div class="form-group">
                <label for="callsign" class="text-info">Callsign:</label>
                <input type="text" name="callsign" id="callsign" class="form-control">
            </div>
            <div class="form-group">
                <label for="password" class="text-info">Password:</label>
                <input type="password" name="password" id="password" class="form-control">
            </div>
            <div class="form-group text-text">
                <input type="submit" name="login" class="btn btn-info btn-md" value="Login">
                <input type="submit" name="register" class="btn btn-info btn-md" value="Register">
            </div>
        </form>
    </div>
    `

function profilePage() { 
    navigationBar()
    infoBox.innerHTML += `
    <div id="profileDiv">
        <hr>
        <h3>Your profile:</h3>
        <hr>
        <div class='table-responsive'>
            <table class='table table-sm table-borderless table-condensed table-hover'>
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

function render(){
    switch (state.page){
        // first page people see to log in
        case 'login':
            infoBox.innerHTML = loginPage
            // buttons for login and register page
            // const buttons = document.getElementsByClassName("btn btn-info btn-md")
            const registerMenu = buttons.register
            const loginButton = buttons.login
            // event listeners for those buttons
            loginButton.addEventListener("click", (e) => loginHandler(e))
            registerMenu.addEventListener("click", (e) => registerFormAdder(e))
        break; 
        case 'profile':
            profilePage(user)
            // buttons = document.getElementsByClassName("btn btn-info btn-md")
            const editPofileButton = buttons.editProfile
            const logoffButton = buttons.logoff
            const contactsButton = buttons.contacts
            // event listeners for those buttons
            logoffButton.addEventListener("click", (e) => logoff())
            contactsButton.addEventListener("click", (e) => contacts())
            editPofileButton.addEventListener("click", (e) => editProfile())
        break;

    }
}

function navigationBar(){
    // debugger
    switch (state.page){
        case 'profile':
            infoBox.innerHTML =
            `
                <br>
                <div class='form-group text-left'>
                    <button type="button" name="editProfile" class="btn btn-info btn-md">Edit Profile</button>
                    <button type="button" name="contacts" class="btn btn-info btn-md">Contacts</button>
                    <button type="button" name="logoff" class="btn btn-info btn-md">Log Off</button>
                </div>
            `
            
        break;
    }
}
// infoBox.innerHTML = navigationBar

function hasToken(){
    if (!!localStorage.getItem('jwt')){
        state.page = "logged-in"
        loginWithToken(localStorage.getItem('jwt'))
    } else {
        render()
    }
}

function loginHandler(e) {
    e.preventDefault()
    const csInput = document.querySelector("#callsign").value
    const pwInput = document.querySelector("#password").value
    const loginData = {user: {
        callsign: csInput,
        password: pwInput
        }
    }
    fetch(loginUrl, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(loginData)
    })
    .then(response => response.json())
    .then(json => {
        // debugger
        if (!!json.user) {
            userData=json.user.data.attributes
            state.page = 'profile'
            // state.user = json.user
            currentUser = new User(userData)
            localStorage.setItem('jwt', json.auth_token)
            render()
            } 
        else {
            showAlert(json.errors)
            state.page = 'login'
            render()
        }
    })
}

class User {
    // debugger
    constructor({callsign, id, email, my_qth}){
        this.callsign = callsign
        this.userId = id
        this.email = email
        this.my_qth = my_qth
    }
}

function loginWithToken(token){
    // debugger
        fetch("http://localhost:3000/hastoken", {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        .then(response => response.json())
        .then(json => {
            // debugger
            if (!!json.errors){
                localStorage.clear()
                showAlert(json.errors)
                state.page = 'login'
                render()
            } else {
                debugger
                currentUser = new User(json.userdata.data.attributes)
                localStorage.setItem('jwt', json.jwt)
                state.page = 'profile'
                render()
            }
        })
        .catch(errors => showAlert(errors))
    }

    function showAlert(errors) {
        if (errors) {
        alertLine.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>${errors}</strong>
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        `}
        else {
            infoBox.innerHTML = ``
        }
    }

    function logoff() {
        localStorage.clear()
        state.page = 'login'
        render()
    }

    function contacts() {
        console.log('contacts pressed')
    }

    function editProfile() {
        console.log('editProfile pressed')
    }
    hasToken()