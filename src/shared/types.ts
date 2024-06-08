import { APIEmbed, Attachment, Collection, Embed, PresenceStatus, UserFlags } from "discord.js"

export type BotCordUserFlags = keyof typeof UserFlags | "BotCordStaff" | "Nitro"

export type UserStatus = PresenceStatus

export type Member = {
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
    status: UserStatus,
    createdAt: string,
    lastFetched: number,
    highestRole?: Role,
    hoistRole?: Role,
    isOwner?: boolean,
    joinedAt?: string,
    guild?: BasicGuild
}

export type MemberNone = {
    lastFetched: number
}

export type BasicGuild = {
    id: string,
    name: string,
    icon: string | null
}

export type Guild = {
    id: string,
    name: string,
    icon: string | null,
    channels: Channel[],
    members: Member[],
    roles: Role[],
    everyone?: Role
}

export type Channel = {
    id: string,
    name: string,
    type: number,
    parent?: Channel,
    guildId: string
}

export type Role = {
    name: string,
    id: string,
    color: string,
    position: number,
    hoist: boolean,
    isEveryone: boolean,
    memberCount: number
}

export type Message = {
    id: string,
    content: string,
    author: Member,
    embeds?: {data: Readonly<APIEmbed>}[],
    createdAt: string,
    reference?: Message,
    attachments?: Attachment[],
    channelId: string,
    editedTimestamp: number | null,
    interaction?: MessageInteraction
}

export type MessageInteraction = {
    type: number,
    id: string,
    commandName: string,
    member: Member
}