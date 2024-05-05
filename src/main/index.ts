import { app, BrowserWindow, globalShortcut, ipcMain } from "electron";
import path from "path";
import { getCurrentToken, setCurrentAccount } from "./accounts";
import { BotCordClient } from "./bot";

app.setName("BotCord")

let mainWindow: BrowserWindow;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        minWidth: 1000,
        minHeight: 600,
        title: "BotCord",
        darkTheme: true,
        backgroundColor: "#222222",
        icon: path.join(__dirname, '../../assets/', (process.platform == "win32" ? "icon.ico" : "icon.png")),
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, '../preload/preload.js')
        },
    })
    
    /** @ts-ignore */
    if (import.meta.env.DEV) {
        mainWindow.loadURL("http://localhost:5173")
    } else {
        mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"))
    }

    mainWindow.removeMenu()
    mainWindow.webContents.openDevTools()
}

app.disableHardwareAcceleration()
app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

const globalShortcuts = [
    // {
    //     keys: ["CommandOrControl+R"],
    //     callback: () => {if (loggedIn) loadMainPage(); else mainWindow.loadFile('./pages/login/index.html')}
    // }, {
    {
        keys: ["CommandOrControl+Shift+R"],
        callback: () => {}
    }, {
        keys: ["CommandOrControl+Shift+I"],
        callback: () => mainWindow.webContents.toggleDevTools()
    }, {
        keys: ["CommandOrControl+Plus", "CommandOrControl+numadd"],
        callback: () => {
            if (mainWindow.webContents.zoomFactor < 1.5) {
                mainWindow.webContents.setZoomFactor(mainWindow.webContents.zoomFactor + 0.05)
            }
        }
    }, {
        keys: ["CommandOrControl+-", "CommandOrControl+numsub"],
        callback: () => {
            if (mainWindow.webContents.zoomFactor > 0.5) {
                mainWindow.webContents.setZoomFactor(mainWindow.webContents.zoomFactor - 0.05)
            }
        }
    }, {
        keys: ["CommandOrControl+0"],
        callback: () => mainWindow.webContents.setZoomFactor(1)
    },
]

app.on('browser-window-focus', function () {
    globalShortcuts.forEach(shortcut => {
        shortcut.keys.forEach(key => {
            globalShortcut.register(key, shortcut.callback)
        })
    })
})

app.on('browser-window-blur', function () {
    globalShortcuts.forEach(shortcut => {
        shortcut.keys.forEach(key => {
            globalShortcut.unregister(key)
        })
    })
})


let isLoggedIn: boolean = false
let client: BotCordClient | undefined;

ipcMain.on("login", (_, token) => {
    login(token)
})

async function login(token?: string) {
    token = token ?? getCurrentToken()!
    mainWindow.webContents.send("navigate", "/")

    client = await new BotCordClient().start(token).catch(e => {
        mainWindow.webContents.send("error", "An error occured while logging into client.", e.message)
        return undefined
    })
    if (!client) return;

    setCurrentAccount(token)
    isLoggedIn = true
    mainWindow.webContents.send("login")
}

ipcMain.handle("getIsLoggedIn", async () => {
    if (!isLoggedIn && getCurrentToken()) {
        await login()
    }
    return isLoggedIn
})