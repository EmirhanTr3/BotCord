async function settingsOpened() {
    //! close settings button
    document.querySelector("#settings #close").addEventListener("click", () => {
        document.getElementById("settings").remove()
    })

    //! logout button
    document.querySelector("#settings #leftbar #buttons #logout").addEventListener("click", (e) => {
        e.preventDefault()
        showConfirmationBox(
            "Are you sure about this action?",
            "Are you sure you want to log out of your current bot account?",
            () => ipcRenderer.send("logout"),
            () => {}
        )
    })

    //! buttons
    const buttons = document.querySelector("#settings #leftbar #buttons")
    settingsAccount()
    
    buttons.querySelector("#appearance").addEventListener("click", () => settingsAppearance())
    buttons.querySelector("#account").addEventListener("click", () => settingsAccount())
    buttons.querySelector("#switchaccount").addEventListener("click", () => settingsSwitchAccount())
}

//! account settings
async function settingsAccount() {
    const content = document.querySelector("#settings #content")
    const html = await (await fetch("../settings/contents/account.html")).text()
    content.innerHTML = html

    const user = window.client
    const account = content.querySelector("#account #useraccount")

    account.querySelector("#pfp").src = await ipcRenderer.invoke("client-avatar")
    account.querySelector("#name").innerText = `${user.displayName}`
    account.querySelector("#banner").src = await ipcRenderer.invoke("getBannerURL", user.id) || "../../assets/bannerdefault.png"
    account.querySelector("#info #username").innerText = `${user.username}#${user.discriminator}`

    if (!user.badges.includes("BotHTTPInteractions")) {
        const status = document.createElement("img")
        status.id = "userstatus"
        status.height = 20
        status.width = 20
        const statusData = getStatusData(user.status)
        status.src = statusData.icon
        createHoverText(status, statusData.name)
        if (member.status == "offline") memberDiv.classList.add("offline")
        account.appendChild(status)
    }
    
    if (user.badges?.length > 0) {
        const badges = document.createElement("div")
        badges.id = "badges"

        for (const badge of user.badges) {
            if (getBadge(badge)) {
                const badgeInfo = getBadge(badge)
                const badgeImg = document.createElement("img")
                badgeImg.id = "badge"
                badgeImg.height = 22
                badgeImg.width = 22
                badgeImg.src = badgeInfo.icon
                badges.appendChild(badgeImg)

                createHoverText(badgeImg, badgeInfo.name)
            }
        }
        account.appendChild(badges)
    }

}

//! appearance settings
async function settingsAppearance() {
    const content = document.querySelector("#settings #content")
    const html = await (await fetch("../settings/contents/appearance.html")).text()
    content.innerHTML = html

    //* light mode (fake)
    content.querySelector(".theme#light").addEventListener("click", (e) => {
        showConfirmationBox(
            "What the fuck!?",
            "Did you just seriously try to use the fucking light mode. Are you fucking crazy?? Do you hate your eyes or something.\n\nLook, i will give you another chance on going back. Press cancel to go back or suffer the consequences.",
            () => ipcRenderer.send("lightthemedumbass"),
            () => {}
        )
    })

    // CUSTOM THEME SUPPORT WILL BE SOON
    // color picker - main, secondary
    // function colorpicker(prop, div, input, def) {
    //     input.addEventListener("change", (e) => {
    //         div.style.backgroundColor = input.value
    //         document.documentElement.style.setProperty(prop, input.value)
    //     })
    //     div.style.backgroundColor = document.documentElement.style.getPropertyValue(prop) || def
    //     input.value = document.documentElement.style.getPropertyValue(prop) || def
    // }

    // colorpicker(
    //     "--main-color",
    //     document.querySelector("#settings #content #maincolor"),
    //     document.querySelector("#settings #content #maincolor input"),
    //     "#222222"
    // )

    // colorpicker(
    //     "--secondary-color",
    //     document.querySelector("#settings #content #secondarycolor"),
    //     document.querySelector("#settings #content #secondarycolor input"),
    //     "#303030"
    // )
}

//! switch account
async function settingsSwitchAccount() {
    const accountList = await ipcRenderer.invoke("getAccounts")

    const switchaccountdiv = document.createElement("div")
    switchaccountdiv.id = "switchaccountdiv"

    const switchaccount = document.createElement("div")
    switchaccount.id = "switchaccount"

    const title = document.createElement("h1")
    title.innerText = "Manage Accounts"

    const accounts = document.createElement("div")
    accounts.id = "accounts"

    let num = 0
    for (const token of Object.keys(accountList)) {
        num++
        const data = accountList[token]

        const seperator = document.createElement("div")
        seperator.id = "seperator"

        const account = document.createElement("div")
        account.id = "account"

        const pfp = document.createElement("img")
        pfp.id = "pfp"
        pfp.width = 40
        pfp.height = 40
        pfp.src = `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.webp?size=128`

        const texts = document.createElement("div")
        texts.id = "texts"

        const username = document.createElement("p")
        username.id = "username"
        username.innerText = `${data.username}#${data.discriminator}`
        texts.appendChild(username)

        let switchbutton;
        let logoutbutton;

        if (window.client.id == data.id) {
            const loggedin = document.createElement("p")
            loggedin.id = "loggedin"
            loggedin.innerText = "Active account"
            texts.appendChild(loggedin)

        } else {
            switchbutton = document.createElement("button")
            switchbutton.textContent = "Switch"

            logoutbutton = new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="#e14545" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>', "application/xml").documentElement
            createHoverText(logoutbutton, "Logout")

            logoutbutton.addEventListener("click", async (e) => {
                showConfirmationBox(
                    "Logout",
                    `Are you sure you want to logout of '${data.username}#${data.discriminator}' account?`,
                    () => {
                        ipcRenderer.send("removeAccount", token)
                        settingsSwitchAccount()
                        switchaccountdiv.remove()
                    },
                    () => {}
                )
            })

            switchbutton.addEventListener("click", (e) => {
                showConfirmationBox(
                    "Switch Account",
                    `Are you sure you want to switch to '${data.username}#${data.discriminator}' account?`,
                    () => {
                        ipcRenderer.send("switchAccount", token)
                    },
                    () => {}
                )
            })
        }

        account.replaceChildren(pfp, texts)
        if (switchbutton) {
            account.appendChild(switchbutton)
            account.appendChild(logoutbutton)
        }
        accounts.appendChild(account)
        if (num !== Object.keys(accountList).length) accounts.appendChild(seperator)
    }

    const addaccount = document.createElement("div")
    addaccount.id = "addaccount"

    const addaccountp = document.createElement("p")
    addaccountp.innerText = "Add Account"
    addaccount.appendChild(addaccountp)

    switchaccount.replaceChildren(title, accounts, addaccount)
    switchaccountdiv.replaceChildren(switchaccount)
    document.body.appendChild(switchaccountdiv)

    switchaccountdiv.addEventListener("click", (e) => {
        if (e.target !== switchaccountdiv) return;
        switchaccountdiv.remove()
    })

    addaccountp.addEventListener("click", () => {
        openLoginUI()
        switchaccountdiv.remove()
    })
}

//! login ui
function openLoginUI() {
    const logindiv = document.createElement("div")
    logindiv.id = "logindiv"
    
    const login = document.createElement("div")
    login.id = "login"
    
    const title = document.createElement("h1")
    title.innerText = "Add Account"
    
    const text = document.createElement("p")
    text.innerText = "BOT TOKEN"
    
    const input = document.createElement("input")

    const button = document.createElement("button")
    button.innerText = "Add account"

    login.replaceChildren(title, text, input, button)
    logindiv.replaceChildren(login)
    document.body.appendChild(logindiv)

    logindiv.addEventListener("click", async (e) => {
        if (e.target !== logindiv) return;
        settingsSwitchAccount()
        logindiv.remove()
    })

    button.addEventListener("click", async (e) => {
        const token = input.value
        await ipcRenderer.invoke("addAccount", token)
        settingsSwitchAccount()
        logindiv.remove()
    })
}