import { app, ipcMain } from "electron";
import path from "path";
import fs from "fs";
const filePath = path.join(app.getPath("userData"), "token.file")

type TokenFile = {
    current?: string,
    accounts?: {
        [id: string]: {
            id: string,
            username: string,
            avatar: string,
            discriminator: string
        }
    }
}

export function getTokenFile(): TokenFile {
    return fs.existsSync(filePath) ? 
        JSON.parse(fs.readFileSync(filePath, {encoding: "utf8"})) : {}
}

function stringify(value: any) {
    return JSON.stringify(value, null, 2)
}

export function getCurrentToken() {
    const file = getTokenFile()
    
    return file.current
}

/**
 * @param {string} token 
 */
export function setCurrentAccount(token: string) {
    const file = getTokenFile()

    file.current = token

    fs.writeFileSync(filePath, stringify(file))
    addAccount(token)
}

export async function addAccount(token: string) {
    const file = getTokenFile()

    if (file.accounts && Object.keys(file.accounts).length >= 7) return "maxed"

    const user = await (await fetch("https://discord.com/api/v10/users/@me", { 
        method: "GET",
        headers: {
            "Authorization": `Bot ${token}`
        }
    })).json()

    if (!user.id) return "invalid"

    const account = {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        discriminator: user.discriminator
    }

    if (!file.accounts) file.accounts = {}

    file.accounts[token] = account
    fs.writeFileSync(filePath, stringify(file))
    return true
}

export function removeAccount(token: string) {
    const file = getTokenFile()

    delete file.accounts![token]

    fs.writeFileSync(filePath, stringify(file))
}

export function deleteAccountsFile() {
    fs.rmSync(filePath)
}

ipcMain.handle("getAccounts", () => {
    const file = getTokenFile()
    return file.accounts
})

ipcMain.handle("addAccount", async (e, token) => {
    return await addAccount(token)
})

ipcMain.on("removeAccount", (e, token) => {
    removeAccount(token)
})