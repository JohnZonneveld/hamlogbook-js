let infoBox = document.querySelector('#container-box')
const baseUrl = "http://localhost:3000"
const usersUrl = "http://localhost:3000/users/"
const loginUrl = "http://localhost:3000/auth_user"
const registerUrl = "http://localhost:3000/auth/register"
const contactsUrl = "http://localhost:3000/contacts/"
const gMapsScript = 'https://maps.googleapis.com/maps/api/js?callback=initMap&signed_in=true&key=AIzaSyBXq06q4pG6fATSosF-sSte5QK8WuanI1Q&language=en'
const alertLine = document.getElementById("alertViewPort")
const buttons = document.getElementsByClassName("btn")
let user = {}
let contactObjects = []
let currentPage = 1;
let recordsPerPage = 15
let remLatLon
let myLatLon
let page


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

const contactsTableHeader = `
<table class="table-striped" id="Contacts">  
    <tr class="border_bottom">
        <td>
            <a href="javascript:nextPage()" id="btnNext">Next</a>
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
            <td><a href="javascript:prevPage()" id="btnPrev">Prev</a></td>
            <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
        </tr>
    <tfoot>
</table>
`

const contactHeader =`
<div id="contactsDiv">
    <h3 class="text-center text-info">Your contacts</h3>
    <hr>
    <div class="table-responsive" id="contactsContentDiv">
    </div>
</div>
page: <span id="page"></span>
`

const registerForm = `
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

function profilePage() { 
    document.getElementById('logoffButton').classList.remove('hidden')
    document.getElementById('contactsButton').classList.remove('hidden')
    document.getElementById('editProfileButton').classList.remove('hidden')
    infoBox.innerHTML += `
    <div id="profileDiv">
        <hr>
        <h3 class="text-center text-info">Your profile:</h3>
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

function render(id){
    navigationBar()
    switch (state.page){
        // first page people see to log in
        case 'login':
            infoBox.innerHTML += loginPage
            // buttons for login and register page
            const registerButton = buttons.registerProfile
            const loginButton = buttons.login
            // event listeners for those buttons
            loginButton.addEventListener("click", (e) => loginHandler(e))
            registerButton.addEventListener("click", (e) => registerProfile())
        break; 
        case 'profile':
            profilePage(user)
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
            getcontacts()
        break;
        case 'contactDetail':
            getContactDetail(id)
        break;
        case 'editContactDetail':
            editContactDetail()
        break;

    }
    const editPofileButton = buttons.editProfile
    const logoffButton = buttons.logoff
    const contactsButton = buttons.contacts
    logoffButton.addEventListener("click", (e) => logoff())
    contactsButton.addEventListener("click", (e) => contacts(e))
    editProfileButton.addEventListener("click", (e) => editProfile())
    editContactButton.addEventListener("click", function() {
        console.log('edit Contact clicked')
        state.page='editContactDetail'
        render()
    })
}

function navigationBar(){
    infoBox.innerHTML =
    `
    <br>
    <div class='form-group text-left'>
        <button type="button" name="logoff" class="btn btn-info btn-md hidden" id="logoffButton">Log Off</button>
        <button type="button" name="profile" class="btn btn-info btn-md hidden" id="profileButton">Profile</button>
        <button type="button" name="editProfile" class="btn btn-info btn-md hidden"id="editProfileButton">Edit Profile</button>
        <button type="button" name="contacts" class="btn btn-info btn-md hidden" id="contactsButton">Contacts</button>
        <button type="button" name="addContact" class="btn btn-info btn-md hidden" id="addContactButton">Add Contact</button>
        <button type="button" name="editContact" class="btn btn-info btn-md hidden" id="editContactButton">Edit Contact</button>
        
    </div>
    `
}

function hasToken(){
    if (!!localStorage.getItem('jwt')){
        // state.page = "loggedIn"
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
        if (!!json.user) {
            userData=json.user.data.attributes
            state.page = 'profile'
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
            debugger
            localStorage.clear()
            showAlert(json.errors)
            state.page = 'login'
            render()
        } else {
            currentUser = new User(json.userdata.data.attributes)
            localStorage.setItem('jwt', json.auth_token)
            state.page = 'profile'
            render()
        }
    })
    .catch(errors => showAlert(errors))
}

function showAlert(messages) {
    if (messages) {
        alertLine.innerHTML = `
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
            <strong>${messages}</strong>
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        `
    } else {
        infoBox.innerHTML = ``
    }
}

function logoff() {
    localStorage.clear()
    state.page = 'login'
    render()
}

function contacts() {
    state.page = 'contacts'
    render()
}

function getcontacts() {
    fetch("http://localhost:3000/contacts", {
        method: 'GET',
        headers: {
        Authorization: `Bearer ${localStorage.getItem('jwt')}`
        }
    })
    .then(response => response.json())
    .then(json => {
        debugger
        if (!!json.contacts.data) {
            contactObjects = json.contacts.data
            localStorage.setItem('jwt', json.auth_token)
            infoBox.innerHTML += contactHeader
            changePage(currentPage)
        } else {
            state.page = 'login'
            render()
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
    
function changePage(page)
{
    let contactsTable = document.getElementById("contactsContentDiv");
    let pageSpan = document.getElementById("page");
    
    // Validate page
    if (page < 1) page = 1;
    if (page > numPages()) page = numPages();
    document.getElementById('logoffButton').classList.remove('hidden')
    document.getElementById('profileButton').classList.remove('hidden')
    document.getElementById('addContactButton').classList.remove('hidden')
    document.getElementById('editContactButton').classList.add('hidden')
    contactsTable.innerHTML = contactsTableHeader;
    let tableRef = document.getElementById('Contacts').getElementsByTagName('tbody')[0];

    for (let i = (page-1) * recordsPerPage; i < (page * recordsPerPage) && i < contactObjects.length; i++) {
        // Insert a row in the table at the last row
        let newRow   = tableRef.insertRow();
        let newCell0  = newRow.insertCell(0);
        newCell0.innerHTML = `<a href="javascript:ContactDetail(${contactObjects[i].attributes.id})" id="btnNext">detail</a>`
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
    pageSpan.innerHTML = page;
    let btnNext = document.getElementById("btnNext");
    let btnPrev = document.getElementById("btnPrev");
    if (page == 1) {
        btnPrev.style.visibility = "hidden";
    } else {
        btnPrev.style.visibility = "visible";
    }
    if (page == numPages()) {
        btnNext.style.visibility = "hidden";
    } else {
        btnNext.style.visibility = "visible";
    }
    logoffButton.addEventListener("click", (e) => logoff())
    profileButton.addEventListener("click", function() {
        console.log('profile clicked')
        state.page='profile'
        render()
    })
}

function numPages()
{
    return Math.ceil(contactObjects.length / recordsPerPage);
}

function editProfile() {
    console.log('editProfile pressed')
    state.page = 'editProfile'
    render()
}

function editProfilePage() {
    document.getElementById('logoffButton').classList.remove('hidden')
    document.getElementById('profileButton').classList.remove('hidden')
    document.getElementById('contactsButton').classList.remove('hidden')
    infoBox.innerHTML += `
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

function registerProfile() {
    console.log('register pressed')
    state.page = 'registerProfile'
    render()
}

function registerPage() {
    infoBox.innerHTML = registerForm
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

function ContactDetail(id) {
    console.log('getting details')
    state.page = 'contactDetail'
    render(id)
}

function getContactDetail(id) {
    fetch(contactsUrl+ `${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer: ${localStorage.getItem('jwt')}`
        }
        
    })
    .then(response => response.json())
    .then(json => {
        if (!!json.contact) {
            contactData=json.contact.data.attributes
            localStorage.setItem('jwt', json.auth_token)
            displayContact(contactData)
            } 
        else {
            showAlert(json.errors)
            state.page = 'profile'
            render()
        }
    })
}


function displayContact(data) {
    state.page="contactDetail"
    navigationBar()
    
    // const contactButton = buttons.contacts
    let myGrid = data.my_gridsquare
    let remGrid = data.gridsquare
    myLatLon = gridSquareToLatLon(myGrid)
    if (!remGrid) {
        remLatLon = myLatLon
    } else {
        remLatLon = gridSquareToLatLon(remGrid)
    }
    let dist = distance(myLatLon, remLatLon)
    document.getElementById('logoffButton').classList.remove('hidden')
    document.getElementById('contactsButton').classList.remove('hidden')
    document.getElementById('addContactButton').classList.remove('hidden')
    document.getElementById('editContactButton').classList.remove('hidden')
    document.getElementById('profileButton').classList.remove('hidden')
    


    infoBox.innerHTML+=`
    <h3 class="text-center text-info">Your contact</h3>
    <hr>
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
                    <td class="col-9">${data.gridsquare ? data.gridsquare : '-'}</td>
                </tr>
                <tr class="d-flex">
                    <td class="col-6" id="data_index">Date/Time</td>
                    <td class="col-9">${data.qso_date} / ${data.time_on.slice(11,16)}</td>
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
                    <td class="col-9">${data.qsl_rcvd ? 'Y' : 'N'}</td>
                </tr>
                <tr class="d-flex">
                    <td class="col-6" id="data_index">CQZone</td>
                    <td class="col-9">${data.cqz ? data.cqz : '-'}</td>
                </tr>
                <tr class="d-flex">
                    <td class="col-6" id="data_index">ITUZone</td>
                    <td class="col-9">${data.ituz ? data.ituz : '-'}</td>
                </tr>
                <tr class="d-flex">
                    <td class="col-6" id="data_index">IOTA</td>
                    <td class="col-9">${data.iota ? data.iota : '-'}</td>
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
    logoffButton.addEventListener("click", (e) => logoff())
    contactsButton.addEventListener("click", function () {
        state.page='contacts'
        render()
    })
    editContactButton.addEventListener("click", function() {
            console.log('edit Contact clicked')
            state.page='editContactDetail'
            render()
    })
}

function editContactDetail() {
    debugger
    infoBox.innerHTML=`
    <h3 class="text-center text-info">Edit your contact</h3>
    <hr>
    <b>Station</b>
    <form>
        <div class="form-group">
            <label for="callsign" class="text-info">Callsign: </label>
            <input type="text" class="form-control" id="owncall"  value="${contactData.owncall}">
        </div>
        <div class="form-group">
            <label for="callsign" class="text-info">Station Callsign: </label>
            <input type="text" class="form-control" id="station_callsign"  value="${contactData.station_callsign}">
        </div>
        <div class="form-group">
            <label for="callsign" class="text-info">Gridsquare: </label>
            <input type="text" class="form-control" id="my_gridsquare"  value="${contactData.my_gridsquare}">
        </div>
    </form>
    <b>Worked Station</b>
    <form>
        <div class="form-group">
            <label for="callsign" class="text-info">Callsign: </label>
            <input type="text" class="form-control" id="call"  value="${contactData.call}">
        </div>
        <div class="form-group">
            <label for="callsign" class="text-info">Country: </label>
            <input type="text" class="form-control" id="country"  value="${contactData.country}">
        </div>
        <div class="form-group">
            <label for="callsign" class="text-info">CQ Zone: </label>
            <input type="text" class="form-control" id="cqz"  value="${contactData.cqz}">
        </div>
        <div class="form-group">
            <label for="callsign" class="text-info">ITU Zone: </label>
            <input type="text" class="form-control" id="ituz"  value="${contactData.ituz}">
        </div>
        <div class="form-group">
            <label for="callsign" class="text-info">IOTA: </label>
            <input type="text" class="form-control" id="iota"  value="${contactData.iota}">
        </div>
        <div class="form-group">
            <label for="callsign" class="text-info">Gridsquare: </label>
            <input type="text" class="form-control" id="gridsquare"  value="${contactData.gridsquare}">
        </div>
        <div class="form-group">
            <label for="callsign" class="text-info">Date: </label>
            <input type="text" class="form-control" id="date"  value="${contactData.qso_date}">
        </div>
        <div class="form-group">
            <label for="callsign" class="text-info">Time: </label>
            <input type="text" class="form-control" id="time_on"  value="${contactData.time_on.slice(11,16)}">
        </div>
        <div class="form-group">
            <label for="callsign" class="text-info">Callsign: </label>
            <input type="text" class="form-control" id="call"  value="${contactData.call}">
        </div>
        <div class="form-group">
            <label for="callsign" class="text-info">Mode: </label>
            <input type="text" class="form-control" id="mode"  value="${contactData.mode}">
        </div>
        <div class="form-group">
            <label for="callsign" class="text-info">Modegroup: </label>
            <input type="text" class="form-control" id="modegroup"  value="${contactData.modegroup}">
        </div>
        <div class="form-group">
            <label for="callsign" class="text-info">Frequency: </label>
            <input type="text" class="form-control" id="freq"  value="${contactData.freq}">
        </div>
        <div class="form-group">
            <label for="callsign" class="text-info">Band: </label>
            <input type="text" class="form-control" id="band"  value="${contactData.band}">
        </div>
        <div class="form-group">
            <label for="callsign" class="text-info">Callsign: </label>
            <input type="text" class="form-control" id="call"  value="${contactData.call}">
        </div>

    </form>  
    ` 
}

function loadMapScript() {
    try {
        if (google) {
            google = {}
        }
    } catch (e) {}
    mapSpace = document.getElementById('map')
    let mapScript = document.createElement('script');
    mapScript.type = 'text/javascript';
    mapScript.src = gMapsScript;
    mapSpace.appendChild(mapScript);
    
}

// The Maidenhead Grid system is build up by squares of 10° latitude
// and 20° longitude and are indicated by the letters AA-RR. These squares
// contain sub-squares in a 10x10 grid of squares in size 1° in latitude 
// and 2° in longitude and are indicated by the numbers 00-99.
// These sub-squares again are divided into a 24x24 grid of 2.5' latitude  
// and 5' longitude and are indicated by the letters aa-xx and subsequently 
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
    // determine the ASCII value of 'a' and 'A', aNum = 97 and numA = 65
    let aNum="a".charCodeAt(0),numA="A".charCodeAt(0);
    // latitude is divided in 10°, because the equator is 0 we have to substract 90°
    function lat4(g){
        //  example my location EL15 = 25.5, -97
        //     10 * (ASCII value of 'L' - 65) + integer value of '5') - 90 = 10 * (76-65) + 5 - 90 = 25
        return 10 * (g.charCodeAt(1) - numA) + parseInt(g.charAt(3)) - 90;
    }
    function lon4(g){
        // example my location EL15
        //     20 * (ASCII value of 'E' - 65) + 2 * integer value of '1') -180 = 20 * (69 -65) + 2*1 - 180 = -98
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
        //     25 + 1/24 * (ASCII value of 'x' - 97 + 0.5) = 25 + 1/24 * (120 - 97 + 0.5 ) = 25.979167
        lat = lat4(grid)+(1/60)*2.5*(grid.charCodeAt(5)-aNum+0.5);
        //     -98 + 2/24 * (ASCII value of 'f' -97 + 0.5) = -98 + 2/24 * (102 - 97 + 0.5 ) = -97.54167
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
    return (2 * radius * Math.asin(Math.sqrt(a))).toFixed(0); // no decimals needed as loaction is not pinpointed.
    } else {
        return 'Info missing for calculation'
    }
}

// create the map instance
function initMap() {
    let bounds = new google.maps.LatLngBounds();
    let myLatLng=new google.maps.LatLng( myLatLon[0], myLatLon[1] );
    bounds.extend( myLatLng );
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 4,
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

hasToken()