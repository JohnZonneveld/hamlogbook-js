let messageHTML = ""

function createInfo(messages) {
    if (Array.isArray(messages)) {
        messageHTML = ""
        messages.forEach(function (message) {
            messageHTML += message + "<br>";
        });
    } else {
        messageHTML = messages
    }
    showInfoMessage()
}

function showInfoMessage() {

    let infoDiv = document.createElement('div')
    infoDiv.className = "alert-warning"
    infoDiv.innerHTML = messageHTML

    document.getElementById('infoViewPort').appendChild(infoDiv)

    let closeButton = document.createElement('span')
    closeButton.className = "closebtn"
    closeButton.innerHTML = `
        &times
    `
    infoDiv.appendChild(closeButton)

    //alert goes away on it's own after 3 seconds
    window.setTimeout(() => {
        closeButton.parentElement.hidden = true
    }, 5000)

    //alert disappears when they click the closeButton
    closeButton.addEventListener('click', close)
    
        // Jump to top to see info messages if any
        window.scrollTo(0, 0)
}

function close(e){
    console.log('close pressed')
    e.target.parentElement.hidden = true
}