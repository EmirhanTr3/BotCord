import { app, ipcMain } from "electron"
import path from "path"
import fs from "fs"
const filePath = path.join(app.getPath("userData"), "settings.file")

type SettingsFile = {
    language: string,
    theme: string
}

export function getSettingsFile(): SettingsFile {
    return fs.existsSync(filePath) ? 
        JSON.parse(fs.readFileSync(filePath, {encoding: "utf8"})) : {}
}

function stringify(value: any) {
    return JSON.stringify(value, null, 2)
}

export function setSetting(setting: keyof SettingsFile, value: string) {
    const file = getSettingsFile()

    file[setting] = value

    fs.writeFileSync(filePath, stringify(file))
}

export function getSetting(setting: keyof SettingsFile) {
    const file = getSettingsFile()

    return file[setting]
}

ipcMain.on("setSetting", (e, setting, value) => {
    setSetting(setting, value)
})

ipcMain.handle("getSetting", (e, setting) => {
    return getSetting(setting)
})