import { ipcMain } from "electron"
import fs from "fs"

type Resources = {
    [lang: string]: {
        translation: {
            [key: string]: string
        }
    }
}

type LangKeys = {
    [key: string]: string
}

export function getLangResources(): Resources {
    const langFiles = fs.readdirSync("lang")
    const resources: Resources = {};

    for (const file of langFiles) {
        const split = file.split(".")
        split.pop()
        const lang = split.join(".")
        const keys: LangKeys = JSON.parse(fs.readFileSync(`lang/${file}`, {encoding: "utf-8"}))
        resources[lang] = {
            translation: keys
        }
    }
    
    return resources
}

export function getLangResource(lang: string): Resources {
    const resources: Resources = {};
    const keys: LangKeys = JSON.parse(fs.readFileSync(`lang/${lang}.json`, {encoding: "utf-8"}))

    resources[lang] = {
        translation: keys
    }
    
    return resources
}

ipcMain.handle("getLangResources", () => {
    return getLangResources()
})

ipcMain.handle("getLangResource", (e, lang) => {
    return getLangResource(lang)
})