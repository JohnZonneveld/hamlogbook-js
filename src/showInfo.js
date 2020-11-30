function createInfo(messages) {
    if (Array.isArray(messages)) {
        messageHTML = ""
        messages.forEach(function (message) {
            messageHTML += message + "<br>";
        });
    } else {
        messageHTML = messages
    }
    showInfoMessage(messageHTML)
}

function showInfoMessage() {
    infoLine.innerHTML = `
            <div class="alert alert-warning alert-dismissible fade show" role="alert">
                <strong>${messageHTML}</strong>
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        `
        // Jump to top to see info messages if any
        window.scrollTo(0, 0)
}