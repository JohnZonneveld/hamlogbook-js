let infoBox = document.querySelector('#container-box')
const baseUrl = "http://localhost:3000"
const usersUrl = "http://localhost:3000/users/"
const loginUrl = "http://localhost:3000/auth_user"
const registerUrl = 'http://localhost:3000/auth/register'
const alertLine = document.getElementById("alertViewPort")
const buttons = document.getElementsByClassName("btn")
let user = {}
// let token
let contactObjects = []
let current_page = 1;
let records_per_page = 15

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
                <input type="button" name="registerProfile" class="btn btn-info btn-md" value="Register">
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
            const registerButton = buttons.registerProfile
            const loginButton = buttons.login
            // event listeners for those buttons
            loginButton.addEventListener("click", (e) => loginHandler(e))
            registerButton.addEventListener("click", (e) => registerProfile())
        break; 
        case 'profile':
            profilePage(user)
            // buttons = document.getElementsByClassName("btn btn-info btn-md")
            const editPofileButton = buttons.editProfile
            const logoffButton = buttons.logoff
            const contactsButton = buttons.contacts
            // event listeners for those buttons
            logoffButton.addEventListener("click", (e) => logoff())
            contactsButton.addEventListener("click", (e) => contacts(e))
            editPofileButton.addEventListener("click", (e) => editProfile())
        break;
        case 'editProfile':
            editProfilePage()
            const updateProfileButton = buttons.updateProfile
            updateProfileButton.addEventListener("click", (e) => updateProfile(e))
        break;
        case 'registerProfile':
            registerPage()
            const submitProfileButton = buttons.submitProfile
            submitProfileButton.addEventListener("click", (e) => submitProfile(e))
        break;
        case 'contacts':
            navigationBar()
            contactsPage()
            // logoffButton = buttons.logoff
            // logoffButton.addEventListener("click", (e) => logoff())
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
        case 'contacts':
            infoBox.innerHTML =
            `
            <div class='form-group text-left'>
                <button type="button" name="logoff" class="btn btn-info btn-md">Log Off</button>
            </div>
            `
        break;

    }
}

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
        debugger
        if (!!json.user) {
            userData=json.user.data.attributes
            state.page = 'profile'
            // state.user = json.user
            currentUser = new User(userData)
            localStorage.setItem('jwt', json.auth_token)
            render()
            } 
        else {
            showAlert(json.error)
            state.page = 'login'
            render()
        }
    })
}

class User {
    constructor({callsign, id, email, my_qth}){
        this.callsign = callsign
        this.userId = id
        this.email = email
        this.my_qth = my_qth
    }
}

function loginWithToken(token){
        fetch("http://localhost:3000/hastoken", {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        .then(response => response.json())
        .then(json => {
            if (!!json.errors){
                localStorage.clear()
                showAlert(json.errors)
                state.page = 'login'
                render()
            } else {
                debugger
                currentUser = new User(json.userdata.data.attributes)
                localStorage.setItem('jwt', json.auth_token)
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
        state.page = 'contacts'
        render()
    }

    function contactsPage() {
        fetch("http://localhost:3000/contacts", {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt')}`
          }
        })
        .then(response => response.json())
        .then(json => {
            contactObjects = json.contacts
            localStorage.setItem('jwt', json.auth_token)
            debugger
            infoBox.innerHTML += `
                <div id="contactsTable"></div>
                <a href="javascript:prevPage()" id="btn_prev">Prev</a>
                <a href="javascript:nextPage()" id="btn_next">Next</a>
                page: <span id="page"></span>
            `
            changePage(1)
        })
    }

    function prevPage()
    {
        if (current_page > 1) {
            current_page--;
            changePage(current_page);
        }
    }

    function nextPage()
    {
        if (current_page < numPages()) {
            current_page++;
            changePage(current_page);
        }
    }
    
    function changePage(page)
    {
        let btn_next = document.getElementById("btn_next");
        let btn_prev = document.getElementById("btn_prev");
        let contacts_table = document.getElementById("contactsTable");
        let page_span = document.getElementById("page");
    
        // Validate page
        if (page < 1) page = 1;
        if (page > numPages()) page = numPages();

        contacts_table.innerHTML = `
            <table id="myContacts">
                <thead>
                    <tr>
                        <th>Your Contacts</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td>My footer</td>
                    </tr>
                <tfoot>
            </table>
        `;
        let tableRef = document.getElementById('myContacts').getElementsByTagName('tbody')[0];

        for (let i = (page-1) * records_per_page; i < (page * records_per_page) && i < contactObjects.length; i++) {
            // contacts_table.innerHTML += contactObjects[i].call + "<br>"
            // Insert a row in the table at the last row
            let newRow   = tableRef.insertRow();

            // Insert a cell in the row at index 0
            let newCell  = newRow.insertCell(0);

            // Append a text node to the cell
            let newText  = document.createTextNode(contactObjects[i].call);
            newCell.appendChild(newText);
        }
        page_span.innerHTML = page;

        if (page == 1) {
            btn_prev.style.visibility = "hidden";
        } else {
            btn_prev.style.visibility = "visible";
        }

        if (page == numPages()) {
            btn_next.style.visibility = "hidden";
        } else {
            btn_next.style.visibility = "visible";
        }
    }

    function numPages()
    {
        return Math.ceil(contactObjects.length / records_per_page);
    }

    function editProfile() {
        console.log('editProfile pressed')
        state.page = 'editProfile'
        render()
    }

    function editProfilePage() {
        infoBox.innerHTML = `
        <h2 class="text-center text-info">Edit Profile</h2>
        <div id="profileDiv">
            <hr>
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
        fetch(usersUrl+ `${currentUser.userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer: ${localStorage.getItem('jwt')}`
            },
            body: JSON.stringify(updateProfileData)
            
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

    function registerProfile() {
        console.log('register pressed')
        state.page = 'registerProfile'
        // debugger
        render()
    }

    function registerPage() {
        infoBox.innerHTML = `
        <h2 class="text-center text-info">Register</h2>
        <div id="registerProfileDiv">
            <hr>
            <form>
                <div class="form-group">
                    <label for="callsign" class="text-info">Callsign: </label>
                    <input type="text" class="form-control" id="callsign"placeholder="Callsign">
                </div>
                <div class="form-group">
                    <label for="email" class="text-info">Email: </label>
                    <input type="text" class="form-control" id="email"placeholder="Email">
                </div>
                <div class="form-group">
                    <label for="my_qth" class="text-info">Grid Square: </label>
                    <input type="text" class="form-control" id="my_qth"placeholder="Grid Square">
                </div>
                <div class="form-group">
                    <label for="password" class="text-info">Password:</label>
                    <input type="password" name="password" id="password" class="form-control" placeholder="Password">
                </div>
                <button type="button" name="submitProfile" class="btn btn-info">Complete Registration</button>
            </form>
        </div>
        `
    }

    function submitProfile(e) {
        e.preventDefault()
        csRegisterInput=document.getElementById('callsign').value
        pwRegisterInput=document.getElementById('password').value
        emRegisterInput=document.getElementById('email').value
        gsRegisterInput=document.getElementById('my_qth').value
        const registerProfileData = {user: {
            callsign: csRegisterInput,
            password: pwRegisterInput,
            email: emRegisterInput,
            my_qth: gsRegisterInput
            }
        }
        fetch(registerUrl, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(registerProfileData)
        })
        .then(response => response.json())
        .then(json => {
        if (!!json.user) {
            userData=json.user.data.attributes
            state.page = 'profile'
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



    hasToken()