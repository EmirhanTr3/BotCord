import { parse, rules } from "discord-markdown-parser"
import DOMPurify from "dompurify"
import moment from "moment"
import { Guild } from "src/shared/types"

/** @ts-ignore */
rules.twemoji.parse = (capture) => {
    return {
        content: capture[0]
    }
}
/** @ts-ignore */
rules.emoji.parse = (capture) => {
    return {
        content: capture[0]
    }
}

function getTypeHTML(t: string, d: string) {
    // console.log("td:", t, d)
    if (!t) return {a: "", b: ""};
    switch(t) {
        case "strong": return {a: "<b>", b: "</b>"}
        case "text": return {a: "", b: ""}
        case "user": return {a: `<mention id="${d}">`, b: "</mention>"};
        case "channel": case "role": case "everyone": case "here": return {a: "<mention>", b: "</mention>"};
        case "url": return {a: `<a href=${d}>`, b: "</a>"};
        case "br": return {a: "<br>", b: ""}
        case "underline": return {a: "<u>", b: "</u>"}
        case "strikethrough": return {a: "<s>", b: "</s>"}

        default: return {a: `<${t.toLowerCase()}>`, b: `</${t.toLowerCase()}>`}
    }
}

export function parseContent(content: string, guild?: Guild) {
    const arr = (typeof content == "string") ? parse(content) : content

    let r = ""
    for (const p of arr) {
        let c;
        // console.log("p:", p)
        if (typeof p.content == "object") {
            c = parseContent(p.content, guild)
            // console.log(1, c)
        } else {
            // console.log(2, p)
            c = p
        }
        // console.log("c:", c)

        let data;
        /** @ts-ignore */
        switch(c.type) {
            case "user":
                /** @ts-ignore */
                const user = guild ? guild.members.find(m => m.id == c.id) : { name: c.id }
                /** @ts-ignore */
                data = c.id
                /** @ts-ignore */
                c.content = "@" + (user?.name ?? "unknown-user")
                break

            case "channel":
                /** @ts-ignore */
                const channel = guild ? guild.channels.find(ch => ch.id == c.id) : { name: c.id }
                /** @ts-ignore */
                c.content = "# " + (channel?.name ?? "unknown-channel")
                break

            case "role":
                /** @ts-ignore */
                const role = guild ? guild.roles.find(ch => ch.id == c.id) : { name: c.id }
                /** @ts-ignore */
                c.content = "@" + role.name
                break

            /** @ts-ignore */
            case "everyone": case "here": c.content = "@" + c.type; break

            case "br":
                /** @ts-ignore */
                c.content = ""
                break
            
            case "timestamp":
                /** @ts-ignore */
                c.content = moment(c.timestamp * 1000).calendar()
                break
        }

        /** @ts-ignore */
        if (c.type == "url" || p.type == "url") data = c.target ?? p.target 

        let type;
        if (typeof p.content == "object") {
            type = getTypeHTML(p.type, data)
        } else {
            /** @ts-ignore */
            type = getTypeHTML(c.type, data)
        }
        
        // console.log("c: ", c)
        // console.log("type: ", type)
        // console.log(`${type.a + DOMPurify.sanitize(c.content ?? c) + type.b}`)
        /** @ts-ignore */
        r = r + type.a + DOMPurify.sanitize(c.content ?? c) + type.b
    }
    // console.log("r:", r)
    return r
}