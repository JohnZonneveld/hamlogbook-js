let jsonContacts = []
let contactObjectsToDisplay = []
let prevContacts = []
let currentPage = 1;
let objectsPerPage = 20
let contactObjects = []
let rowHTML = ""
let page

class Contact {
    static all = []
    constructor(attributes){
        if (attributes) {
            // in case a existing contact set all the values present in the attributes
            this.id = attributes.id
            this.owncall = attributes.owncall
            this.station_callsign = attributes.station_callsign
            this.my_gridsquare = attributes.my_gridsquare
            this.call = attributes.call
            this.band = attributes.band
            this.freq = attributes.freq
            this.freq_rcvd = attributes.freq.rcvd
            this.mode = attributes.mode
            this.submode = attributes.submode
            this.mode_group = attributes.mode_group
            this.qso_date = attributes.qso_date
            this.time_on = attributes.time_on
            this.qsl_rcvd = attributes.qsl_rcvd
            this.qsl_rdate = attributes.qsl_rate
            this.dxcc = attributes.dxcc
            this.country = attributes.country
            this.iota = attributes.iota
            this.gridsquare = attributes.gridsquare
            this.state = attributes.state
            this.county = attributes.county
            this.cqz = attributes.cqz
            this.ituz = attributes.ituz
            this.park = attributes.park
            Contact.all.push(this)
        } else {
            // in case creating a new contact set my info and current date and time in utc
            let utcDate = new Date().toISOString()
            let utcD = utcDate.slice(0,10)
            let utcT = utcDate.slice(11,19)
            this.owncall = currentUser.callsign
            this.my_gridsquare = currentUser.my_qth
            this.qso_date = utcD
            this.time_on = utcT
        }
    }
}

//  table header used to display all contacts
const contactsTableHeader = `
    <table class="table-striped" id="Contacts"> 
        <tr class="border_bottom">
            <td>
                <a class="btn btn-info btn-sm" id="btnNext" href="javascript:nextPage()" role="button">next</a>
            </td>
            <td>
                <a class="btn btn-info btn-sm" id="btnEnd" href="javascript:endPage()" role="button">last</a>
            </td>
            </td></td><td></td></td><td></td></td><td></td></td><td></td></td><td></td></td><td></td><td></td>
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
        <tbody id=rowHTMLCollection></tbody>
        <tfoot>
            <tr class="border_top">
                <td>
                    <a class="btn btn-info btn-sm" id="btnPrev" href="javascript:prevPage()" role="button">previous</a>
                </td>
                <td>
                    <a class="btn btn-info btn-sm" id="btnBegin" href="javascript:beginPage()" role="button">first</a>
                </td><td></td><td></td><td></td><td></td><td></td></td><td></td></td><td></td>
            </tr>
        <tfoot>
    </table>
`
//  contacts table header used to display filter option and page numbering
const contactHeader = `
    <div id="contactsDiv">
        <h4 class="text-center text-info">Your contacts</h4>
        <div class="optionsDiv">
            Filter By 
            <select id="selectField" onchange="changePlaceholder()">
                <option value="callsign" selected>Callsign</option>
                <option value="country">Country</option>
                <option value="mode">Mode</option>
                <br> 
            </select>
            <input type="text" id="searchInput" placeholder="Filtering on partially match of callsign">
            </div>
        <div class="table-responsive" id="contactsContentDiv"></div>
    </div>
    page: <span id="page"></span>
`

// header to display when adding contact so we can see previous contacts
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

// change placeholder depending on filter selection
function changePlaceholder() {
    console.log('change placeholder')
    let changePlaceholder =document.getElementById('selectField').value
    document.getElementById('searchInput').placeholder = `Filtering partially match of ${changePlaceholder}`
}

function contactDetail(id) {
    console.log("getting details")
    state.page = "contactDetail"
    render(id)
}

function getDisplayContactDetail(id) {
    fetch(baseUrl+`/contacts/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer: ${localStorage.getItem("jwt")}`
        }
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
                contactDetail=json.contact.data.attributes
                localStorage.setItem("jwt", json.auth_token)
                state.page = "displayContact"
                render()
            }
        }
    })
}

function submitEditContact() {
    editContactData = readContactForm()
    fetch(baseUrl+ `/contacts/${contactDetail.id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer: ${localStorage.getItem("jwt")}`
        },
        body: JSON.stringify(editContactData)
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
            } else {
                contactDetail = json.contact.data.attributes
                state.page = "displayContact"
                createInfo(json.success)
                render()
            }
        }
    })
}

function contactSubmitButton() {
    if (state.page == "addContact") {
        infoBox.innerHTML += `
            <br>
            <button type="button" name="submitAddContact" class="btn btn-info" id="submitAddContact">Submit Contact</button>
        `
    } else {
        infoBox.innerHTML += `
            <br>
            <button type="button" name="submitEditContact" class="btn btn-info" id="submitEditContact">Submit Contact</button>
        `
    }
        
}

function contactForm() {
    let title
    if (state.page == "addContact") {
        contact = new Contact
        title = "Add contact"
    } else {
        contact = contactDetail
        title = "Edit contact"
    }
    document.getElementById("logoffButton").classList.remove("hidden")
    document.getElementById("contactsButton").classList.remove("hidden")
    document.getElementById("profileButton").classList.remove("hidden")
    infoBox.innerHTML += `
        <h4 class="text-center text-info">${title}</h4>
        <h4><b>Station</b></h4>
        <hr>
        <form>
            <div class="form-group form-inline">
                <label col-sm-3 for="callsign" class="addContact text-info">Callsign: </label>
                <input type="text" class="form-control-sm" id="owncall" value="${contact.owncall}" required>
                <span class="validity"></span>
            </div>
            <div class="form-group form-inline">
                <label col-sm-3 for="callsign" class="addContact text-info">Station Callsign: </label>
                <input type="text" class="form-control-sm" id="station_callsign" value="${contact.owncall}" required>
                <span class="validity"></span>
            </div>
            <div class="form-group form-inline">
                <label for="gridsquare" class="addContact text-info">Gridsquare: </label>
                <input type="text" class="form-control-sm" id="my_gridsquare" value="${contact.my_gridsquare}" required pattern="[A-R]{2}[0-9]{2}([a-x]{2})?([0-9]{2})?">
                <span class="validity"></span>
            </div>
        </form>
        <h4><b>Worked Station</b></h4>
        <hr>
        <form>
            <div class="form-group form-inline">
                <label for="callsign" class="addContact text-info">Callsign: </label>
                <input type="text" class="form-control-sm" id="call"  value="${(typeof contact.call == 'undefined') ? "":contact.call}" required>
                <span class="validity"></span>
            </div>
        </form>
        <div id="prevContacts" style="display: none;">
        <div class="table-responsive" id="prevContactsContentDiv"></div>
        </div>
        <form>
            <div class="form-group form-inline">
                <label for="band" class="addContact text-info">Band: </label>
                <input type="text" class="form-control-sm" id="getBand" list="band" value="${(typeof contact.band == 'undefined') ? "":contact.band}" required/>
                <span class="validity"></span>
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
                <input type="text" class="form-control-sm" id="freq" value="${(typeof contact.freq == 'undefined') ? "":contact.freq}" required>
                <span class="validity"></span>
            </div>
            <div class="form-group form-inline">
                <label for="frequency_rcvd" class="addContact text-info">Frequency received: </label>
                <input type="text" class="form-control-sm" id="freq_rcvd" value="${(typeof contact.freq_rcvd == 'undefined') ? "":contact.freq_rcvd}">
            </div>
            <div class="form-group form-inline">
            <label for="mode" class="addContact text-info">Mode: </label>
            <input type="text" class="form-control-sm" list="mode" id="getMode" value="${(typeof contact.mode == 'undefined') ? "":contact.mode}" required/>
            <span class="validity"></span>
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
                <input type="text" class="form-control-sm" list="submode" id="getSubmode" value="${(typeof contact.submode == 'undefined') ? "":contact.submode}"/>
                <datalist id="submode">
                    <option value="FT4">FT4</option>
                </datalist>
            </div>
            <div class="form-group form-inline">
                <label for="modegroup" class="addContact text-info">Modegroup: </label>
                <input type="text" class="form-control-sm" list="modegroup" id="getModegroup" value="${(typeof contact.modegroup == 'undefined') ? "":contact.modegroup}"/>
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
                <input type="text" class="form-control-sm" id="qso_date" value="${contact.qso_date}">
            </div>
            <div class="form-group form-inline">
                <label for="time_on" class="addContact text-info">Time: </label>
                <input type="text" class="form-control-sm" id="time_on" value="${(state.page == 'addContact') ? contact.time_on:contact.time_on.slice(11,19)}">
            </div>
            <div class="form-group form-inline">
                <label for="qsl_rcvd" class="addContact text-info">QSL received: </label>
                <input type="checkbox" id="qsl_rcvd">
            </div>
            <div class="form-group form-inline">
                <label for="qsl_rdate" class="addContact text-info">QSL receive date: </label>
                <input type="text" class="form-control-sm" id="qsl_rdate" value="${(typeof contact.rdate == 'undefined') ? "":contact.rdate}">
            </div>
            <div class="form-group form-inline">
                <label for="dxcc" class="addContact text-info">DXCC: </label>
                <input type="text" class="form-control-sm" id="dxcc"  value="${(typeof contact.dxcc == 'undefined') ? "":contact.dxcc}">
            </div>
            <div class="form-group form-inline">
                <label for="country" class="addContact text-info">Country: </label>
                <input type="text" class="form-control-sm" id="country" size="40" value="${(typeof contact.country == 'undefined') ? "":contact.country}">
            </div>
            <div class="form-group form-inline">
                <label for="state" class="addContact text-info">State: </label>
                <input type="text" class="form-control-sm" id="state" value="${(typeof contact.state == 'undefined') ? "":contact.state}">
            </div>
            <div class="form-group form-inline">
                <label for="county" class="addContact text-info">County: </label>
                <input type="text" class="form-control-sm" id="cnty" value="${(typeof contact.cnty == 'undefined') ? "":contact.cnty}">
            </div>
            <div class="form-group form-inline">
                <label for="iota" class="addContact text-info">IOTA: </label>
                <input type="text" class="form-control-sm" id="iota"  value="${(typeof contact.iota == 'undefined') ? "":contact.iota}">
            </div>
            <div class="form-group form-inline">
                <label for="gridsquare" class="addContact text-info">Gridsquare: </label>
                <input type="text" class="form-control-sm"  id="gridsquare" value="${(typeof contact.gridsquare == 'undefined') ? "":contact.gridsquare}" pattern="[A-R]{2}[0-9]{2}([a-x]{2})?([0-9]{2})?">
                <span class="validity"></span>
            </div>
            <div class="form-group form-inline">
                <label for="cqz" class="addContact text-info">CQ Zone: </label>
                <input type="text" class="form-control-sm" id="cqz" value="${(typeof contact.cqz == 'undefined') ? "":contact.cqz}">
            </div>
            <div class="form-group form-inline">
                <label for="ituz" class="addContact text-info">ITU Zone: </label>
                <input type="text" class="form-control-sm" id="ituz" value="${(typeof contact.ituz == 'undefined') ? "":contact.ituz}">
            </div>
            <div class="form-group form-inline">
                <label for="park" class="addContact text-info">Park: </label>
                <input type="text" class="form-control-sm" id="park" value="${(typeof contact.park == 'undefined') ? "":contact.park}">
            </div>
        </form>  
        </div>
    ` 
    if (contact.qsl_rcvd) {
        document.getElementById('qsl_rcvd').setAttribute("checked","")
    }
}

// function used to search for previous contacts
function searchContact() {
    filteredContacts=[]
    filter = document.getElementById("call").value
    filter = filter.toUpperCase()
    console.log(filter)
    prevContactsView=document.getElementById('prevContacts')
    if (filter.length > 2) {
        console.log('filtering')
        // filteredContacts=[]
        prevContactsView.style.display = "block"
        for (let i=0; i < Contact.all.length; i++) {
            // grab an instance
            let contactObject = Contact.all[i]
            let call = contactObject.call
            // indexOf will return -1 if the call does not contain the filter
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
                let newText0  = document.createTextNode(filteredContact.call);
                newCell0.appendChild(newText0);
                let newCell1  = newRow.insertCell(1);
                let newText1  = document.createTextNode(filteredContact.qso_date);
                newCell1.appendChild(newText1);
                let newCell2  = newRow.insertCell(2);
                let newText2  = document.createTextNode(filteredContact.time_on.slice(11,19));
                newCell2.appendChild(newText2);
                let newCell3  = newRow.insertCell(3);
                let newText3  = document.createTextNode(filteredContact.band);
                newCell3.appendChild(newText3);
                let newCell4  = newRow.insertCell(4);
                let newText4  = document.createTextNode(filteredContact.mode);
                newCell4.appendChild(newText4);
                let newCell5  = newRow.insertCell(5);
                let newText5  = document.createTextNode(filteredContact.freq);
                newCell5.appendChild(newText5);
                let newCell6  = newRow.insertCell(6);
                let newText6  = document.createTextNode(filteredContact.country);
                newCell6.appendChild(newText6);
            }
        } else {
            prevContactsView.innerHTML = ""
        }
    } else {
        prevContactsView.style.display = "none"
        prevContactsView.innerHTML = ""
    }
}

function readContactForm() {
    owncallContactInput=document.getElementById("owncall").value
    stationcallsignContactInput=document.getElementById("station_callsign").value
    my_gridsquareContactInput=document.getElementById("my_gridsquare").value
    callContactInput=document.getElementById("call").value.toUpperCase()
    bandContactInput=document.getElementById("getBand").value
    freqContactInput=document.getElementById("freq").value
    freq_rcvdContactInput=document.getElementById("freq_rcvd").value
    modeContactInput=document.getElementById("getMode").value
    submodeContactInput=document.getElementById("getSubmode").value
    modegroupContactInput=document.getElementById("getModegroup").value
    qso_dateContactInput=document.getElementById("qso_date").value
    time_onContactInput=document.getElementById("time_on").value
    qsl_rcvdContactInput=document.getElementById("qsl_rcvd").checked
    qsl_rdateContactInput=document.getElementById("qsl_rdate").value
    dxccContactInput=document.getElementById("dxcc").value
    countryContactInput=document.getElementById("country").value.toUpperCase()
    stateContactInput=document.getElementById("state").value.toUpperCase()
    cntyContactInput=document.getElementById("cnty").value.toUpperCase()
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

function submitAddContact() {
    const contactData = readContactForm()
    fetch(baseUrl+`/contacts/`, {
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
        localStorage.setItem("jwt", json.auth_token)
        if (json.message) {
            createInfo(json.message)
            backToLogin()
        } else {
            if (json.errors) {
                createInfo(json.errors)
            } else {
                contactDetail=json.contact.data.attributes
                state.page = "displayContact"
                createInfo(json.success)
                render()
            }
        }
    })
}

function deleteContact() {
    fetch(baseUrl+`/contacts/${contactDetail.id}`, { 
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
            "Content-type":"application/json"
        }
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
                changePage(currentPage)
            } else {
                createInfo(json.success)
                getContacts()
            }
        }
    })
}

function displayContact() {
    let data = contactDetail
    state.page = "contactDetail"
    infoBox.innerHTML = navigationBar
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
                    <td class="col-6" id="data_index">State</td>
                    <td class="col-9">${data.state}</td>
                </tr>
                <tr class="d-flex">
                    <td class="col-6" id="data_index">County</td>
                    <td class="col-9">${data.cnty}</td>
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
}

function filterContactObjects() {
    console.log("filter unfiltered")
    let filterCategory = document.getElementById('selectField').value
    let searchFilter = document.getElementById('searchInput').value.toUpperCase()
    contactObjectsToDisplay=[]
    if (filterCategory == "callsign" ) {
        if (searchFilter.length > 0) {
            console.log('filtering')
            for (let i=0; i < Contact.all.length; i++) {
                // grab an instance
                let contactObject = Contact.all[i]
                let call = contactObject.call
                // https://www.w3schools.com/jsref/jsref_indexof.asp
                // indexOf will return -1 if the name does not contain the filter
                if (call.indexOf(searchFilter) > -1){
                    //if it is greater than -1 then the name does contain the filter
                    //therefor push it into the array of contactObjectsToDisplay
                contactObjectsToDisplay.push(contactObject)
                }
            }
        } else {
            contactObjectsToDisplay = contactObjects
        }
    }
    if (filterCategory == "country" ) {
        if (searchFilter.length > 0) {
            console.log('filtering')
            for (let i=0; i < Contact.all.length; i++) {
                // grab an instance
                let contactObject = Contact.all[i]
                let country = contactObject.country
                // indexOf will return -1 if the name does not contain the filter
                if (country.indexOf(searchFilter) > -1){
                    //if it is greater than -1 then the name does contain the filter
                    //therefor push it into the array of contactObjectsToDisplay
                contactObjectsToDisplay.push(contactObject)
                }
            }
        } else {
            contactObjectsToDisplay = Contact.all
        }
    }
    if (filterCategory == "mode" ) {
        if (searchFilter.length > 0) {
            console.log('filtering')
            for (let i=0; i < Contact.all.length; i++) {
                // grab an instance
                let contactObject = Contact[i]
                let mode = contactObject.mode
                // indexOf will return -1 if the name does not contain the filter
                if (mode.indexOf(searchFilter) > -1){
                    //if it is greater than -1 then the name does contain the filter
                    //therefor push it into the array of contactObjectsToDisplay
                contactObjectsToDisplay.push(contactObject)
                }
            }
        } else {
            contactObjectsToDisplay = Contact.all
        }
    }
    page = 1
    changePage(page)
}

function getContacts() {
    console.log('entering get contacts')
    contactObjects = []
    contactObjectsToDisplay = []
    fetch(baseUrl+`/contacts`, {
        method: "GET",
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` }
    })
    .then(response => response.json())
    .then(json => {
        localStorage.setItem("jwt", json.auth_token)
        if (json.message) {
            createInfo(json.message)
            backToLogin()
        } else {
            if (json.errors) {
                createInfo(json.errors, error)
                state.page = "login"
                render()
            } else {
                jsonContacts = json.contacts.data
                if (jsonContacts.length != 0) {
                    for (let i = 0; i < jsonContacts.length; i++) {
                        contactObject = new Contact(jsonContacts[i].attributes)
                        // contactObjects.push(contactObject)
                    }
                }
                infoBox.innerHTML = navigationBar
                infoBox.innerHTML += contactHeader
                contactObjectsToDisplay = Contact.all
                changePage(currentPage)
            }
        }
    })
}

function contacts() {
    console.log("contacts clicked")
    state.page = "contacts"
    render()
}

function prevPage()
{
    if (currentPage > 1) {
        table = document.getElementById('rowHTMLCollection')
        table.innerHTML = ""
        currentPage--;
        changePage(currentPage);
    }
}

function nextPage()
{
    if (currentPage < numPages()) {
        table = document.getElementById('rowHTMLCollection')
        table.innerHTML = ""
        currentPage++;
        changePage(currentPage);
    }
}

function beginPage()
{
    if(currentPage > 1) {
        table = document.getElementById('rowHTMLCollection')
        table.innerHTML = ""
        currentPage = 1
        changePage(currentPage)
    }
}

function endPage()
{
    if (currentPage < numPages()) {
        table = document.getElementById('rowHTMLCollection')
        table.innerHTML = ""
        currentPage=numPages()
        changePage(currentPage);
    }
}
    
function changePage(page)
{
    document.getElementById('searchInput').addEventListener('input', filterContactObjects)
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
    if (contactObjectsToDisplay.length != 0) {
        for (let i = (page-1) * objectsPerPage; i < (page * objectsPerPage ) && i < contactObjectsToDisplay.length; i++) {
            renderObject(contactObjectsToDisplay[i])
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
    } else {
        contactsTable.innerHTML = `
            <hr>
            <b>You don't have any contacts logged yet</b>
            <hr>
        `
    }
    // Because the pagination for the contacts page is not going through the render() function we need some "local" eventListeners
    logoffButton.addEventListener("click", () => {
            logoff()
        })
    profileButton.addEventListener("click", () => {
            console.log("profile clicked")
            state.page = "profile"
            render()
        })
    addContactButton.addEventListener("click", () => {
            console.log("add Contact clicked")
            state.page = "addContact"
            render()
        })
}

function numPages()
{
    return Math.ceil(contactObjectsToDisplay.length / objectsPerPage);
}

function renderObject(object) {
    let tableRef = document.getElementById("Contacts").getElementsByTagName("tbody")[0];
    rowHTML = document.getElementById('rowHTMLCollection')
    rowHTML.innerHTML += `
    <tr>
        <td>
            <a href="javascript:getDisplayContactDetail(${object.id})" id="contactDetail">detail</a>
        </td>
        <td>
            ${object.owncall}
        </td>
        <td>
            ${object.call}
        </td>
        <td>
            ${object.qso_date}
        </td>
        <td>
            ${object.time_on.slice(11,19)}
        </td>
        <td>
            ${object.band}
        </td>
        <td>
            ${object.mode}
        </td>
        <td>
            ${object.freq}
        </td>
        <td>
            ${object.country}
        </td>
    </tr>`
}