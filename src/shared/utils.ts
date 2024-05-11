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