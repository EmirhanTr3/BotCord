import { Client, Events, GatewayIntentBits, Guild, GuildMember, Partials, VoiceChannel, VoiceState } from "discord.js"
import * as DiscordRPC from "discord-rpc"
import { createAudioPlayer, createAudioResource, EndBehaviorType, entersState, joinVoiceChannel, StreamType, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice"
import prism from "prism-media"
import Speaker, { pipeline } from "speaker"
import { ipcMain } from "electron"

export class BotCordClient extends Client {
    rpc!: DiscordRPC.Client;

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildVoiceStates
            ],
            partials: [
                Partials.Channel,
                Partials.User,
                Partials.GuildMember,
                Partials.Message
            ]
        })
    }

    async start(token: string) {
        await this.login(token)
        
        this.on(Events.ClientReady, (client) => {
            console.log(`Logged into ${client.user.tag}`)
            new BotCordVoice(this, "932659866110160936", "932659866110160940")
        })

        return this
    }

    startRPC() {
        if (!this.user) throw Error("Client user does not exist.")
        const clientId = "1197624693184802988"
        const username = this.user.tag
        const avatar = this.user.displayAvatarURL()

        DiscordRPC.register(clientId)

        const rpc = new DiscordRPC.Client({ transport: 'ipc' })
        const startTimestamp = new Date()
        this.rpc = rpc

        async function setActivity() {
            rpc.setActivity({
                buttons: [
                    {
                        label: "Download BotCord",
                        url: "https://github.com/EmirhanTr3/BotCord/releases"
                    }
                ],
                details: username,
                startTimestamp,
                largeImageKey: avatar,
                largeImageText: username,
                instance: false,
            });
        }

        rpc.on('ready', () => {
            console.log("Connected to RPC")
            setActivity()

            setInterval(() => {
                setActivity()
            }, 15000)
        })

        rpc.login({ clientId }).catch(console.error)
    }
    stopRPC() {
        this.rpc.clearActivity()
        this.rpc.destroy()
    }
}

export class BotCordVoice {
    client: Client
    connection: VoiceConnection
    members: string[] = []
    private VSUCallback: (oldState: VoiceState, newState: VoiceState) => void;

    constructor(client: BotCordClient, guildId: string, channelId: string) {
        this.client = client

        const guild = this.client.guilds.cache.get(guildId)!
        const channel = guild.channels.cache.get(channelId) as VoiceChannel

        this.connection = joinVoiceChannel({
            guildId,
            channelId,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: false
        })

        ipcMain.on("audioInputStream", (e, data: ArrayBuffer) => {
            const player = createAudioPlayer()
        
            const resource = createAudioResource(new Blob([data]).stream())
            
            player.play(resource)
            this.connection.subscribe(player)
        
            console.log(data)
        })

        this.connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
            try {
                await Promise.race([
                    entersState(this.connection, VoiceConnectionStatus.Signalling, 5000),
                    entersState(this.connection, VoiceConnectionStatus.Connecting, 5000),
                ])
            } catch (error) {
                this.connection.destroy()
            }
        })

        this.VSUCallback = (oldState, newState) => {
            //? joined channel
            if (!oldState.channel && newState.channel) {
                this.connectMember(newState.member!)
            } else if (oldState.channel && newState.channel) {
                this.disconnectMember(newState.member!)
            }
        }

        this.client.on("voiceStateUpdate", this.VSUCallback)

        for (const [_, member] of channel.members) {
            this.connectMember(member)
        }
    }

    destroy() {
        this.client.off("voiceStateUpdate", this.VSUCallback)
    }

    private connectMember(member: GuildMember) {
        if (this.members.includes(member.id)) return;
        this.members.push(member.id)

        const listenStream = this.connection.receiver.subscribe(member.id, {
            end: {
                behavior: EndBehaviorType.Manual
            }
        })

        const opusDecoder = new prism.opus.Decoder({
            frameSize: 960,
            channels: 2,
            rate: 48000,
        })

        const speaker = new Speaker({
            channels: 2,
            sampleRate: 48000
        })
        
        /** @ts-ignore */
        listenStream.pipe(opusDecoder).pipe(speaker)
    }

    private disconnectMember(member: GuildMember) {
        if (!this.members.includes(member.id)) return;
        this.members.splice(this.members.findIndex((id => id == member.id)), 1)
    }
}

// ipcMain.on("audioInputStream", (e, data: ArrayBuffer) => {
//     const player = createAudioPlayer()

//     const resource = createAudioResource(new Blob([data]).stream(), {
//         inputType: StreamType.WebmOpus,
//     })
    
//     player.play(resource)

//     console.log(data)
// })