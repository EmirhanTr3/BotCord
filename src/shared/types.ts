import { Attachment, Collection, Embed, PresenceStatus, UserFlags } from "discord.js"

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
    joinedAt?: string
}

export type MemberNone = {
    lastFetched: number
}

export type Guild = {
    id: string,
    name: string,
    icon: string | undefined | null,
    channels: Channel[],
    members: Member[],
    roles: Role[],
    everyone?: Role
}

export type Channel = {
    id: string,
    name: string,
    type: number,
    parent?: Channel
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
    embeds?: Embed[],
    createdAt: string,
    reference?: Message,
    attachments?: Collection<string, Attachment>
}

// export type Embed = {
//     title?: string,
//     description?: string,
//     url?: string,
//     timestamp?: string,
//     color?: number,
//     footer?: {
//         text: string,
//         icon_url?: string
//     },
//     image?: {
//         url: string
//     },
//     thumbnail?: {
//         url: string
//     },
//     author?: {
//         name: string,
//         url?: string,
//         icon_url?: string
//     },
//     fields?: {
//         name: string,
//         value: string,
//         inline?: boolean
//     }[],
// }

// export type Attachment = {
//     id: string,
//     filename: string,
//     description?: string,
//     content_type?: string,
//     size: number,
//     url: string
// }