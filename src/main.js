const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron")
const { client } = require("./bot");
const moment = require("moment");
const { Message, GuildMember, User } = require("discord.js");
const fs = require("fs");
const path = require("path");

const paths = {
    tokenFile: path.join(app.getPath("userData"), "token.file")
}

/** @type {BrowserWindow} */
let window;
const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        minWidth: 1000,
        minHeight: 600,
        title: "BotCord",
        darkTheme: true,
        backgroundColor: "#222222",
        icon: path.join(__dirname, '../assets/', (process.platform == "win32" ? "icon.ico" : "icon.png")),
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
            // preload: path.join(__dirname, 'preload.js')
        },
    })
    window = mainWindow

    const token = fs.existsSync(paths.tokenFile) ?
        fs.readFileSync(paths.tokenFile, {encoding: "utf-8"}) : undefined

    if (token) login(token)
    else mainWindow.loadFile('./pages/login/index.html')

    mainWindow.removeMenu()
    // mainWindow.webContents.openDevTools()
}

app.disableHardwareAcceleration()
app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

let loggedIn = false

app.on('browser-window-focus', function () {
    globalShortcut.register("CommandOrControl+R", () => {if (loggedIn) loadMainPage()})
    globalShortcut.register("CommandOrControl+Shift+R", () => {})
    globalShortcut.register("CommandOrControl+Shift+I", () => window.webContents.toggleDevTools())
});
app.on('browser-window-blur', function () {
    globalShortcut.unregister("CommandOrControl+R")
    globalShortcut.unregister("CommandOrControl+Shift+R")
    globalShortcut.unregister("CommandOrControl+Shift+I")
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

var currentGuild;
var currentChannel;

function loadMainPage(noLoading = false) {
    window.loadFile("./pages/main/index.html").then(async e => {
        window.webContents.send("load", await constructMember(client.user), noLoading)
    })
}

async function login(token) {
    await window.loadFile("./pages/main/index.html")
    const lclient = await client.start(token).catch(e => {
        window.webContents.send("error", "An error occured while logging into client.", e.message)
        return undefined
    })
    if (!lclient) return
    fs.writeFileSync(paths.tokenFile, token)
    loggedIn = true
    if (!currentGuild) currentGuild = (await client.guilds.fetch()).first().id
    if (!currentChannel) currentChannel = (await (await client.guilds.fetch(currentGuild)).channels.fetch()).filter(c => c.isTextBased()).first().id
    window.webContents.send("load", await constructMember(client.user), false)
}

ipcMain.on("login", async (e, token) => {
    login(token)
})

ipcMain.on("logout", async (e) => {
    console.log(`Logged out of ${client.user.tag}`)
    client.destroy()
    fs.rmSync(paths.tokenFile)
    loggedIn = false
    window.loadFile("./pages/login/index.html")
})

ipcMain.handle("client-avatar", () => {
    return client.user.displayAvatarURL()
})

ipcMain.handle("guilds", async () => {
    const list = []
    const guilds = await client.guilds.fetch()
    guilds.forEach(guild => list.push({name: guild.name, id: guild.id, icon: guild.iconURL()}))
    return list
})

ipcMain.handle("currentGuild", async () => {
    const guild = await client.guilds.fetch(currentGuild)
    guild.pfp = guild.iconURL()
    return guild
})

ipcMain.handle("currentChannel", async () => {
    return await client.channels.fetch(currentChannel)
})

ipcMain.handle("channels", async () => {
    const list = []
    const guild = await client.guilds.fetch(currentGuild)
    const channels = (await guild.channels.fetch()).sort((a, b) => a.rawPosition - b.rawPosition)
    channels.forEach(channel => list.push({
        name: channel.name,
        id: channel.id,
        type: channel.type,
        category: {
            id: channel.parentId,
            name: channel.parent?.name
        },
    }))
    return list
})

ipcMain.handle("memberRoleList", async () => {
    const list = []
    const guild = await client.guilds.fetch(currentGuild)
    const roles = (await guild.roles.fetch()).sort((a, b) => b.position - a.position)
    roles.forEach(role => list.push({
        name: role.name,
        id: role.id,
        color: role.hexColor,
        position: role.position,
        hoist: role.hoist,
        memberSize: role.members.filter(m => m.roles.hoist?.id == role.id).size,
        isEveryone: role.id == guild.roles.everyone.id
    }))
    return list
})

/** @param {GuildMember|User|string} input */
async function constructMember(input) {
    // const startedLoading = new Date()
    const id = typeof input == "string" ? input : input.id
    const guild = await client.guilds.fetch(currentGuild)
    const member = await guild.members.fetch(id).catch(() => undefined)
    const user = member ?
        (
            (input instanceof GuildMember) ? member.user :
            (input instanceof User) ? input :
            await client.users.fetch(id)
        ) :
        await client.users.fetch(id)

    let badges = user.flags.toArray()
    if (["410781931727486976", "1197624693184802988"].includes(user.id)) badges = ["BotCordStaff"].concat(badges)
    if (!user.bot && user.displayAvatarURL().endsWith(".gif")) badges.push("Nitro")

    let data = {
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
        createdAt: moment(user.createdAt).format("D MMM YYYY")
    }

    if (member) {
        Object.assign(data, {
            highestRole: {
                name: member.roles.highest.name,
                id: member.roles.highest.id,
                hoist: member.roles.highest.hoist
            },
            hoistRole: {
                name: member.roles.hoist?.name,
                id: member.roles.hoist?.id
            },
            isOwner: guild.ownerId == user.id,
            joinedAt: moment(member.joinedAt).format("D MMM YYYY")
        })
    }

    // console.log(`constructed member ${user.username} in ${new Date() - startedLoading}ms`)
    return data
}

ipcMain.handle("getApplicationRPC", async (_, user) => {
    if (!user.bot) return
    const applicationRPC = await client.rest.get(`/applications/${user.id}/rpc`).catch(e => undefined)
    return applicationRPC?.description
})

ipcMain.handle("getUser", async (e, id) => {
    return await constructMember(id)
})

ipcMain.handle("getChannel", async (e, id) => {
    return await client.channels.fetch(id)
})

ipcMain.handle("members", async () => {
    const list = []
    const guild = await client.guilds.fetch(currentGuild)
    const members = (await guild.members.fetch()).sort((a, b) => b.roles.highest.position - a.roles.highest.position)
    for (const [_, member] of members) {
        list.push(await constructMember(member))
    }
    // console.log(list)
    return list
})

ipcMain.handle("getBannerURL", async (_, id) => {
    return (await client.users.fetch(id, {force: true}).catch(e => undefined))?.bannerURL({size: 512})
})

ipcMain.on("message", async (_, message) => {
    const channel = await client.channels.fetch(currentChannel)
    channel.send({content: message})
})

/** @param {Message} message */
async function makeMessage(message) {
    message.authorDisplayColor = (message.member?.displayHexColor !== "#000000") ? message.member?.displayHexColor ?? "#ffffff" : "#ffffff",
    message.avatar = message.author.displayAvatarURL()
    message.authorName = (message.author.discriminator !== "0") ? `${message.author.username}#${message.author.discriminator}`: message.author.username
    message.authorDisplayName = message.member?.displayName || message.author.displayName
    message.time = moment(message.createdAt).calendar()
    message.modifiedMember = await constructMember(message.member || message.author)
    return message
}

client.on("messageCreate", async (message) => {
    if (message.channel.id !== currentChannel) return
    window.webContents.send("messageCreate", await makeMessage(message))
})

client.on("messageDelete", async (message) => {
    if (message.channel.id !== currentChannel) return
    window.webContents.send("messageDelete", await makeMessage(message))
})

ipcMain.handle("switchGuild", async (_, id) => {
    if (currentGuild == id) return false
    currentGuild = id
    currentChannel = (await (await client.guilds.fetch(currentGuild)).channels.fetch()).filter(c => c.isTextBased()).first().id
    return true
})

ipcMain.handle("switchChannel", (_, id) => {
    if (currentChannel == id) return false
    currentChannel = id
    return true
})

ipcMain.handle("lastMessagesFromCurrentChannel", async (_, amount) => {
    const list = []
    const channel = await client.channels.fetch(currentChannel)
    const messages = await channel.messages.fetch({limit: amount})
    for (const [_, message] of messages) {
        list.push(await makeMessage(message))
    }
    return list.reverse()
})

ipcMain.on("typing", async (e) => {
    const channel = await client.channels.fetch(currentChannel)
    channel.sendTyping()
})

ipcMain.on("openLink", (e, url) => {
    const urlWindow = new BrowserWindow({
        parent: window,
        width: 900,
        height: 600,
        minWidth: 900,
        minHeight: 600,
        title: url,
        icon: path.join(__dirname, '../assets/', "icon.png"),
        backgroundColor: "#222222",
    })
    urlWindow.loadURL(url).catch(e => {
        if ([-2, -3].includes(e.errno)) return;
        window.webContents.send("error", "An error occured while loading the URL.", e.message)
        urlWindow.destroy()
    })
    urlWindow.removeMenu()
})

ipcMain.handle("eval", async (e, code) => {
    return await eval(code)
})