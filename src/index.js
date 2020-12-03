let infoBox = document.querySelector("#container-box")
const baseUrl = "http://localhost:3000"
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
            <input type="button" name="submitProfile" class="btn btn-info" value="Complete Registration">
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
        case "addContactDetail":
            addContactForm()
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
            editContactForm()
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
        contacts(e)
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
        state.page = "addContactDetail"
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

function contacts() {
    console.log("contacts clicked")
    state.page = "contacts"
    render()
}

function prevPage()
{
    if (currentPage > 1) {
        currentPage--;
        changePage(currentPage);
    }
}

function nextPage()
{
    if (currentPage < numPages()) {
        currentPage++;
        changePage(currentPage);
    }
}

function beginPage()
{
    if(currentPage > 1) {
        currentPage = 1
        changePage(currentPage)
    }
}

function endPage()
{
    if (currentPage < numPages()) {
        currentPage=numPages()
        changePage(currentPage);
    }
}
    
function changePage(page)
{
    let contactsTable = document.getElementById("contactsContentDiv");
    let pageSpan = document.getElementById("page");
    // Validate page
    if (page < 1) page = 1;
    if (page > numPages()) page = numPages();
    document.getElementById("logoffButton").classList.remove("hidden")
    document.getElementById("profileButton").classList.remove("hidden")
    document.getElementById("addContactButton").classList.remove("hidden")
    document.getElementById("editContactButton").classList.add("hidden")
    contactsTable.innerHTML = contactsTableHeader;
    let tableRef = document.getElementById("Contacts").getElementsByTagName("tbody")[0];

    for (let i = (page-1) * recordsPerPage; i < (page * recordsPerPage) && i < contactObjects.length; i++) {
        // Insert a row in the table at the last row
        let newRow   = tableRef.insertRow();
        let newCell0  = newRow.insertCell(0);
        newCell0.innerHTML = `<a href="javascript:ContactDetail(${contactObjects[i].attributes.id})" id="contactDetail">detail</a>`
        let newCell1  = newRow.insertCell(1);
        let newText1  = document.createTextNode(contactObjects[i].attributes.owncall);
        newCell1.appendChild(newText1);
        let newCell2  = newRow.insertCell(2);
        let newText2  = document.createTextNode(contactObjects[i].attributes.call);
        newCell2.appendChild(newText2);
        let newCell3  = newRow.insertCell(3);
        let newText3  = document.createTextNode(contactObjects[i].attributes.qso_date);
        newCell3.appendChild(newText3);
        let newCell4  = newRow.insertCell(4);
        let newText4  = document.createTextNode(contactObjects[i].attributes.time_on.slice(11,19));
        newCell4.appendChild(newText4);
        let newCell5  = newRow.insertCell(5);
        let newText5  = document.createTextNode(contactObjects[i].attributes.band);
        newCell5.appendChild(newText5);
        let newCell6  = newRow.insertCell(6);
        let newText6  = document.createTextNode(contactObjects[i].attributes.mode);
        newCell6.appendChild(newText6);
        let newCell7  = newRow.insertCell(7);
        let newText7  = document.createTextNode(contactObjects[i].attributes.freq);
        newCell7.appendChild(newText7);
        let newCell8  = newRow.insertCell(8);
        let newText8  = document.createTextNode(contactObjects[i].attributes.country);
        newCell8.appendChild(newText8);
    }
    pageSpan.innerHTML = `${page} of ${numPages()}`;
    let btnNext = document.getElementById("btnNext");
    let btnPrev = document.getElementById("btnPrev");
    let btnEnd = document.getElementById("btnEnd");
    let btnBegin = document.getElementById("btnBegin");
    if (page == 1) {
        btnPrev.style.visibility = "hidden";
        btnBegin.style.visibility = "hidden";
    } else {
        btnPrev.style.visibility = "visible";
        btnBegin.style.visibility = "visible"
    }
    if (page == numPages()) {
        btnNext.style.visibility = "hidden";
        btnEnd.style.visibility = "hidden";
    } else {
        btnNext.style.visibility = "visible";
        btnEnd.style.visibility = "visible";
    }
    // Because the pagination for the contacts page we need some "local" eventListeners
    logoffButton.addEventListener("click", (e) => {
            e.preventDefault()
            logoff()
        })
    profileButton.addEventListener("click", (e) => {
            e.preventDefault()
            console.log("profile clicked")
            state.page = "profile"
            render()
        })
    addContactButton.addEventListener("click", (e) => {
            e.preventDefault()
            console.log("add Contact clicked")
            state.page = "addContactDetail"
            render()
        })
}

function numPages()
{
    return Math.ceil(contactObjects.length / recordsPerPage);
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
                userData=json.user.data.attributes
                state.page = "profile"
                currentUser = new User(userData)
                createInfo(json.success)
                render()
            }
        }
   })

}

function backToLogin() {
    localStorage.clear()
    state.page = "login"
    render()
}

hasToken()