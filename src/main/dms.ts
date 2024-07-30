import { app, ipcMain } from "electron";
import path from "path";
import fs from "fs";
import { DMChannel } from "src/shared/types"
const filePath = path.join(app.getPath("userData"), "dms.list")

type DMFile = {
    channels?: {
        [id: string]: DMChannel
    }
}

export function getDMFile(): DMFile {
    return fs.existsSync(filePath) ? 
        JSON.parse(fs.readFileSync(filePath, {encoding: "utf8"})) : {}
}

function stringify(value: any) {
    return JSON.stringify(value, null, 2)
}

export function getDMList(): DMChannel[] {
    const file = getDMFile()

    return Object.values(file.channels || {})
}

export function addDM(dm: DMChannel) {
    const file = getDMFile()

    if (!file.channels) file.channels = {}
    file.channels![dm.id] = dm

    fs.writeFileSync(filePath, stringify(file))
}

export function removeDM(dm: DMChannel) {
    const file = getDMFile()

    delete file.channels![dm.id]

    fs.writeFileSync(filePath, stringify(file))
}

ipcMain.handle("getDMList", () => {
    return getDMList()
})

// ipcMain.handle("addDM", async (e, dm: DMChannel) => {
//     addDM(dm)
// })

// ipcMain.on("removeDM", (e, dm: DMChannel) => {
//     removeDM(dm)
// })