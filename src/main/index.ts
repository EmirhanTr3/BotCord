import { app, BrowserWindow, globalShortcut, ipcMain } from "electron";
import path from "path";
import { getCurrentToken, setCurrentAccount } from "./accounts";
import { BotCordClient } from "./bot";
import { Collection, GuildMember, PresenceStatus, User, UserFlags } from "discord.js";
import moment from "moment";

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
let currentGuild: string | undefined;
let currentChannel: string | undefined

ipcMain.on("login", (_, token) => {
    console.log("got login")
    login(token)
})

async function login(token?: string) {
    token = token ?? getCurrentToken()!
    
    client = await new BotCordClient().start(token).catch(e => {
        mainWindow.webContents.send("error", "An error occured while logging into client.", e.message)
        return undefined
    })
    if (!client) return;
    
    setCurrentAccount(token)
    isLoggedIn = true
    if (!currentGuild) currentGuild = (await client.guilds.fetch()).first()?.id!
    if (!currentChannel) currentChannel = (await (await client.guilds.fetch(currentGuild)).channels.fetch()).filter(c => c && c.isTextBased()).first()?.id!
    mainWindow.webContents.send("navigate", "/")
    mainWindow.webContents.send("login", (await constructMember(client.user!)))
}

ipcMain.handle("getIsLoggedIn", async () => {
    if (!isLoggedIn && getCurrentToken()) {
        await login()
    }
    return isLoggedIn
})

type BotCordUserFlags = keyof typeof UserFlags | "BotCordStaff" | "Nitro"

type Member = {
    id: string,
    bot: boolean,
    webhook?: boolean,
    username: string,
    discriminator: string,
    name: string,
    displayName: string,
    displayColor: string,
    avatar: string,
    badges: BotCordUserFlags[],
    status: PresenceStatus,
    createdAt: string,
    lastFetched: number,

    highestRole?: {
        name: string,
        id: string,
        hoist: boolean
    },
    hoistRole?: {
        name?: string,
        id?: string
    },
    isOwner?: boolean,
    joinedAt?: string
}

type MemberNone = {
    lastFetched: number
}

const MemberCache = new Collection<string, Member | MemberNone>()

async function constructMember(input: GuildMember|User|string) : Promise<Member | MemberNone | undefined> {
    // const startedLoading = new Date()
    const id = typeof input == "string" ? input : input.id

    // console.log(input)
    if (input && input instanceof User && input.bot && input.discriminator == "0000") {
        return {
            id: input.id,
            bot: input.bot,
            webhook: true,
            username: input.username,
            discriminator: input.discriminator,
            name: input.username + "#0000",
            displayName: input.username,
            displayColor: "#ffffff",
            avatar: input.displayAvatarURL({size: 128}),
            badges: [],
            status: "offline",
            createdAt: moment(0).format("D MMM YYYY"),
            lastFetched: new Date().getTime()
        } as Member
    }

    const cacheId = `${currentGuild}.${id}`
    if (MemberCache.has(cacheId) && (new Date().getTime() - (MemberCache.get(cacheId)?.lastFetched ?? 0)) < 20000) {
        // console.log(`tried to get ${cacheId} but it was already cached`)
        return MemberCache.get(cacheId)
    }

    const guild = await client!.guilds.fetch(currentGuild!)
    const member = (input instanceof GuildMember) ? input : await guild.members.fetch(id).catch(() => undefined)
    const user = member ? member.user :
        (input instanceof User) ? input :
        await client?.users.fetch(id).catch(() => undefined)

    // console.log(`got user and member information of ${user?.username} (${id}) in ${new Date() - startedLoading}ms`)

    // console.log(input, user)
    if (!user) {
        const none: MemberNone = {
            lastFetched: new Date().getTime()
        }
        MemberCache.set(cacheId, none)
        return none
    }
    // console.log("passed user check")
    let badges: BotCordUserFlags[] = user.flags!.toArray()
    if (["410781931727486976", "1197624693184802988"].includes(user.id)) badges = ["BotCordStaff"].concat(badges) as BotCordUserFlags[]
    if (!user.bot && user.displayAvatarURL().endsWith(".gif")) badges.push("Nitro")

    let data: Member = {
        id: user.id,
        bot: user.bot,
        username: user.username,
        discriminator: user.discriminator,
        name: (user.discriminator !== "0") ? `${user.username}#${user.discriminator}` : user.username,
        displayName: member?.displayName || user.displayName,
        displayColor: (member && member.displayHexColor !== "#000000") ? member.displayHexColor : "#ffffff",
        avatar: (member) ? member.displayAvatarURL({size: 128}) : user.displayAvatarURL({size: 128}),
        badges: badges,
        status: member?.presence?.status || "offline",
        createdAt: moment(user.createdAt).format("D MMM YYYY"),
        lastFetched: new Date().getTime()
    }

    if (member) {
        data.highestRole = {
            name: member.roles.highest.name,
            id: member.roles.highest.id,
            hoist: member.roles.highest.hoist
        }
        data.hoistRole = {
            name: member.roles.hoist?.name,
            id: member.roles.hoist?.id
        }
        data.isOwner = guild.ownerId == user.id,
        data.joinedAt = moment(member.joinedAt).format("D MMM YYYY")
    }

    // console.log(`constructed member ${user.username} in ${new Date() - startedLoading}ms`)
    MemberCache.set(cacheId, data)
    return data
}