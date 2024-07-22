import { app, BrowserWindow, globalShortcut, ipcMain, shell } from "electron";
import path from "path";
import { deleteAccountsFile, getCurrentToken, setCurrentAccount } from "./accounts";
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
    Events,
    ComponentType,
    StringSelectMenuComponent,
    GuildEmoji,
    ReactionEmoji
} from "discord.js";
import moment from "moment";
import { Member, MemberNone, BotCordUserFlags, Guild, Channel, Role, Message, BasicGuild, MessageInteraction, ActionRowComponent, Emoji } from "src/shared/types";

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
    /** @ts-ignore */
    if (import.meta.env.DEV) mainWindow.webContents.openDevTools()
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

ipcMain.on("logout", () => {
    console.log("got logout")
    client.destroy()
    client.stopRPC()
    deleteAccountsFile()
    isLoggedIn = false
    mainWindow.webContents.send("logout")
})

ipcMain.on("switchAccount", (_, token) => {
    console.log("got switch account")
    client.destroy()
    client.stopRPC()
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
    client.startRPC()
    
    setCurrentAccount(token)
    isLoggedIn = true
    createBotEvents()
    mainWindow.webContents.send("login", (await constructMember(client.user!)))
}

export function createBotEvents() {
    client.on(Events.MessageCreate, async (message) => {
        mainWindow.webContents.send("messageCreate", await constructMessage(message, message.channel as TextChannel))
    })

    client.on(Events.MessageDelete, async (message) => {
        if (message.partial) return;
        mainWindow.webContents.send("messageDelete", await constructMessage(message, message.channel as TextChannel))
    })

    client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
        if (newMessage.partial) return;
        mainWindow.webContents.send("messageUpdate", await constructMessage(newMessage, newMessage.channel as TextChannel))
    })
}

ipcMain.handle("getIsLoggedIn", async () => {
    if (!isLoggedIn && getCurrentToken()) {
        await login()
    }
    return isLoggedIn
})

const MemberCache = new Collection<string, Member | MemberNone>()
const MemberAboutMeCache = new Collection<string, string | undefined>()
const MemberBannerCache = new Collection<string, string | null | undefined>()
const GuildCache = new Collection<string, Guild>()

async function constructMember(input: GuildMember | User | string, guildInput?: DJSGuild | string): Promise<Member | MemberNone | undefined> {
    // const startedLoading = new Date()
    // console.log(input)
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
    if (["410781931727486976", "1197624693184802988"].includes(user.id)) badges = ["BotCordStaff"].concat(badges) as BotCordUserFlags[]
    if (!badges.includes("Nitro") && !user.bot && user.displayAvatarURL().endsWith(".gif")) badges.push("Nitro")

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
        let roles: Role[] = []
        member.roles.cache.sort((a, b) => b.position - a.position).forEach(async r => roles.push(await constructRole(r, guild!) as Role))

        data.highestRole = await constructRole(member.roles.highest, guild)
        if (member.roles.hoist) data.hoistRole = await constructRole(member.roles.hoist, guild)
        data.isOwner = guild.ownerId == user.id,
        data.joinedAt = moment(member.joinedAt).format("D MMM YYYY")
        data.guild = await constructBasicGuild(guild)
        data.roles = roles
    }

    // console.log(`constructed member ${user.username} in ${new Date() - startedLoading}ms`)
    MemberCache.set(cacheId, data)
    return data
}

async function constructBasicGuild(input: DJSGuild | string, force: boolean = false): Promise<BasicGuild | undefined> {
    const guild = (input instanceof DJSGuild) ? input : await client.guilds.fetch(input).catch(e => undefined)
    if (!guild) return;

    const data: BasicGuild = {
        id: guild.id,
        name: guild.name,
        icon: guild.iconURL({size: 128})
    }

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
            roles: [],
            lastFetched: new Date().getTime()
        }
        return data
    }

    if (GuildCache.has(guild.id) && (new Date().getTime() - (GuildCache.get(guild.id)?.lastFetched ?? 0)) < 60000) {
        return GuildCache.get(guild.id)
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
        everyone: await constructRole(guild.roles.everyone, guild),
        lastFetched: new Date().getTime()
    }

    GuildCache.set(guild.id, data)

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
        memberCount: role.members.filter(m => m.roles.hoist?.id == role.id).size,
        icon: role.iconURL({size: 128})
    }

    return data
}

async function constructMessage(input: DJSMessage | string, channel: TextChannel) : Promise<Message | undefined> {
    const message = (input instanceof DJSMessage) ? input : await channel.messages.fetch(input).catch(e => undefined)
    if (!message) return;

    let referenceMessage: Message | undefined;
    if (message.reference && message.reference.messageId) {
        const refMessage = await message.fetchReference().catch(e => undefined)
        if (refMessage) {
            referenceMessage = await constructMessage(refMessage, channel)
        }
    }

    let interaction: MessageInteraction | undefined;
    if (message.interaction) {
        const member = await constructMember(message.interaction.user, channel.guild) as Member
        interaction = {
            type: message.interaction.type,
            id: message.interaction.id,
            commandName: message.interaction.commandName,
            member: member
        }
    }

    let components: ActionRowComponent[] = [];
    
    const SelectMenuTypes = [
        ComponentType.ChannelSelect,
        ComponentType.MentionableSelect,
        ComponentType.RoleSelect,
        ComponentType.StringSelect,
        ComponentType.UserSelect
    ]
    
    message.components.forEach(r => {
        if (r.components[0].type == ComponentType.Button) {
            components.push({
                type: "actionrow",
                components: r.components.filter(r => r.type == ComponentType.Button).map(b => ({
                    type: "button",
                    customId: b.customId,
                    label: b.label,
                    disabled: b.disabled,
                    style: 
                        b.style == 1 ? "primary" :
                        b.style == 2 ? "secondary" :
                        b.style == 3 ? "success" :
                        b.style == 4 ? "danger" :
                        b.style == 5 ? "link" :
                        "primary"
                }))
            })
        } else if (SelectMenuTypes.includes(r.components[0].type)) {
            components.push({
                type: "actionrow",
                components: r.components.filter(r => SelectMenuTypes.includes(r.type)).map((s: any) => ({
                    type: "selectmenu",
                    customId: s.customId,
                    placeholder: s.placeholder
                }))
            })
        }
    })

    const data: Message = {
        id: message.id,
        content: message.content,
        author: await constructMember(message.member ?? message.author, channel.guild) as Member,
        embeds: message.embeds,
        createdAt: moment(message.createdTimestamp).calendar(),
        reference: referenceMessage,
        attachments: message.attachments.map(a => a),
        channelId: message.channelId,
        guildId: channel.guildId,
        editedTimestamp: message.editedTimestamp,
        interaction: interaction,
        components: components,
        reactions: message.reactions.cache.map(r => ({
            count: r.count,
            emoji: constructEmoji(r.emoji)
        }))
    }

    return data
}

function constructEmoji(emoji: GuildEmoji | ReactionEmoji): Emoji {
    return {
        name: emoji.name,
        id: emoji.id,
        image: emoji.imageURL({size: 128})
    }
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
    const guild = await constructGuild(id)
    return guild
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

ipcMain.on("sendMessage", async (e, channel: Channel, message: string, reply: Message | undefined) => {
    const channeld = await client.channels.fetch(channel.id).catch(e => undefined) as TextChannel | undefined
    if (reply) channeld!.send({content: message, reply: {messageReference: reply.id}})
    else channeld!.send({content: message})
})

ipcMain.on("sendTyping", async (e, channel: Channel) => {
    const channeld = await client.channels.fetch(channel.id).catch(e => undefined) as TextChannel
    channeld.sendTyping()
})

ipcMain.handle("getAboutMe", async (_, user: Member) => {
    if (!user.bot) return
    if (MemberAboutMeCache.has(user.id)) return MemberAboutMeCache.get(user.id)
    const applicationRPC = await client.rest.get(`/applications/${user.id}/rpc`).catch(e => undefined) as {description: string} | undefined
    MemberAboutMeCache.set(user.id, applicationRPC?.description)
    return applicationRPC?.description
})

ipcMain.handle("getBannerURL", async (_, user: Member) => {
    if (MemberBannerCache.has(user.id)) return MemberBannerCache.get(user.id)
    const bannerURL = (await client.users.fetch(user.id, {force: true}).catch(e => undefined))?.bannerURL({size: 512})
    MemberBannerCache.set(user.id, bannerURL)
    return bannerURL
})

ipcMain.on("openURL", (e, url: string) => {
    shell.openExternal(url)
})


ipcMain.handle("eval", async (e, code) => {
    return await eval(code)
})