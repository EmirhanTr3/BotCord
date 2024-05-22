export function getAsset(path: string) {
    return new URL(`../../assets/${path}`, import.meta.url).href
}

export function getChannelIcon(type: number): string {
    let path = "text.png"
    switch (type) {
        // GuildText: 0,
        //! DM: 1,
        //* GuildVoice: 2,
        //! GroupDM: 3,
        // GuildCategory: 4,
        // GuildAnnouncement: 5,
        //! AnnouncementThread: 10,
        //! PublicThread: 11,
        //! PrivateThread: 12,
        //* GuildStageVoice: 13,
        //! GuildDirectory: 14,
        //* GuildForum: 15,
        //* GuildMedia: 16,

        case 2: // voice
            path = "voice.png"
            break
        case 4: // category
            path = "category.png"
            break
        case 5: // announcement
            path = "announcement.png"
            break
        case 13: // stage
            path = "stage.png"
            break
        case 15: // forum
            path = "forum.png"
            break
        case 16: // media
            path = "media.png"
            break
    }
    return getAsset(`channel/${path}`)
}

type Badges = {
    [key: string]: {name: string, icon: string}
}

const badges: Badges = {
    BotCordStaff: {name: "BotCord Staff", icon: getAsset("icon.png")},
    Staff: {name: "Discord Staff", icon: "https://cdn.discordapp.com/badge-icons/5e74e9b61934fc1f67c65515d1f7e60d.png"},
    Partner: {name: "Partnered Server Owner", icon: "https://cdn.discordapp.com/badge-icons/3f9748e53446a137a052f3454e2de41e.png"},
    Hypesquad: {name: "HypeSquad Events", icon: "https://cdn.discordapp.com/badge-icons/bf01d1073931f921909045f3a39fd264.png"},
    BugHunterLevel1: {name: "Discord Bug Hunter", icon: "https://cdn.discordapp.com/badge-icons/2717692c7dca7289b35297368a940dd0.png"},
    BugHunterLevel2: {name: "Discord Bug Hunter", icon: "https://cdn.discordapp.com/badge-icons/848f79194d4be5ff5f81505cbd0ce1e6.png"},
    // MFASMS: "",
    // PremiumPromoDismissed: "",
    HypeSquadOnlineHouse1: {name: "HypeSquad Bravery", icon: "https://cdn.discordapp.com/badge-icons/8a88d63823d8a71cd5e390baa45efa02.png"},
    HypeSquadOnlineHouse2: {name: "HypeSquad Brilliance", icon: "https://cdn.discordapp.com/badge-icons/011940fd013da3f7fb926e4a1cd2e618.png"},
    HypeSquadOnlineHouse3: {name: "HypeSquad Balance", icon: "https://cdn.discordapp.com/badge-icons/3aa41de486fa12454c3761e8e223442e.png"},
    PremiumEarlySupporter: {name: "Early Supporter", icon: "https://cdn.discordapp.com/badge-icons/7060786766c9c840eb3019e725d2b358.png"},
    // TeamPseudoUser: "",
    // HasUnreadUrgentMessages: "",
    // VerifiedBot: "",
    VerifiedDeveloper: {name: "Early Verified Bot Developer", icon: "https://cdn.discordapp.com/badge-icons/6df5892e0f35b051f8b61eace34f4967.png"},
    CertifiedModerator: {name: "Moderator Program Alumni", icon: "https://cdn.discordapp.com/badge-icons/fee1624003e2fee35cb398e125dc479b.png"},
    // BotHTTPInteractions: "",
    // Spammer: "",
    // DisablePremium: "",
    ActiveDeveloper: {name: "Active Developer", icon: "https://cdn.discordapp.com/badge-icons/6bdc42827a38498929a4920da12695d9.png"},
    // Quarantined: "",
    // Collaborator: "",
    // RestrictedCollaborator: ""
    Nitro: {name: "Nitro Subscriber", icon: "https://cdn.discordapp.com/badge-icons/2ba85e8026a8614b640c2837bcdfe21b.png"},
}

export function getBadge(badge: string) {
    const badgeInfo = badges[badge]
    if (!badgeInfo) return
    return {
        name: badgeInfo.name || badge,
        icon: badgeInfo.icon
    }
}