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

function showToast(type, message) {
    const toast = document.createElement("div")
    toast.id = "toast"
    toast.classList.add(type)

    let svg
    switch (type) {
        case "info":
            svg = '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="#6caaff" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"></path></svg>'
            break
        case "warn":
            svg = '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="#ffc440" viewBox="0 0 256 256"><path d="M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM222.93,203.8a8.5,8.5,0,0,1-7.48,4.2H40.55a8.5,8.5,0,0,1-7.48-4.2,7.59,7.59,0,0,1,0-7.72L120.52,44.21a8.75,8.75,0,0,1,15,0l87.45,151.87A7.59,7.59,0,0,1,222.93,203.8ZM120,144V104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,180Z"></path></svg>'
            break
        case "error":
            svg = '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="#ff5c5c" viewBox="0 0 256 256"><path d="M128,72a8,8,0,0,1,8,8v56a8,8,0,0,1-16,0V80A8,8,0,0,1,128,72ZM116,172a12,12,0,1,0,12-12A12,12,0,0,0,116,172Zm124-44a15.85,15.85,0,0,1-4.67,11.28l-96.05,96.06a16,16,0,0,1-22.56,0h0l-96-96.06a16,16,0,0,1,0-22.56l96.05-96.06a16,16,0,0,1,22.56,0l96.05,96.06A15.85,15.85,0,0,1,240,128Zm-16,0L128,32,32,128,128,224h0Z"></path></svg>'
            break
        case "success":
            svg = '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="#5fffbc" viewBox="0 0 256 256"><path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path></svg>'
            break
        default:
            svg = '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="#aaaaaa" viewBox="0 0 256 256"><path d="M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path></svg>'
    }
    if (svg) toast.appendChild(new DOMParser().parseFromString(svg, "image/svg+xml").documentElement)

    const msg = document.createElement("p")
    msg.innerText = message
    
    toast.appendChild(msg)
    document.body.appendChild(toast)

    setTimeout(() => {
        toast.classList.add("disappearing")
        setTimeout(() => {
            toast.remove()
        }, 1000);
    }, 5000);
}

function openDropdownMenu(event, ...options) {
    if (document.getElementById("dropdown")) document.getElementById("dropdown").remove()

    // format:
    // {
    //     type: "normal"|"danger" = "normal"
    //     text: string,
    //     callback: function
    // }

    const dropdown = document.createElement("div")
    dropdown.id = "dropdown"

    const buttons = document.createElement("div")
    buttons.id = "buttons"

    for (const option of options) {
        const button = document.createElement("div")
        button.id = "button"
        button.classList.add(option.type ?? "normal")

        const text = document.createElement("p")
        text.innerText = option.text
        
        button.addEventListener("click", (e) => {
            const event = {
                mouseEvent: e,
                close: () => dropdown.remove()
            }
            option.callback(event, option)
        })
        
        button.appendChild(text)
        buttons.appendChild(button)
    }

    dropdown.appendChild(buttons)

    document.body.append(dropdown)

    dropdown.style.top = (
        (event.clientY + dropdown.clientHeight > document.body.clientHeight) ?
        document.body.clientHeight - (dropdown.clientHeight + 10) :
        event.clientY
        ) + "px"
    dropdown.style.left = (
        (event.clientX + dropdown.clientWidth > document.body.clientWidth) ?
        event.clientX - dropdown.clientWidth :
        event.clientX
        ) + "px"

}

window.addEventListener("contextmenu", (e) => {
    openDropdownMenu(e, 
        {
            text: "test",
            callback: (e, button) => {
                console.log(button.text)
            }
        }, 
        {
            text: "test2",
            callback: (e, button) => {
                console.log(button.text)
            }
        }, 
        {
            text: "test3",
            callback: (e, button) => {
                console.log(button.text)
            }
        }, 
        {
            text: "test4",
            callback: (e, button) => {
                console.log(button.text)
            }
        },
        {
            text: "test5",
            callback: (e, button) => {
                console.log(button.text)
            }
        },
        {
            text: "test6",
            callback: (e, button) => {
                console.log(button.text)
            }
        },
        {
            text: "test7",
            callback: (e, button) => {
                console.log(button.text)
            }
        },
        {
            text: "test8",
            callback: (e, button) => {
                console.log(button.text)
            }
        },
        {
            text: "test9",
            callback: (e, button) => {
                console.log(button.text)
            }
        },
        {
            type: "danger",
            text: "Close Context Menu",
            callback: (e, button) => {
                console.log(button.text)
                e.close()
            }
        },
    )
})

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