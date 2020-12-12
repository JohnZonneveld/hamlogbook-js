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
    infoDiv.className = "alert alert-warning alert-dismissible"
    messageHTML = messageHTML + `<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>`
    infoDiv.innerHTML = messageHTML

    document.getElementById('infoViewPort').appendChild(infoDiv)

    // alert goes away on it's own after 5 seconds
    window.setTimeout(() => {
        infoDiv.hidden = true
    }, 5000)
    
    // Jump to top to see info messages if any
    window.scrollTo(0, 0)
}
