const { IntlMessageFormat } = require("intl-messageformat");

/**
 * 
 * @param {string} key Message key in language file
 * @param {JSON} values JSON formatted message format
 * @returns {string}
 */
function formatMessage(key, values = {}) {
    const lang = require(`../../lang/en.json`)
    return new IntlMessageFormat(lang[key]).format(values)
}


/** @param {Element} element  */
function dragElement(element, moveElement) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0
    if (moveElement) {
        moveElement.onmousedown = dragMouseDown
    } else {
        element.onmousedown = dragMouseDown
    }

    function dragMouseDown(e) {
        e.preventDefault()
        pos3 = e.clientX
        pos4 = e.clientY
        document.onmouseup = closeDragElement
        document.onmousemove = elementDrag
    }

    function elementDrag(e) {
        e.preventDefault()
        pos1 = pos3 - e.clientX
        pos2 = pos4 - e.clientY
        pos3 = e.clientX
        pos4 = e.clientY
        if (
            element.offsetTop - pos2 > element.clientHeight / 2 &&
            element.offsetTop - pos2 < document.body.clientHeight - element.clientHeight / 2
        )
            element.style.top = (element.offsetTop - pos2) + "px"

        if (element.offsetLeft - pos1 > element.clientWidth / 2 &&
            element.offsetLeft - pos1 < document.body.clientWidth - element.clientWidth / 2
        )
            element.style.left = (element.offsetLeft - pos1) + "px"
    }

    function closeDragElement() {
        document.onmouseup = null
        document.onmousemove = null
    }
}

/**
 * 
 * @param {string} title 
 * @param {string} description 
 * @param {boolean} moveable 
 */
function showMessageBox(title, description, moveable = false) {
    const messageBoxDiv = document.createElement("div")
    messageBoxDiv.id = "messageboxdiv"

    const messageBox = document.createElement("div")
    messageBox.id = "messagebox"

    const move = document.createElement("div")
    move.id = "move"

    const titleDiv = document.createElement("p")
    titleDiv.id = "title"
    titleDiv.innerText = title

    const descDiv = document.createElement("p")
    descDiv.id = "description"
    descDiv.innerText = description

    const close = document.createElement("button")
    close.id = "close"
    close.type = "button"
    close.innerText = "Close"

    messageBox.replaceChildren(move, close, titleDiv, descDiv, close)
    messageBoxDiv.appendChild(messageBox)
    document.body.appendChild(messageBoxDiv)
    if (moveable) dragElement(messageBox, move)

    close.addEventListener("click", () => messageBoxDiv.remove())

    // <div id="messagebox">
    //   <div id="move"></div>
    //   <svg id="close" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#d1d1d1" viewBox="0 0 256 256"><path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z"></path></svg>
    //   <p id="title"><b>Title</b></p>
    //   <p id="description">Description</p>
    // </div>
}

/**
 * 
 * @param {string} title 
 * @param {string} description 
 * @param {() => void} confirmCallback 
 * @param {() => void} cancelCallback
 * @param {boolean} moveable 
 */
function showConfirmationBox(title, description, confirmCallback, cancelCallback, moveable = false) {
    const messageBoxDiv = document.createElement("div")
    messageBoxDiv.id = "messageboxdiv"

    const messageBox = document.createElement("div")
    messageBox.id = "messagebox"

    const move = document.createElement("div")
    move.id = "move"

    const titleDiv = document.createElement("p")
    titleDiv.id = "title"
    titleDiv.innerText = title

    const descDiv = document.createElement("p")
    descDiv.id = "description"
    descDiv.innerText = description

    const confirm = document.createElement("button")
    confirm.id = "confirm"
    confirm.type = "button"
    confirm.innerText = "Confirm"

    const cancel = document.createElement("button")
    cancel.id = "cancel"
    cancel.type = "button"
    cancel.innerText = "Cancel"

    messageBox.replaceChildren(move, confirm, cancel, titleDiv, descDiv)
    messageBoxDiv.appendChild(messageBox)
    document.body.appendChild(messageBoxDiv)
    if (moveable) dragElement(messageBox, move)

    confirm.addEventListener("click", () => {
        confirmCallback()
        messageBoxDiv.remove()
    })
    cancel.addEventListener("click", () => {
        cancelCallback()
        messageBoxDiv.remove()
    })

    // <div id="messagebox">
    //   <div id="move"></div>
    //   <svg id="close" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#d1d1d1" viewBox="0 0 256 256"><path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z"></path></svg>
    //   <p id="title"><b>Title</b></p>
    //   <p id="description">Description</p>
    // </div>
}

const badges = {
    BotCordStaff: {name: "BotCord Staff", icon:  "../../assets/icon.png"},
    Staff: {name: "Discord Staff", icon: "https://cdn.discordapp.com/badge-icons/5e74e9b61934fc1f67c65515d1f7e60d.png"},
    Partner: {name: "Partnered Server Owner", icon: "https://cdn.discordapp.com/badge-icons/3f9748e53446a137a052f3454e2de41e.png"},
    Hypesquad: {name: "HypeSquad Events", icon: "https://cdn.discordapp.com/badge-icons/bf01d1073931f921909045f3a39fd264.png"},
    BugHunterLevel1: {name: "Discord Bug Hunter", icon: "https://cdn.discordapp.com/badge-icons/2717692c7dca7289b35297368a940dd0.png"},
    BugHunterLevel2: {name: "Discord Bug Hunter", icon: "https://cdn.discordapp.com/badge-icons/848f79194d4be5ff5f81505cbd0ce1e6.png"},
    // MFASMS: "",
    // PremiumPromoDismissed: "",
    HypeSquadOnlineHouse1: {name: "HypeSquad Bravery", icon: "https://cdn.discordapp.com/badge-icons/8a88d63823d8a71cd5e390baa45efa02.png"},
    HypeSquadOnlineHouse2: {name: "HypeSquad Brilliance", icon: "https://cdn.discordapp.com/badge-icons/011940fd013da3f7fb926e4a1cd2e618.png"},
    HypeSquadOnlineHouse3: {name: "HypeSquad Balance", icon: "https://cdn.discordapp.com/badge-icons/3aa41de486fa12454c3761e8e223442e.png"},
    PremiumEarlySupporter: {name: "Early Supporter", icon: "https://cdn.discordapp.com/badge-icons/7060786766c9c840eb3019e725d2b358.png"},
    // TeamPseudoUser: "",
    // HasUnreadUrgentMessages: "",
    // VerifiedBot: "",
    VerifiedDeveloper: {name: "Early Verified Bot Developer", icon: "https://cdn.discordapp.com/badge-icons/6df5892e0f35b051f8b61eace34f4967.png"},
    CertifiedModerator: {name: "Moderator Program Alumni", icon: "https://cdn.discordapp.com/badge-icons/fee1624003e2fee35cb398e125dc479b.png"},
    // BotHTTPInteractions: "",
    // Spammer: "",
    // DisablePremium: "",
    ActiveDeveloper: {name: "Active Developer", icon: "https://cdn.discordapp.com/badge-icons/6bdc42827a38498929a4920da12695d9.png"},
    // Quarantined: "",
    // Collaborator: "",
    // RestrictedCollaborator: ""
    Nitro: {name: "Nitro Subscriber", icon: "https://cdn.discordapp.com/badge-icons/2ba85e8026a8614b640c2837bcdfe21b.png"},
}

function getBadge(badge) {
    const badgeInfo = badges[badge]
    if (!badgeInfo) return
    return {
        name: badgeInfo.name || badge,
        icon: badgeInfo.icon
    }
}

function showHoverText(event, parentDiv, text) {
    const hoverDiv = getHoverTextDiv(text)
    const parentBound = parentDiv.getBoundingClientRect()
    document.body.append(hoverDiv)

    hoverDiv.style.top = parentBound.y - 5 - (hoverDiv.clientHeight) + "px"
    hoverDiv.style.left = parentBound.x + (parentBound.width / 2) - (hoverDiv.clientWidth / 2) + "px"

    return hoverDiv
}

function getHoverTextDiv(input) {
    const hoverDiv = document.createElement("div")
    hoverDiv.id = "hovertext"
    const text = document.createElement("p")
    text.innerText = input
    hoverDiv.appendChild(text)
    return hoverDiv
}

function createHoverText(parent, text) {
    let hoverDiv
    parent.addEventListener("mouseenter", (e) => {
        hoverDiv = showHoverText(e, parent, text)
    })
    parent.addEventListener("mouseleave", (e) => {
        hoverDiv.remove()
    })
}

function getBotBadge(user) {
    const overrides = {
        "249668571297218560": {name: "q man", color: "#719FC9", verified: true}
    }

    if (!user.bot && !overrides[user.id]) return;
    const botBadge = document.createElement("div")
    botBadge.id = "botbadge"

    const name = document.createElement("p")
    name.innerText = "BOT"

    if (user.username == "clyde") {
        botBadge.classList.add("botbadge-ai")
        name.innerText = "AI"
    }

    if (overrides[user.id]) {
        name.innerText = overrides[user.id].name
        if (overrides[user.id].color) botBadge.style.backgroundColor = overrides[user.id].color
    }

    if (
        user.badges.includes("VerifiedBot") ||
        user.username == "clyde" ||
        (overrides[user.id] && overrides[user.id].verified)
    ) {
        // botBadge.classList.add("verified")
        name.classList.add("verified")

        const checkmark = document.createElement("svg")
        checkmark.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"#ffffff\" viewBox=\"0 0 24 24\"><path d=\"M18.7 7.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4l3.3 3.29 7.3-7.3a1 1 0 0 1 1.4 0Z\"></path></svg>"
        botBadge.appendChild(checkmark)
        createHoverText(checkmark, `Verified ${name.innerText.split(" ").map(n => n.substring(0,1).toUpperCase() + n.substring(1).toLowerCase()).join(" ")}`)
    }
    
    botBadge.appendChild(name)
    return botBadge
}

function appendBotBadge(div, user) {
    const badge = getBotBadge(user)
    if (!badge) return;
    div.appendChild(badge)
}

function getStatusData(status) {
    switch (status) {
        case "online":
            return {
                name: "Online",
                icon: "../../assets/status/online.png"
            }
        case "idle":
            return {
                name: "Idle",
                icon: "../../assets/status/idle.png"
            }
        case "dnd":
            return {
                name: "Do Not Disturb",
                icon: "../../assets/status/dnd.png"
            }
        case "offline":
            return {
                name: "Offline",
                icon: "../../assets/status/offline.png"
            }
    }
}

async function eval(x) {
    return ipcRenderer.invoke("eval", x)
}