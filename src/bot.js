const { Client, Events, GatewayIntentBits, Partials } = require("discord.js")

class LemonsClient extends Client {
    constructor(options) {
        super(options)
    }
    async start(token) {
        await this.login(token)
        return this
    }
    
}
const client = new LemonsClient({
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

client.on(Events.ClientReady, (client) => {
    console.log(`Logged into ${client.user.tag}`)
})

module.exports = {
    client
}