import { app, BrowserWindow, globalShortcut, ipcMain, ipcRenderer } from "electron";
import path from "path";
import { getCurrentToken, setCurrentAccount } from "./accounts";
import { BotCordClient } from "./bot";
import {
    Collection,
    Guild as DJSGuild,
    GuildMember,
    NonThreadGuildBasedChannel,
    OAuth2Guild, 
    Role as DJSRole,
    User,
    Message as DJSMessage,
    TextChannel,
    MessageFlags,
    Events
} from "discord.js";
import moment from "moment";
import { Member, MemberNone, BotCordUserFlags, Guild, Channel, Role, Message } from "src/shared/types";

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
        frame: false
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

ipcMain.on("minimize", () => mainWindow.minimize())
ipcMain.on("maximize", () => mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize())
ipcMain.on("close", () => mainWindow.close())


let isLoggedIn: boolean = false
let client: BotCordClient;

ipcMain.on("login", (_, token) => {
    console.log("got login")
    login(token)
})

async function login(token?: string) {
    token = token ?? getCurrentToken()
    if (!token) return;
    
    const lcclient = await new BotCordClient().start(token).catch(e => {
        mainWindow.webContents.send("error", "An error occured while logging into client.", e.message)
        return undefined
    })
    if (!lcclient) return;
    client = lcclient
    
    setCurrentAccount(token)
    isLoggedIn = true
    createBotEvents()
    // if (!currentGuild) currentGuild = (await client.guilds.fetch()).first()?.id!
    // if (!currentChannel) currentChannel = (await (await client.guilds.fetch(currentGuild)).channels.fetch()).filter(c => c && c.isTextBased()).first()?.id!
    mainWindow.webContents.send("navigate", "/")
    mainWindow.webContents.send("login", (await constructMember(client.user!)))
}

export function createBotEvents() {
    client.on(Events.MessageCreate, async (message) => {
        mainWindow.webContents.send("messageCreate", await constructMessage(message, message.channel as TextChannel))
    })
}

ipcMain.handle("getIsLoggedIn", async () => {
    if (!isLoggedIn && getCurrentToken()) {
        await login()
    }
    return isLoggedIn
})

const MemberCache = new Collection<string, Member | MemberNone>()

async function constructMember(input: GuildMember | User | string, guildInput?: DJSGuild | string): Promise<Member | MemberNone | undefined> {
    // const startedLoading = new Date()
    const id = typeof input == "string" ? input : input.id
    const guild = guildInput ? 
        (
            guildInput instanceof DJSGuild ? guildInput :
            await client.guilds.fetch(guildInput!).catch(e => undefined)
        ) :
        undefined

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

    const cacheId = `${guild}.${id}`
    if (MemberCache.has(cacheId) && (new Date().getTime() - (MemberCache.get(cacheId)?.lastFetched ?? 0)) < 20000) {
        // console.log(`tried to get ${cacheId} but it was already cached`)
        return MemberCache.get(cacheId)
    }

    const member = (input instanceof GuildMember) ? input : await guild?.members.fetch(id).catch(() => undefined)
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
    let badges: BotCordUserFlags[] = user.flags ? user.flags.toArray() : []
    if (["410781931727486976", "1197624693184802988", "695882756671930400"].includes(user.id)) badges = ["BotCordStaff"].concat(badges) as BotCordUserFlags[]
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

    if (member && guild) {
        data.highestRole = await constructRole(member.roles.highest, guild)
        if (member.roles.hoist) data.hoistRole = await constructRole(member.roles.hoist, guild)
        data.isOwner = guild.ownerId == user.id,
        data.joinedAt = moment(member.joinedAt).format("D MMM YYYY")
    }

    // console.log(`constructed member ${user.username} in ${new Date() - startedLoading}ms`)
    MemberCache.set(cacheId, data)
    return data
}

async function constructGuild(input: DJSGuild | OAuth2Guild | string, force: boolean = false): Promise<Guild | undefined> {
    const guild = (input instanceof DJSGuild) ? input :
        (
            (input instanceof OAuth2Guild) && !force ? input :
            await client.guilds.fetch((input instanceof OAuth2Guild) ? input.id : input).catch(e => undefined)
        )

    if (!guild) return;

    if (guild instanceof OAuth2Guild) {
        const data: Guild = {
            id: guild.id,
            name: guild.name,
            icon: guild.iconURL({size: 128}),
            channels: [],
            members: [],
            roles: []
        }
        return data
    }

    const channels: Channel[] = []
    const members: Member[] = []
    const roles: Role[] = []

    for (const [_, channel] of (await guild.channels.fetch()).sort((a, b) => a!.rawPosition - b!.rawPosition)) {
        const cchannel = await constructChannel(channel!, guild)
        if (cchannel) channels.push(cchannel)
    }

    for (const [_, member] of await guild.members.fetch()) {
        const mmember = await constructMember(member, guild)
        if (mmember) members.push(mmember as Member)
    }

    for (const [_, role] of (await guild.roles.fetch()).sort((a, b) => b.position - a.position)) {
        const rrole = await constructRole(role, guild)
        if (rrole) roles.push(rrole)
    }

    const data: Guild = {
        id: guild.id,
        name: guild.name,
        icon: guild.iconURL({size: 128}),
        channels: channels,
        members: members,
        roles: roles,
        everyone: await constructRole(guild.roles.everyone, guild)
    }

    return data
}

async function constructChannel(input: NonThreadGuildBasedChannel | string, guildInput: DJSGuild | string): Promise<Channel | undefined> {
    const guild = guildInput instanceof DJSGuild ? guildInput : await client.guilds.fetch(guildInput!).catch(e => undefined)
    if (!guild) return;
    const channel = (!(typeof input == "string")) ? input : await guild.channels.fetch(input).catch(e => undefined)
    if (!channel) return;

    const data: Channel = {
        id: channel.id,
        name: channel.name,
        type: channel.type,
        parent: channel.parent ? await constructChannel(channel.parent, guild) : undefined,
        guildId: guild.id
    }

    return data
}

async function constructRole(input: DJSRole | string, guildInput: DJSGuild): Promise<Role | undefined> {
    const guild = guildInput instanceof DJSGuild ? guildInput : await client.guilds.fetch(guildInput!).catch(e => undefined)
    if (!guild) return;
    const role = (input instanceof DJSRole) ? input : await guild.roles.fetch(input).catch(e => undefined)
    if (!role) return;

    const data: Role = {
        name: role.name,
        id: role.id,
        color: role.hexColor,
        position: role.position,
        hoist: role.hoist,
        isEveryone: role.id == guild.roles.everyone.id,
        memberCount: role.members.filter(m => m.roles.hoist?.id == role.id).size
    }

    return data
}

async function constructMessage(input: DJSMessage | string, channel: TextChannel) : Promise<Message | undefined> {
    const message = (input instanceof DJSMessage) ? input : await channel.messages.fetch(input).catch(e => undefined)
    if (!message) return;

    const data: Message = {
        id: message.id,
        content: message.content,
        author: await constructMember(message.member?.id ? message.member : message.author, channel.guild) as Member,
        embeds: message.embeds,
        createdAt: moment(message.createdTimestamp).calendar(),
        reference: (message.reference && !message.flags.has(MessageFlags.IsCrosspost)) ? await constructMessage(await message.fetchReference(), channel) : undefined,
        attachments: message.attachments,
        channelId: message.channelId
    }

    return data
}

ipcMain.handle("getGuilds", async () => {
    const guilds: Guild[] = []

    for (const [_, guild] of await client.guilds.fetch()) {
        const gguild = await constructGuild(guild)
        if (gguild) guilds.push(gguild)
    }

    return guilds
})

ipcMain.handle("getGuild", async (e, id) => {
    return await constructGuild(id, true)
})

ipcMain.handle("getChannel", async (e, id, guild) => {
    return await constructChannel(id, guild)
})

ipcMain.handle("getLastMessages", async (e, cid, amount) => {
    const channel = await client.channels.fetch(cid) as TextChannel
    const messages = await channel.messages.fetch({limit: amount})
    const list: Message[] = []

    for (const [_, message] of messages) {
        list.push(await constructMessage(message, channel) as Message)

    }

    return list.reverse()
})

ipcMain.on("sendMessage", async (e, channel: Channel, message: string) => {
    const channeld = await client.channels.fetch(channel.id).catch(e => undefined) as TextChannel | undefined
    channeld!.send({content: message})
})



ipcMain.handle("eval", async (e, code) => {
    return await eval(code)
})