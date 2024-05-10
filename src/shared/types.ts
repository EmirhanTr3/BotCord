import { PresenceStatus, UserFlags } from "discord.js"

export type BotCordUserFlags = keyof typeof UserFlags | "BotCordStaff" | "Nitro"

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
    status: PresenceStatus,
    createdAt: string,
    lastFetched: number,

    highestRole?: {
        name: string,
        id: string,
        hoist: boolean
    },
    hoistRole?: {
        name?: string,
        id?: string
    },
    isOwner?: boolean,
    joinedAt?: string
}

export type MemberNone = {
    lastFetched: number
}

export type Guild = {
    id: string,
    name: string,
    icon: string
}