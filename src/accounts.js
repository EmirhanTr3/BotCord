const { app, ipcMain } = require("electron")
const path = require("path");
const fs = require("fs");
const filePath = path.join(app.getPath("userData"), "token.file")

/**
 * 
 * @returns {object}
 */
function getTokenFile() {
    return fs.existsSync(filePath) ? 
        JSON.parse(fs.readFileSync(filePath, {encoding: "utf8"})) : {}
}

function stringify(value) {
    return JSON.stringify(value, null, 2)
}

/**
 * @returns {string}
 */
function getCurrentToken() {
    const file = getTokenFile()
    
    return file.current
}

/**
 * @param {string} token 
 */
function setCurrentAccount(token) {
    const file = getTokenFile()

    file.current = token

    fs.writeFileSync(filePath, stringify(file))
    addAccount(token)
}

async function addAccount(token) {
    const file = getTokenFile()

    const user = await (await fetch("https://discord.com/api/v10/users/@me", { 
        method: "GET",
        headers: {
            "Authorization": `Bot ${token}`
        }
    })).json()

    const account = {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        discriminator: user.discriminator
    }

    if (!file.accounts) file.accounts = {}

    file.accounts[token] = account
    fs.writeFileSync(filePath, stringify(file))
}

function removeAccount(token) {
    const file = getTokenFile()

    delete file.accounts[token]

    fs.writeFileSync(filePath, stringify(file))
}

function deleteAccountsFile() {
    fs.rmSync(filePath)
}

ipcMain.handle("getAccounts", () => {
    const file = getTokenFile()
    return file.accounts
})

ipcMain.handle("addAccount", async (e, token) => {
    await addAccount(token)
})

ipcMain.on("removeAccount", (e, token) => {
    removeAccount(token)
})

module.exports = {
    getCurrentToken,
    setCurrentAccount,
    addAccount,
    deleteAccountsFile
}