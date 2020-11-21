let infoBox = document.querySelector("#container-box")
const baseUrl = "http://localhost:3000"
const usersUrl = "http://localhost:3000/users/"
const loginUrl = "http://localhost:3000/auth_user"
const registerUrl = "http://localhost:3000/auth/register"
const contactsUrl = "http://localhost:3000/contacts/"
const gMapsScript = "https://maps.googleapis.com/maps/api/js?callback=initMap&signed_in=true&key=AIzaSyBXq06q4pG6fATSosF-sSte5QK8WuanI1Q&language=en"
const infoLine = document.getElementById("infoViewPort")
const buttons = document.getElementsByClassName("btn")
let user = {}
let contactObjects = []
let prevContacts = []
let currentPage = 1;
let recordsPerPage = 15
let remLatLon
let myLatLon
let page



// set initial state and user
let state = {page: "login", user: null}

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

const contactsTableHeader = `
    <table class="table-striped" id="Contacts">  
        <tr class="border_bottom">
            <td>
                <a class="btn btn-info btn-sm" id="btnNext" href="javascript:nextPage()" role="button">▶️</a>
                <a class="btn btn-info btn-sm" id="btnEnd" href="javascript:endPage()" role="button">⏭</a>
            </td>
            <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
        </tr>
        <tr style="font-weight:bold">
            <td></td>
            <td>Callsign</td>
            <td>Worked</td>
            <td>Date</td>
            <td>Time</td>
            <td>Band</td>
            <td>Mode</td>
            <td>Frequency</td>
            <td>Country</td>
        </tr>
        <tfoot>
            <tr class="border_top">
                <td><a class="btn btn-info btn-sm" id="btnPrev" href="javascript:prevPage()" role="button">◀️</a>
                <a class="btn btn-info btn-sm" id="btnBegin" href="javascript:beginPage()" role="button">⏮</a></td>
                <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
        <tfoot>
    </table>
`

const contactHeader =`
    <div id="contactsDiv">
        <h4 class="text-center text-info">Your contacts</h4>
        <div class="table-responsive" id="contactsContentDiv">
        </div>
    </div>
    page: <span id="page"></span>
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
                <input type="text" class="form-control" id="my_qth"placeholder="Grid Square, format AA11((aa)(11))" pattern="[A-R]{2}[0-9]{2}([a-x]{2})?([0-9]{2})?" required>
            </div>
            <div class="form-group">
                <label for="password" class="text-info">Password:</label>
                <input type="password" name="password" id="password" class="form-control" placeholder="Password" required>
            </div>
            <input type="button" name="submitProfile" class="btn btn-info" value="Complete Registration">
        </form>
    </div>
`

const prevContactsTableHeader = `
    <b>Previous contacts</b>
    <table class="table-striped" id="prevContacts">  
        <tr></tr>
        <tr style="font-weight:bold">
            <td>Callsign</td>
            <td>Date</td>
            <td>Time</td>
            <td>Band</td>
            <td>Mode</td>
            <td>Frequency</td>
            <td>Country</td>
        </tr>
    </table>
    <br>
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
    navigationBar()
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
        case "profile":
            showProfilePage(user)
        break;
        case "editProfile":
            editProfilePage()
            const updateProfileButton = buttons.updateProfile
            updateProfileButton.addEventListener("click", function(e) {
                e.preventDefault()
                updateProfile(e)
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
        case "contacts":
            getContacts()
        break;
        case "contactDetail":
            getContactDetail(id)
        break;
        case "editContactDetail":
            id=contactDetail.id
            getContactDetail(id)
            const submitEditContactButton = buttons.submitEditContact
        break;
        case "addContactDetail":
            addContactForm()
            const submitAddContactButton = buttons.submitAddContact
            submitAddContactButton.addEventListener("click", function(e) {
                e.preventDefault()
                submitAddContact(e)
            })
        break;

    }

    const editPofileButton = buttons.editProfile
    const logoffButton = buttons.logoff
    const contactsButton = buttons.contacts
    const addContactButton = buttons.addContact
    logoffButton.addEventListener("click", function(e) {
        e.preventDefault()
        logoff()
    })
    contactsButton.addEventListener("click", function(e) {
        e.preventDefault()
        contacts(e)
    })
    editProfileButton.addEventListener("click", function(e) {
        e.preventDefault()
        editProfile()
    })
    editContactButton.addEventListener("click", function(e) {
        e.preventDefault()
        console.log("edit Contact clicked")
        state.page="editContactDetail"
        render()
    })
    addContactButton.addEventListener("click", function(e) {
        e.preventDefault
        console.log("add Contact clicked")
        state.page="addContactDetail"
        render()
    })
}

function navigationBar(){
    infoBox.innerHTML = `
        <div class="form-group text-left">
            <button type="button" name="logoff" class="btn btn-info btn-md hidden" id="logoffButton">Log Off</button>
            <button type="button" name="profile" class="btn btn-info btn-md hidden" id="profileButton">Profile</button>
            <button type="button" name="editProfile" class="btn btn-info btn-md hidden"id="editProfileButton">Edit Profile</button>
            <button type="button" name="contacts" class="btn btn-info btn-md hidden" id="contactsButton">Contacts</button>
            <button type="button" name="addContact" class="btn btn-info btn-md hidden" id="addContactButton">Add Contact</button>
            <button type="button" name="editContact" class="btn btn-info btn-md hidden" id="editContactButton">Edit Contact</button>
            <button type="button" name="deleteContact" class="btn btn-danger btn-md hidden" id="deleteContactButton">Delete Contact</button>
        </div>
    `
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
    fetch(loginUrl, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(loginData)
    })
    .then(response => response.json())
    .then(json => {
        if (json.error) {
            showInfo(json.error)
            state.page = "login"
            render()
        } else {
            userData=json.user.data.attributes
            state.page = "profile"
            currentUser = new User(userData)
            localStorage.setItem("jwt", json.auth_token)
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
    .then(response => response.json())
    .then(json => {
        if (json.error){
            localStorage.clear()
            showInfo(json.error)
            state.page = "login"
            render()
        } else {
            currentUser = new User(json.userdata.data.attributes)
            localStorage.setItem("jwt", json.auth_token)
            state.page = "profile"
            render()
        }
    })
    .catch(error => showInfo(error))
}

function showInfo(messages) {
    if (messages.length >= 1) {
        let messageHTML=""
        messages.forEach(function (message) {
            messageHTML += "<li>" + message + "</li>";
        });
        infoLine.innerHTML = `
            <div class="alert alert-warning alert-dismissible fade show" role="alert">
                <strong>${messageHTML}</strong>
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        `
    } else {
        infoLine.innerHTML = ``
    }
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

function getContacts() {
    fetch("http://localhost:3000/contacts", {
        method: "GET",
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` }
    })
    .then(response => response.json())
    .then(json => {
        if (json.error) {
            showInfo(json.error)
            state.page = "login"
            render()
        } else {
            contactObjects = json.contacts.data
            localStorage.setItem("jwt", json.auth_token)
            navigationBar()
            infoBox.innerHTML += contactHeader
            changePage(currentPage)
        }
    })
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
    logoffButton.addEventListener("click", function(e) { 
        e.preventDefault()
        logoff()
    })
    profileButton.addEventListener("click", function(e) {
        e.preventDefault()
        console.log("profile clicked")
        state.page="profile"
        render()
    })
    addContactButton.addEventListener("click", function(e) {
        e.preventDefault()
        console.log("add Contact clicked")
        state.page="addContactDetail"
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
    fetch(usersUrl+ `${currentUser.userId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer: ${localStorage.getItem("jwt")}`
        },
        body: JSON.stringify(updateProfileData)
        
    })
    .then(response => response.json())
    .then(json => {
        if (json.error) {
            showInfo(json.error)
            state.page = "login"
            render()
        } 
        else {
            userData=json.user.data.attributes
            state.page = "profile"
            currentUser = new User(userData)
            localStorage.setItem("jwt", json.auth_token)
            render()
        }
    })
}

function registerProfile() {
    console.log("register clicked")
    state.page = "registerProfile"
    render()
}

function registerPage() {
    infoBox.innerHTML += registerForm
}

function submitProfile() {
    // e.preventDefault()
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
    fetch(registerUrl, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(registerProfileData)
    })
    .then(response => response.json())
    .then(json => {
    if (json.error) {
        showInfo(json.error)
        // keep the page just display the error(s)
    } 
    else {
        userData=json.user.data.attributes
        state.page = "profile"
        currentUser = new User(userData)
        localStorage.setItem("jwt", json.auth_token)
        render()
    }
    })

}

function ContactDetail(id) {
    console.log("getting details")
    state.page = "contactDetail"
    render(id)
}

function getContactDetail(id) {
    fetch(contactsUrl+ `${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer: ${localStorage.getItem("jwt")}`
        }
    })
    .then(response => response.json())
    .then(json => {
        if (json.error) {
            showInfo(json.error)
            state.page = "profile"
            render()
            } 
        else {
            contactDetail=json.contact.data.attributes
            localStorage.setItem("jwt", json.auth_token)
            if (state.page == "contactDetail") {
                displayContact(contactDetail)
            } else {
                editContactForm()
                submitEditContactButton=buttons.submitEditContact
                submitEditContactButton.addEventListener("click", function(e) {
                    e.preventDefault()
                    submitEditContact(e)
                })
            }
            
        }
    })
}

function displayContact(data) {
    state.page="contactDetail"
    navigationBar()
    let myGrid = data.my_gridsquare
    let remGrid = data.gridsquare
    myLatLon = gridSquareToLatLon(myGrid)
    if (!remGrid) {
        remLatLon = myLatLon
    } else {
        remLatLon = gridSquareToLatLon(remGrid)
    }
    let dist = distance(myLatLon, remLatLon)
    document.getElementById("logoffButton").classList.remove("hidden")
    document.getElementById("contactsButton").classList.remove("hidden")
    document.getElementById("addContactButton").classList.remove("hidden")
    document.getElementById("editContactButton").classList.remove("hidden")
    document.getElementById("profileButton").classList.remove("hidden")
    document.getElementById("deleteContactButton").classList.remove("hidden")
    
    infoBox.innerHTML+=`
        <h4 class="text-center text-info">Your contact</h4>
        <section>
            <div class="contactColumn">
                <table>
                    <tr class="d-flex" valign="top" bgcolor="#FFFFFF">
                        <td align="left" colspan="3"><b>Station</b></td>
                    </tr>
                    <tr class="d-flex">
                        <td class="col-6" id="data_index">Callsign</td>
                        <td  class="col-9">${data.owncall}</td>
                    </tr>
                    <tr class="d-flex">
                        <td class="col-6" id="data_index">Station Callsign</td>
                        <td class="col-9">${data.station_callsign}</td>
                    </tr>
                    <tr class="d-flex">
                        <td class="col-6" id="data_index">Gridsquare</td>
                        <td class="col-9">${data.my_gridsquare}</td>
                    </tr>
                    <tr class="d-flex" valign="top" bgcolor="#FFFFFF">
                        <td align="left" colspan="3"><b>Worked Station</b></td>
                    </tr>
                    <tr class="d-flex">
                        <td class="col-6" id="data_index">Callsign</td>
                        <td class="col-9">${data.call}</td>
                    </tr>
                    <tr class="d-flex">
                        <td class="col-6" id="data_index">Country</td>
                        <td class="col-9">${data.country}</td>
                    </tr>
                    <tr class="d-flex">
                        <td class="col-6" id="data_index">Gridsquare</td>
                        <td class="col-9">${data.gridsquare ? data.gridsquare : "-"}</td>
                    </tr>
                    <tr class="d-flex">
                        <td class="col-6" id="data_index">Date/Time</td>
                        <td class="col-9">${data.qso_date} / ${data.time_on.slice(11,19)}</td>
                    </tr>
                    <tr class="d-flex">
                        <td class="col-6" id="data_index">Frequency </td>
                        <td class="col-9">${data.freq}</td>
                    </tr>
                    <tr class="d-flex">
                        <td class="col-6" id="data_index">Band</td>
                        <td class="col-9">${data.band}</td>
                    </tr>
                    <tr class="d-flex">
                        <td class="col-6" id="data_index">Mode (Modegroup)</td>
                        <td class="col-9">${data.mode}, ${data.modegroup}</td>
                    </tr>
                    <tr class="d-flex">

                        <td class="col-6" id="data_index">QSL Received</td>
                        <td class="col-9">${data.qsl_rcvd ? "☑︎" : "☐"}</td>
                    </tr>
                    <tr class="d-flex">
                        <td class="col-6" id="data_index">QSL Received</td>
                        <td class="col-9">${data.qsl_rdate ? data.qsl_rdate : "-"}</td>
                    </tr>
                    <tr class="d-flex">
                        <td class="col-6" id="data_index">CQZone</td>
                        <td class="col-9">${data.cqz ? data.cqz : "-"}</td>
                    </tr>
                    <tr class="d-flex">
                        <td class="col-6" id="data_index">ITUZone</td>
                        <td class="col-9">${data.ituz ? data.ituz : "-"}</td>
                    </tr>
                    <tr class="d-flex">
                        <td class="col-6" id="data_index">IOTA</td>
                        <td class="col-9">${data.iota ? data.iota : "-"}</td>
                    </tr>
                    <tr class="d-flex">
                        <td class="col-6" id="data_index">Distance (miles)</td>
                        <td class="col-9">${dist}</td>
                    </tr>
                </table>
            </div>
            <div class="mapColumn" id="map" style="height:320px;">
            </div>
        </section>
    ` 
    loadMapScript()
    logoffButton.addEventListener("click", function(e) {
        e.preventDefault()
        logoff()
    })
    contactsButton.addEventListener("click", function (e) {
        e.preventDefault()
        console.log("contacts clicked")
        state.page="contacts"
        render()
    })
    editContactButton.addEventListener("click", function(e) {
        e.preventDefault()
        console.log("edit Contact clicked")
        state.page="editContactDetail"
        render()
    })
    addContactButton.addEventListener("click", function(e) {
        e.preventDefault()
        console.log("add contact clicked")
        state.page="addContactDetail"
        render()
    })
    profileButton.addEventListener("click", function(e) {
        e.preventDefault()
        console.log("profile clicked")
        state.page="profile"
        render()
    })
    
    buttons.deleteContact.addEventListener("click", function(e) {
        e.preventDefault()
        console.log("delete contact clicked")
        deleteContact()
    })
}

function editContactForm() {
    document.getElementById("logoffButton").classList.remove("hidden")
    document.getElementById("contactsButton").classList.remove("hidden")
    document.getElementById("addContactButton").classList.remove("hidden")
    document.getElementById("profileButton").classList.remove("hidden")
    infoBox.innerHTML+=`
        <h4 class="text-center text-info">Edit your contact</h4>
        <b>Station</b>
        <form>
            <div class="form-group form-inline">
                <label for="callsign" class="addContact text-info">Callsign: </label>
                <input type="text" id="owncall"  value="${contactDetail.owncall}">
            </div>
            <div class="form-group form-inline">
                <label for="callsign" class="addContact text-info">Station Callsign: </label>
                <input type="text" id="station_callsign"  value="${contactDetail.station_callsign}">
            </div>
            <div class="form-group form-inline">
                <label for="gridsquare" class="addContact text-info">Gridsquare: </label>
                <input type="text" id="my_gridsquare"  value="${contactDetail.my_gridsquare}">
            </div>
        </form>
        <b>Worked Station</b>
        <form>
            <div class="form-group form-inline">
                <label for="callsign" class="addContact text-info">Callsign: </label>
                <input type="text" id="call"  value="${contactDetail.call}">
            </div>
            <div class="form-group form-inline">
                <label for="band" class="addContact text-info">Band: </label>
                <input type="text" list="band" id="getBand" value="${contactDetail.band}">
                <datalist id="band">
                    <option value="2200M">2200M</option>
                    <option value="630M">630M</option>
                    <option value="160M">160M</option>
                    <option value="80M">80M</option>
                    <option value="60M">60M</option>
                    <option value="40M">40M</option>
                    <option value="30M">30M</option>
                    <option value="20M">20M</option>
                    <option value="17M">17M</option>
                    <option value="15M">15M</option>
                    <option value="12M">12M</option>
                    <option value="10M">10M</option>
                    <option value="6M">6M</option>
                    <option value="2M">2M</option>
                    <option value="1.25M">1.25M</option>
                    <option value="70CM">70CM</option>
                    <option value="33CM">33CM</option>
                    <option value="23CM">23CM</option>
                </datalist>
            </div>
            <div class="form-group form-inline">
                <label for="frequency" class="addContact text-info">Frequency: </label>
                <input type="text" id="freq"  value="${contactDetail.freq}">
            </div>
            <div class="form-group form-inline">
                <label for="frequency_rcvd" class="addContact text-info">Frequency received: </label>
                <input type="text" id="freq_rcvd"  value="${contactDetail.freq_rcvd}">
            </div>
            <div class="form-group form-inline">
                <label for="mode" class="addContact text-info">Mode: </label>
                <input type="text" id="getMode"  list="mode" value="${contactDetail.mode}">
                <datalist id="mode">
                    <option value="CW"CW</option>
                    <option value="PHONE"E">PHONE</option>
                    <option value="IMAGE"E">IMAGE</option>
                    <option value="DATA">DATA</option>
                    <option value="AM">AM</option>
                    <option value="C4FM">C4FM</option>
                    <option value="DIGITALVOICE">DIGITALVOICE</option>
                    <option value="DSTAR">DSTAR</option>
                    <option value="FM">FM</option>
                    <option value="SSB">SSB</option>
                    <option value="ATV">ATV</option>
                    <option value="FAX">FAX</option>
                    <option value="SSTV">SSTV</option>
                    <option value="AMTOR">AMTOR</option>
                    <option value="ARDOP">ARDOP</option>
                    <option value="CHIP">CHIP</option>
                    <option value="CLOVER">CLOVER</option>
                    <option value="CONTESTI">CONTESTI</option>
                    <option value="DOMINO">DOMINO</option>
                    <option value="FSK31">FSK31</option>
                    <option value="FSK441">FSK441</option>
                    <option value="FT4">FT4</option>
                    <option value="FT8">FT8</option>
                    <option value="GTOR""GTOR</option>
                    <option value="HELL">HELL</option>
                    <option value="HFSK">HFSK</option>
                    <option value="ISCAT">ISCAT</option>
                    <option value="JT4">JT4</option>
                    <option value="JT65">JT65</option>
                    <option value="JT6M">JT6M</option>
                    <option value="JT9">JT9</option>
                    <option value="MFSK16">MFSK16</option>
                    <option value="MFSK8">MFSK8</option>
                    <option value="MINIRTTY">MINIRTTY</option>
                    <option value="MSK144">MSK144</option>
                    <option value="MT63">MT63</option>
                    <option value="OLIVIA">OLIVIA</option>
                    <option value="OPERA">OPERA</option>
                    <option value="PACKET">PACKET</option>
                    <option value="PACTOR">PACTOR</option>
                    <option value="PAX">PAX</option>
                    <option value="PSK10">PSK10</option>
                    <option value="PSK125">PSK125</option>
                    <option value="PSK2K">PSK2K</option>
                    <option value="PSK31">PSK31</option>
                    <option value="PSK63">PSK63</option>
                    <option value="PSK63F">PSK63F</option>
                    <option value="PSKAM">PSKAM</option>
                    <option value="PSFEC31">PSFEC31</option>
                    <option value="Q15">Q15</option>
                    <option value="QRA64">QRA64</option>
                    <option value="ROS">ROS</option>
                    <option value="RTTY">RTTY</option>
                    <option value="RTTYM">RTTYM</option>
                    <option value="T10">T10</option>
                    <option value="THOR">THOR</option>
                    <option value="THROB">THROB</option>
                    <option value="VOI">VOI</option>
                    <option value="WINMOR">WINMOR</option>
                    <option value="WSPR">WSPR</option>
                </datalist>
            </div>
            <div class="form-group form-inline">
                <label for="submode" class="addContact text-info">Submode: </label>
                <input type="text" id="getSubmode" list="submode" value="${contactDetail.submode ? contactDetail.submode : "-"}">
                <datalist id="submode">
                    <option value="FT4">FT4</option>
                </datalist>
            </div>
            <div class="form-group form-inline">
                <label for="modegroup" class="addContact text-info">Modegroup: </label>
                <input type="text" list="modegroup" id="getModegroup" value="${contactDetail.modegroup}">
                <datalist id="modegroup">
                    <option value="-">-</option>
                    <option value="CW">CW</option>
                    <option value="PHONE">PHONE</option>
                    <option value="IMAGE">IMAGE</option>
                    <option value="DATA">DATA</option>
                </datalist>
            </div>
            <div class="form-group form-inline">
                <label for="qso_date" class="addContact text-info">Date: </label>
                <input type="text" id="qso_date"  value="${contactDetail.qso_date}">
            </div>
            <div class="form-group form-inline">
                <label for="time_on" class="addContact text-info">Time: </label>
                <input type="text" id="time_on"  value="${contactDetail.time_on.slice(11,19)}">
            </div>
            <div class="form-group form-inline">
                <label for="qsl_rcvd" class="addContact text-info">QSL received: </label>
                <input type="text" id="qsl_rcvd"  value="${contactDetail.qsl_rcvd}">
            </div>
            <div class="form-group form-inline">
                <label for="qsl_rdate" class="addContact text-info">QSL receive date: </label>
                <input type="text" id="qsl_rdate"  value="${contactDetail.qsl_rdate ? contactDetail.qsl_rdate : "-"}">
            </div>
            <div class="form-group form-inline">
                <label for="dxcc" class="addContact text-info">DXCC: </label>
                <input type="text" id="dxcc"  value="${contactDetail.dxcc}">
            </div>
            <div class="form-group form-inline">
                <label for="country" class="addContact text-info">Country: </label>
                <input type="text" id="country"  value="${contactDetail.country}">
            </div>
            <div class="form-group form-inline">
                <label for="callsign" class="addContact text-info">IOTA: </label>
                <input type="text" id="iota"  value="${contactDetail.iota ? contactDetail.iota : "-"}">
            </div>
            <div class="form-group form-inline">
                <label for="gridsquare" class="addContact text-info">Gridsquare: </label>
                <input type="text" id="gridsquare" value="${contactDetail.gridsquare}">
            </div>
            <div class="form-group form-inline">
                <label for="state" class="addContact text-info">State: </label>
                <input type="text" id="state"  value="${contactDetail.state}">
            </div>
            <div class="form-group form-inline">
                <label for="county" class="addContact text-info">County: </label>
                <input type="text" id="cnty"  value="${contactDetail.cnty}">
            </div>
            <div class="form-group form-inline">
                <label for="cqz" class="addContact text-info">CQ Zone: </label>
                <input type="text" id="cqz"  value="${contactDetail.cqz}">
            </div>
            <div class="form-group form-inline">
                <label for="ituz" class="addContact text-info">ITU Zone: </label>
                <input type="text" id="ituz"  value="${contactDetail.ituz}">
            </div>
            <div class="form-group form-inline">
                <label for="park" class="addContact text-info">Park: </label>
                <input type="text" id="park"  value="${contactDetail.park ? contactDetail.park : "-"}">
            </div>
        </form>  
        <br>
        <button type="button" name="submitEditContact" class="btn btn-info" id="submitEditContact">Update Contact</button>
    ` 
}

function submitEditContact(e) {
    e.preventDefault()
    editContactData = readContactForm()
    fetch(contactsUrl+ `${contactDetail.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer: ${localStorage.getItem("jwt")}`
        },
        body: JSON.stringify(editContactData)
    })
    .then(response => response.json())
    .then(json => {
        if (json.error) {
            showInfo(json.error)
            state.page = "login"
            render()
        } else {
            contactData=json.contact.data.attributes
            localStorage.setItem("jwt", json.auth_token)
            displayContact(contactData)
        }
    })
}

function addContactForm() {
    document.getElementById("logoffButton").classList.remove("hidden")
    document.getElementById("contactsButton").classList.remove("hidden")
    document.getElementById("profileButton").classList.remove("hidden")
    let utcDate = new Date().toISOString()
    let utcD = utcDate.slice(0,10)
    let utcT = utcDate.slice(11,19)
    infoBox.innerHTML+=`
        <h4 class="text-center text-info">Add contact</h4>
        <h4><b>Station</b></h4>
        <form>
            <div class="form-group form-inline">
                <label for="callsign" class="addContact text-info">Callsign: </label>
                <input type="text" id="owncall" value="${currentUser.callsign}">
            </div>
            <div class="form-group form-inline">
                <label for="callsign" class="addContact text-info">Station Callsign: </label>
                <input type="text" id="station_callsign" value="${currentUser.callsign}">
            </div>
            <div class="form-group form-inline">
                <label for="gridsquare" class="addContact text-info">Gridsquare: </label>
                <input type="text" id="my_gridsquare" value="${currentUser.my_qth}">
            </div>
        </form>
        <h4><b>Worked Station</b></h4>
        <form>
            <div class="form-group form-inline">
                <label for="callsign" class="addContact text-info">Callsign: </label>
                <input type="text" id="call" oninput="searchContact()">
            </div>
            </form>
            <div id="prevContacts">
                <div class="table-responsive" id="prevContactsContentDiv"></div>
            </div>
            <form>
            <div class="form-group form-inline">
                <label for="band" class="addContact text-info">Band: </label>
                <input type="text" id="getBand" list="band" />
                <datalist id="band">
                    <option value="2200M">2200M</option>
                    <option value="630M">630M</option>
                    <option value="160M">160M</option>
                    <option value="80M">80M</option>
                    <option value="60M">60M</option>
                    <option value="40M">40M</option>
                    <option value="30M">30M</option>
                    <option value="20M">20M</option>
                    <option value="17M">17M</option>
                    <option value="15M">15M</option>
                    <option value="12M">12M</option>
                    <option value="10M">10M</option>
                    <option value="6M">6M</option>
                    <option value="2M">2M</option>
                    <option value="1.25M">1.25M</option>
                    <option value="70CM">70CM</option>
                    <option value="33CM">33CM</option>
                    <option value="23CM">23CM</option>
                </datalist>
            </div>
            <div class="form-group form-inline">
                <label for="frequency" class="addContact text-info">Frequency: </label>
                <input type="text" id="freq">
            </div>
            <div class="form-group form-inline">
                <label for="frequency_rcvd" class="addContact text-info">Frequency received: </label>
                <input type="text" id="freq_rcvd" value="-">
            </div>
            <div class="form-group form-inline">
            <label for="mode" class="addContact text-info">Mode: </label>
            <input type="text" list="mode" id="getMode"/>
                <datalist id="mode">
                    <option value="CW"CW</option>
                    <option value="PHONE"E">PHONE</option>
                    <option value="IMAGE"E">IMAGE</option>
                    <option value="DATA">DATA</option>
                    <option value="AM">AM</option>
                    <option value="C4FM">C4FM</option>
                    <option value="DIGITALVOICE">DIGITALVOICE</option>
                    <option value="DSTAR">DSTAR</option>
                    <option value="FM">FM</option>
                    <option value="SSB">SSB</option>
                    <option value="ATV">ATV</option>
                    <option value="FAX">FAX</option>
                    <option value="SSTV">SSTV</option>
                    <option value="AMTOR">AMTOR</option>
                    <option value="ARDOP">ARDOP</option>
                    <option value="CHIP">CHIP</option>
                    <option value="CLOVER">CLOVER</option>
                    <option value="CONTESTI">CONTESTI</option>
                    <option value="DOMINO">DOMINO</option>
                    <option value="FSK31">FSK31</option>
                    <option value="FSK441">FSK441</option>
                    <option value="FT4">FT4</option>
                    <option value="FT8">FT8</option>
                    <option value="GTOR""GTOR</option>
                    <option value="HELL">HELL</option>
                    <option value="HFSK">HFSK</option>
                    <option value="ISCAT">ISCAT</option>
                    <option value="JT4">JT4</option>
                    <option value="JT65">JT65</option>
                    <option value="JT6M">JT6M</option>
                    <option value="JT9">JT9</option>
                    <option value="MFSK16">MFSK16</option>
                    <option value="MFSK8">MFSK8</option>
                    <option value="MINIRTTY">MINIRTTY</option>
                    <option value="MSK144">MSK144</option>
                    <option value="MT63">MT63</option>
                    <option value="OLIVIA">OLIVIA</option>
                    <option value="OPERA">OPERA</option>
                    <option value="PACKET">PACKET</option>
                    <option value="PACTOR">PACTOR</option>
                    <option value="PAX">PAX</option>
                    <option value="PSK10">PSK10</option>
                    <option value="PSK125">PSK125</option>
                    <option value="PSK2K">PSK2K</option>
                    <option value="PSK31">PSK31</option>
                    <option value="PSK63">PSK63</option>
                    <option value="PSK63F">PSK63F</option>
                    <option value="PSKAM">PSKAM</option>
                    <option value="PSFEC31">PSFEC31</option>
                    <option value="Q15">Q15</option>
                    <option value="QRA64">QRA64</option>
                    <option value="ROS">ROS</option>
                    <option value="RTTY">RTTY</option>
                    <option value="RTTYM">RTTYM</option>
                    <option value="T10">T10</option>
                    <option value="THOR">THOR</option>
                    <option value="THROB">THROB</option>
                    <option value="VOI">VOI</option>
                    <option value="WINMOR">WINMOR</option>
                    <option value="WSPR">WSPR</option>
                </datalist>
            </div>
            <div class="form-group form-inline">
                <label for="submode" class="addContact text-info">Submode: </label>
                <input type="text" list="submode" id="getSubmode"/>
                <datalist id="submode">
                    <option value="FT4">FT4</option>
                </datalist>
            </div>
            <div class="form-group form-inline">
                <label for="modegroup" class="addContact text-info">Modegroup: </label>
                <input type="text" list="modegroup" id="getModegroup"/>
                <datalist id="modegroup">
                    <option value="-">-</option>
                    <option value="CW">CW</option>
                    <option value="PHONE">PHONE</option>
                    <option value="IMAGE">IMAGE</option>
                    <option value="DATA">DATA</option>
                </datalist>
            </div>
            <div class="form-group form-inline">
                <label for="qso_date" class="addContact text-info">Date: </label>
                <input type="text" id="qso_date"   value="${utcD}">
            </div>
            <div class="form-group form-inline">
                <label for="time_on" class="addContact text-info">Time: </label>
                <input type="text" id="time_on" value="${utcT}">
            </div>
            <div class="form-group form-inline">
                <label for="qsl_rcvd" class="addContact text-info">QSL received: </label>
                <input type="checkbox" id="qsl_rcvd">
            </div>
            <div class="form-group form-inline">
                <label for="qsl_rdate" class="addContact text-info">QSL receive date: </label>
                <input type="text" id="qsl_rdate" value="-">
            </div>
            <div class="form-group form-inline">
                <label for="dxcc" class="addContact text-info">DXCC: </label>
                <input type="text" id="dxcc"  value="-">
            </div>
            <div class="form-group form-inline">
                <label for="country" class="addContact text-info">Country: </label>
                <input type="text" id="country">
            </div>
            <div class="form-group form-inline">
                <label for="callsign" class="addContact text-info">IOTA: </label>
                <input type="text" id="iota"  value="-">
            </div>
            <div class="form-group form-inline">
                <label for="gridsquare" class="addContact text-info">Gridsquare: </label>
                <input type="text" id="gridsquare">
            </div>
            <div class="form-group form-inline">
                <label for="state" class="addContact text-info">State: </label>
                <input type="text" id="state">
            </div>
            <div class="form-group form-inline">
                <label for="county" class="addContact text-info">County: </label>
                <input type="text" id="cnty" value="-">
            </div>
            <div class="form-group form-inline">
                <label for="cqz" class="addContact text-info">CQ Zone: </label>
                <input type="text" id="cqz" value="-">
            </div>
            <div class="form-group form-inline">
                <label for="ituz" class="addContact text-info">ITU Zone: </label>
                <input type="text" id="ituz" value="-">
            </div>
            <div class="form-group form-inline">
                <label for="park" class="addContact text-info">Park: </label>
                <input type="text" id="park" value="-">
            </div>
        </form>  
        </div>
        <br>
        <button type="button" name="submitAddContact" class="btn btn-info" id="submitAddContact">Submit Contact</button>
    ` 
}

function searchContact() {
    filter=document.getElementById("call").value
    filter = filter.toUpperCase()
    console.log(filter)
    prevContactsView=document.getElementById('prevContacts')
    if (filter.length > 2) {
        console.log('filtering')
        filteredContacts=[]
        for (let i=0; i < contactObjects.length; i++) {
            // grab an instance
            let contactObject = contactObjects[i]
            // toUpperCase since we're ignoring case sensitivity
            let call = contactObject.attributes.call
            // https://www.w3schools.com/jsref/jsref_indexof.asp
            // indexOf will return -1 if the name does not contain the filter
            if (call.indexOf(filter) > -1){
                //if it is greater than -1 then the name does contain the filter
                //therefor push it into the array of filteredDottomodachi
               filteredContacts.push(contactObject)
            }
        }
        if (filteredContacts.length > 0) {
            prevContactsView.innerHTML=prevContactsTableHeader
            let tableRef = document.getElementById("prevContacts").getElementsByTagName("tbody")[0];
            for (let i = 0; i < filteredContacts.length; i++) {
                let filteredContact = filteredContacts[i]
                // Insert a row in the table at the last row
                let newRow   = tableRef.insertRow();
                let newCell0  = newRow.insertCell(0);
                let newText0  = document.createTextNode(filteredContact.attributes.call);
                newCell0.appendChild(newText0);
                let newCell1  = newRow.insertCell(1);
                let newText1  = document.createTextNode(filteredContact.attributes.qso_date);
                newCell1.appendChild(newText1);
                let newCell2  = newRow.insertCell(2);
                let newText2  = document.createTextNode(filteredContact.attributes.time_on.slice(11,19));
                newCell2.appendChild(newText2);
                let newCell3  = newRow.insertCell(3);
                let newText3  = document.createTextNode(filteredContact.attributes.band);
                newCell3.appendChild(newText3);
                let newCell4  = newRow.insertCell(4);
                let newText4  = document.createTextNode(filteredContact.attributes.mode);
                newCell4.appendChild(newText4);
                let newCell5  = newRow.insertCell(5);
                let newText5  = document.createTextNode(filteredContact.attributes.freq);
                newCell5.appendChild(newText5);
                let newCell6  = newRow.insertCell(6);
                let newText6  = document.createTextNode(filteredContact.attributes.country);
                newCell6.appendChild(newText6);
            }
        } else {
            prevContactsView.innerHTML=""
        }
    } else {
        prevContactsView.innerHTML=""
    }
}


function readContactForm() {
    owncallContactInput=document.getElementById("owncall").value
    stationcallsignContactInput=document.getElementById("station_callsign").value
    my_gridsquareContactInput=document.getElementById("my_gridsquare").value
    callContactInput=document.getElementById("call").value
    bandContactInput=document.getElementById("getBand").value
    freqContactInput=document.getElementById("freq").value
    freq_rcvdContactInput=document.getElementById("freq_rcvd").value
    modeContactInput=document.getElementById("getMode").value
    submodeContactInput=document.getElementById("getSubmode").value
    modegroupContactInput=document.getElementById("getModegroup").value
    qso_dateContactInput=document.getElementById("qso_date").value
    time_onContactInput=document.getElementById("time_on").value
    qsl_rcvdContactInput=document.getElementById("qsl_rcvd").value
    qsl_rdateContactInput=document.getElementById("qsl_rdate").value
    dxccContactInput=document.getElementById("dxcc").value
    countryContactInput=document.getElementById("country").value
    stateContactInput=document.getElementById("state").value
    cntyContactInput=document.getElementById("cnty").value
    cqzContactInput=document.getElementById("cqz").value
    ituzContactInput=document.getElementById("ituz").value
    iotaContactInput=document.getElementById("iota").value
    gridsquareContactInput=document.getElementById("gridsquare").value
    parkContactInput=document.getElementById("park").value
    
    const contactData = {contact: {
        owncall: owncallContactInput,
        station_callsign: stationcallsignContactInput,
        my_gridsquare: my_gridsquareContactInput,
        call: callContactInput,
        band: bandContactInput,
        freq: freqContactInput,
        freq_rcvd: freqContactInput,
        mode: modeContactInput,
        submode: submodeContactInput,
        modegroup: modegroupContactInput,
        qso_date: qso_dateContactInput,
        time_on: time_onContactInput,
        qsl_rcvd: qsl_rcvdContactInput,
        qsl_rdate: qsl_rdateContactInput,
        dxcc: dxccContactInput,
        country: countryContactInput,
        state: stateContactInput,
        cnty: cntyContactInput,
        cqz: cqzContactInput,
        ituz: ituzContactInput,
        iota: iotaContactInput,
        gridsquare: gridsquareContactInput,
        park: parkContactInput,
    }}
    return contactData
}

function submitAddContact(e) {
    e.preventDefault()
    const contactData = readContactForm()
    fetch(contactsUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer: ${localStorage.getItem("jwt")}`
        },
        body: JSON.stringify(contactData)
    })
    .then(response => response.json())
    .then(json => {
        if (json.error) {
            showInfo(json.error)
            state.page = "login"
            render()
        } else {
            contactDetail=json.contact.data.attributes
            localStorage.setItem("jwt", json.auth_token)
            displayContact(contactDetail)
        }
    })
}

function loadMapScript() {
    try {
        if (google) {
            google = {}
        }
    } catch (e) {}
    mapSpace = document.getElementById("map")
    let mapScript = document.createElement("script");
    mapScript.type = "text/javascript";
    mapScript.src = gMapsScript;
    mapSpace.appendChild(mapScript);

}

// The Maidenhead Grid system is build up by squares of 10° latitude
// and 20° longitude and are indicated by the letters AA-RR. These squares
// contain sub-squares in a 10x10 grid of squares in size 1° in latitude 
// and 2° in longitude and are indicated by the numbers 00-99.
// These sub-squares again are divided into a 24x24 grid of 2.5" latitude  
// and 5" longitude and are indicated by the letters aa-xx and subsequently 
// divided again in a 10x10 grid measuring 15" latitude and 30" longitude
// indicated by numbers 00-99. 
// This will give a Maidenhead grid in the form AA00aa00.
// For example my location islocated in the Maidenhead gridsquare EL15fx62.
// To calculate the distance we need to determine the center of the square 
// indicated by the gridsquare. Because when we use the grid as supplied and 
// convert it to a latitide and longitude it will lead us to the left bottom 
// corner of the square. 
// The longer the given gridsquare, the more precise the calculated location is.
    
gridSquareToLatLon = function(grid){
    // set lat and lon to 0.0
    let lat=0.0,lon=0.0
    // determine the ASCII value of "a" and "A", aNum = 97 and numA = 65
    let aNum="a".charCodeAt(0),numA="A".charCodeAt(0);
    // latitude is divided in 10°, because the equator is 0 we have to substract 90°
    function lat4(g){
        //  example my location EL15 = 25.5, -97
        //     10 * (ASCII value of "L" - 65) + integer value of "5") - 90 = 10 * (76-65) + 5 - 90 = 25
        return 10 * (g.charCodeAt(1) - numA) + parseInt(g.charAt(3)) - 90;
    }
    function lon4(g){
        // example my location EL15
        //     20 * (ASCII value of "E" - 65) + 2 * integer value of "1") -180 = 20 * (69 -65) + 2*1 - 180 = -98
        return 20 * (g.charCodeAt(0) - numA) + 2 * parseInt(g.charAt(2)) - 180;
    }
    // test to see if grid is a 4-digit square, if not the value will be false
    if (/^[A-R][A-R][0-9][0-9]$/.test(grid)) {
        // A 4-digit square is 1° latitude and 2° longitude to find the
        // center we add 0.5° to the latitude and 1° to the longitude
        // from example EL15 lat4 = 25 => lat = 25.5
        lat = lat4(grid)+0.5;
        // from example EL15 lon4 = -98 => lon = -97
        lon = lon4(grid)+1;
    } 
    // test to see if grid is a 6-digit square
    else if (/^[A-R][A-R][0-9][0-9][a-x][a-x]$/.test(grid)) {
        // example EL15fx = 25.97917, -97.54167
        //     25 + 1/24 * (ASCII value of "x" - 97 + 0.5) = 25 + 1/24 * (120 - 97 + 0.5 ) = 25.979167
        lat = lat4(grid)+(1/60)*2.5*(grid.charCodeAt(5)-aNum+0.5);
        //     -98 + 2/24 * (ASCII value of "f" -97 + 0.5) = -98 + 2/24 * (102 - 97 + 0.5 ) = -97.54167
        lon = lon4(grid)+(1/60)*5*(grid.charCodeAt(4)-aNum+0.5);
    } 
    // test to see if grid is a 8-digit square
    else if (/^[A-R][A-R][0-9][0-9][a-x][a-x][0-9][0-9]$/.test(grid)) {
        // example EL15fx62 is circa 25.96858, -97.52951 
        //  25 + 1/24 * (120-97) + 1/240 * (int(charAt(7)) = 2) = 2 + 0.5) = 25 + 23/24 + 2.5/240 = 25.96875
        lat = lat4(grid)+(1/60)*2.5*(grid.charCodeAt(5)-aNum)+(1/3600)*15*(parseInt(grid.charAt(7))+0.5);
        //  -98 + 2/24 * (102-97) + 2/240 * (int(charAt(6)) = 6 + 0.5) = -98 + 10/24 + 13/240 = -97.529166
        lon = lon4(grid)+(1/60)*5*(grid.charCodeAt(4)-aNum)+(1/3600)*30*(parseInt(grid.charAt(6))+0.5);
    }
    return [lat,lon];
};

function distance(myLatLon, remLatLon) {
    const radius = 3981.875              // in miles
    let degreeToRad = 0.017453292519943295;    //  π / 180° = 1 degree in radians
    let cos = Math.cos;
    let lat1=myLatLon.slice(",",2)[0]  // get the latitude part of myLatLon
    let lon1=myLatLon.slice(",",2)[1]  // get the longitude part of myLatLon
    let lat2=remLatLon.slice(",",2)[0] // get the latitude part of remLatLon
    let lon2=remLatLon.slice(",",2)[1] // get the longitude part of remLatLon
    var a = 0.5 - cos((lat2 - lat1) * degreeToRad)/2 + 
            cos(lat1 * degreeToRad) * cos(lat2 * degreeToRad) * 
            (1 - cos((lon2 - lon1) * degreeToRad))/2;
    if (a != 0) {
        return (2 * radius * Math.asin(Math.sqrt(a))).toFixed(0); // no decimals needed as location is not pinpointed.
    } else {
        return "Location info missing for calculation"
    }
}

// create the map instance
function initMap() {
    let bounds = new google.maps.LatLngBounds();
    let myLatLng=new google.maps.LatLng( myLatLon[0], myLatLon[1] );
    bounds.extend( myLatLng );
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 3,
        center: myLatLng,
        mapTypeId: "terrain",
        mapTypeControl: false,
        streetViewControl: false
    });
    remLatLng=new google.maps.LatLng( remLatLon[0], remLatLon[1] );
    bounds.extend( remLatLng );
    const pathCoordinates = [
        { lat: myLatLon[0], lng: myLatLon[1] },
        { lat: remLatLon[0], lng: remLatLon[1] },
    ];
    const shortPath = new google.maps.Polyline({
        path: pathCoordinates,
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
    });
    shortPath.setMap(map);
    map.fitBounds( bounds );
}

function deleteContact() {
    fetch(contactsUrl+`/${contactDetail.id}`, { method: "DELETE",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
            "Content-type":"application/json"
        }
    })
    .then(response => response.json())
    .then(json => {
        if (json.error) {
            showInfo(json.error)
            changePage(currentPage)
        } else {
            showInfo(json.message)
            localStorage.setItem("jwt", json.auth_token)
            getContacts()
        }
    })
}
hasToken()