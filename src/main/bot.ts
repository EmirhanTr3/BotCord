import { Client, Events, GatewayIntentBits, Partials } from "discord.js"

export class BotCordClient extends Client {
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
}