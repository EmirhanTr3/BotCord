import { Client, Events, GatewayIntentBits, Partials } from "discord.js"
import * as DiscordRPC from "discord-rpc"

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
                GatewayIntentBits.MessageContent
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