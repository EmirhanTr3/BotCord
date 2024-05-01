/// <reference path="utils.d.ts"/>

const { ipcRenderer } = require("electron");

ipcRenderer.on("load", async (_, user, noLoading) => {
    const startedLoading = new Date()
    console.log("got load event")
    console.log(user)
    window.client = user
    //! immediately delete the loading screen if its a reload
    if (noLoading) document.getElementById("loadingscreen").remove()

    //! set bot user info
    document.querySelector("#user #pfp").src = await ipcRenderer.invoke("client-avatar")
    document.getElementById("username").innerText = `${user.username}#${user.discriminator}`
    document.getElementById("user").addEventListener("click", async (e) => await openUserModalAtCursor(e, user))

    await displayGuildList()
    await displayChannelList()
    await displayMemberList()
    await displayChatMessages()

    //! add click listener to settings
    document.getElementById("settingsbutton").addEventListener("click", async () => {
        const settingsHTML = await (await fetch("../settings/settings.html")).text()
        const settingsDiv = document.createElement("div")
        settingsDiv.id = "settings"
        settingsDiv.innerHTML = settingsHTML
        document.body.appendChild(settingsDiv)
        settingsOpened()
    })
    
    //! register a body click event
    function remove(e, t) {
        if (
            document.getElementById(e) &&
            !document.getElementById(e).contains(t)
        ){
            document.getElementById(e).remove()
        }
    }
    document.addEventListener("click", async (e) => {
        remove("usermodal", e.target)
        remove("autocomplete", e.target)
        remove("contextmenu", e.target)

        //! handle user mention click
        if (e.target.nodeName == "MENTION") {
            if (!e.target.id) return;
            const user = await ipcRenderer.invoke("getUser", e.target.id)
            await openUserModalAtCursor(e, user)
        }
    })

    //! after everything is done delete loading div
    if (!noLoading) document.getElementById("loadingscreen").remove()
    console.warn(`loaded the whole fucking page in ${new Date() - startedLoading}ms`)
})

//! display guild list
async function displayGuildList() {
    const guilds = await ipcRenderer.invoke("guilds")
    console.log(guilds)
    const guildsDiv = document.getElementById("guildList")
    guildsDiv.replaceChildren()
    

    guilds.forEach(guild => {
        const guildImg = document.createElement("img")
        guildImg.id = "pfp"
        guildImg.height = 48
        guildImg.width = 48
        guildImg.src = guild.icon
        console.log(`appending guild ${guild.name} (${guild.id}) to guild list`)
        guildsDiv.appendChild(guildImg)

        guildImg.addEventListener("click", async () => {
            console.log(`clicked on server ${guild.name} (${guild.id})`)
            if ((await ipcRenderer.invoke("switchGuild", guild.id)) == false) return
            displayChannelList()
            displayMemberList()
            displayChatMessages()
        })

        createHoverText(guildImg, guild.name)
    })
}

//! display channel list
async function displayChannelList() {
    const currentGuild = await ipcRenderer.invoke("currentGuild")
    console.log(currentGuild)
    const currentChannel = await ipcRenderer.invoke("currentChannel")
    const channels = await ipcRenderer.invoke("channels")
    console.log(channels)

    const guildnameElement = document.getElementById("guildname")
    document.getElementById("guildname").innerText = currentGuild.name
    //! this has a bug where the hover text event stays even after switching servers
    // if (guildnameElement.offsetWidth < guildnameElement.scrollWidth) createHoverText(guildnameElement, currentGuild.name)

    const channelsDiv = document.getElementById("channels")
    channelsDiv.replaceChildren()

    channels.filter(c => c.type != 4 && !c.category.id).forEach(appendChannel)

    channels.filter(c => c.type == 4).forEach(category => {
        const categoryDiv = document.createElement("div")
        categoryDiv.id = "category"
        categoryDiv.className = `category-${category.id}`

        const iconImg = document.createElement("img")
        iconImg.id = "icon"
        iconImg.className = "category"
        iconImg.height = 18
        iconImg.width = 18
        iconImg.src = getChannelIconPath(category.type)

        const categoryName = document.createElement("p")
        categoryName.id = "categoryname"
        categoryName.innerText = category.name.toUpperCase()

        console.log(`appending category ${category.name} (${category.id}) to channel list`)
        categoryDiv.appendChild(iconImg)
        categoryDiv.appendChild(categoryName)
        channelsDiv.appendChild(categoryDiv)
        if (categoryName.offsetWidth < categoryName.scrollWidth) createHoverText(categoryName, category.name)
    })

    channels.filter(c => c.type != 4 && c.category.id).forEach(appendChannel)

    function appendChannel(channel) {
        const channelDiv = document.createElement("div")
        channelDiv.id = "channel"
        channelDiv.className = "hover"
        if (channel.id == currentChannel.id) channelDiv.classList.add("current")

        const iconImg = document.createElement("img")
        iconImg.id = "icon"
        iconImg.height = 20
        iconImg.width = 20
        iconImg.src = getChannelIconPath(channel.type)

        const channelName = document.createElement("p")
        channelName.id = "channelname"
        channelName.innerText = channel.name

        console.log(`appending channel [${channel.type}] ${channel.name} (${channel.id}) to channel list`)
        channelDiv.appendChild(iconImg)
        channelDiv.appendChild(channelName)
        if (channel.category.id) document.getElementsByClassName(`category-${channel.category.id}`).item(0).appendChild(channelDiv)
        else channelsDiv.appendChild(channelDiv)
        if (channelName.offsetWidth < channelName.scrollWidth) createHoverText(channelName, channel.name)

        channelDiv.addEventListener("click", async () => {
            if ([0, 2, 5].includes(channel.type)) {
                console.log(`clicked on channel ${channel.name} (${channel.id})`)
                if ((await ipcRenderer.invoke("switchChannel", channel.id)) == false) return
                
                document.querySelector("#chat #messages").replaceChildren()
                document.querySelector("#chat #channelInfo p").innerText = channel.name
                document.querySelector("#chat #channelInfo #icon").src = iconImg.src
                if (document.getElementById("reply")) document.getElementById("reply").remove()

                for (const c of document.getElementsByClassName("current")) c.classList.remove("current")
                channelDiv.classList.add("current")

                displayChatMessages()
            } else if (channel.type != 4) {
                showMessageBox(`Unsupported channel type (${channel.type})`, "The channel you have just tried to view is currently not supported.")
            }
        })
    }
}

//! get channel icon path
function getChannelIconPath(type) {
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
    return "../../assets/channel/" + path
}

//! display member list
async function displayMemberList() {
    const startedLoading = new Date()

    const startedLoading1 = new Date()
    const members = await ipcRenderer.invoke("members")
    console.warn(`loaded members in ${new Date() - startedLoading1}ms`)

    const startedLoading2 = new Date()
    const roles = await ipcRenderer.invoke("memberRoleList")
    console.warn(`got member role list in ${new Date() - startedLoading2}ms`)

    const membersDiv = document.getElementById("members")
    membersDiv.replaceChildren()
    
    const startedLoadingRoles = new Date()

    roles.filter(r => r.memberSize > 0 || r.isEveryone).forEach(role => {
        const roleDiv = document.createElement("div")
        roleDiv.id = "role"
        roleDiv.className = role.isEveryone ? "role-everyone" : `role-${role.id}`
        
        const name = document.createElement("p")
        name.id = "name"
        name.innerText = role.isEveryone ? role.name : `${role.name} — ${role.memberSize}`

        roleDiv.appendChild(name)
        membersDiv.appendChild(roleDiv)
    })
    console.warn(`loaded member list roles in ${new Date() - startedLoadingRoles}ms`)

    const startedLoadingMembers = new Date()

    members.sort((a, b) => a.displayName.localeCompare(b.displayName)).forEach(member => {
        const memberDiv = document.createElement("div")
        memberDiv.id = "member"
        memberDiv.className = "hover"

        const pfp = document.createElement("img")
        pfp.id = "pfp"
        pfp.height = 32
        pfp.width = 32
        pfp.src = member.avatar

        let status
        if (!member.badges.includes("BotHTTPInteractions")) {
            status = document.createElement("img")
            status.id = "userstatus"
            status.height = 10
            status.width = 10
            const statusData = getStatusData(member.status)
            status.src = statusData.icon
            createHoverText(status, statusData.name)
            if (member.status == "offline") memberDiv.classList.add("offline")
        }

        const memberName = document.createElement("p")
        memberName.id = "username"
        const name = member.displayName
        memberName.innerText = (name.length < 20) ? name : (name.substring(0, 20) + "...")
        memberName.style.color = member.displayColor

        let ownercrown
        if (member.isOwner) {
            ownercrown = new DOMParser().parseFromString("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"15\" height=\"15\" fill=\"#f0b132\" viewBox=\"0 0 24 24\"><path d=\"M5 18a1 1 0 0 0-1 1 3 3 0 0 0 3 3h10a3 3 0 0 0 3-3 1 1 0 0 0-1-1zM3.04 7.76a1 1 0 0 0-1.52 1.15l2.25 6.42a1 1 0 0 0 .94.67h14.55a1 1 0 0 0 .95-.71l1.94-6.45a1 1 0 0 0-1.55-1.1l-4.11 3-3.55-5.33.82-.82a.83.83 0 0 0 0-1.18l-1.17-1.17a.83.83 0 0 0-1.18 0l-1.17 1.17a.83.83 0 0 0 0 1.18l.82.82-3.61 5.42z\"></path></svg>", "image/svg+xml").documentElement
            ownercrown.id = "ownercrown"
            createHoverText(ownercrown, "Server Owner")
        }

        console.log(`appending member ${member.name} (${member.id}) to member list`)
        memberDiv.appendChild(pfp)
        if (status) memberDiv.appendChild(status)
        memberDiv.appendChild(memberName)
        if (ownercrown) memberDiv.appendChild(ownercrown)
        appendBotBadge(memberDiv, member)

        if (member.hoistRole.id) document.getElementsByClassName(`role-${member.hoistRole.id}`).item(0).appendChild(memberDiv)
        else document.getElementsByClassName("role-everyone").item(0).appendChild(memberDiv)

        memberDiv.addEventListener("click", async (e) => await openUserModalAtCursor(e, member))

        // membersDiv.appendChild(memberDiv)
        // <div id="member"><img id="icon" height="32px" width="32px" src="icon.png"><p>Username</p></div>
    })
    console.warn(`loaded member list members in ${new Date() - startedLoadingMembers}ms`)
    console.warn(`loaded member list in ${new Date() - startedLoading}ms`)
}

//! chat input
var lastTypingSentAt;
document.querySelector("#chat form").addEventListener("submit", async (e) => {
    e.preventDefault()
    const input = document.querySelector("#chat #chatinput")
    const message = input.value

    if (message.replaceAll(" ", "") == "") return;

    const replyDiv = document.querySelector("#chat #reply")
    let reply;
    if (replyDiv) {
        reply = replyDiv.getAttribute("messageid")
        replyDiv.remove()
    }

    ipcRenderer.send("message", message, reply)
    input.value = ""
    lastTypingSentAt = undefined
})

var lastAutoCompleteCheck;
document.querySelector("#chat form").addEventListener("input", (e) => {
    const message = document.querySelector("#chat #chatinput").value

    if (!lastAutoCompleteCheck || new Date() - lastAutoCompleteCheck > 500) {
        if (/@(?:[^ ]+)?$/g.test(message)) checkMemberAutoComplete(e, message)
        else if (/#(?:[^ ]+)?$/g.test(message)) checkChannelAutoComplete(e, message)
        else if (document.getElementById("autocomplete")) document.getElementById("autocomplete").remove()
        lastAutoCompleteCheck = new Date()
    }

    if (
        (
            !lastTypingSentAt ||
            new Date() - lastTypingSentAt > 10_000
        ) &&
        !message.replaceAll(" ", "") == ""
    ) {
        lastTypingSentAt = new Date()
        ipcRenderer.send("typing")
        if (document.getElementById("autocomplete")) document.getElementById("autocomplete").remove()
    }
})

/** @param {string} message */
async function checkMemberAutoComplete(e, message){
    const filter = message.replace(/.*@(.*)/g, "$1")

    const memberList = (await ipcRenderer.invoke("members")).filter(m => m.displayName.toLowerCase().includes(filter.toLowerCase()) || m.username.toLowerCase().includes(filter.toLowerCase()))
    if (memberList.length < 1) {
        if (document.getElementById("autocomplete")) document.getElementById("autocomplete").remove()
        return;
    }

    const chat = document.getElementById("chat")

    const autoComplete = document.createElement("div")
    autoComplete.id = "autocomplete"

    const content = document.createElement("div")
    content.id = "content"

    const title = document.createElement("p")
    title.id = "title"
    title.innerText = "MEMBERS"

    const members = document.createElement("div")
    members.id = "list"

    memberList.sort((a, b) => a.displayName.localeCompare(b.displayName)).forEach(member => {
        const memberDiv = document.createElement("div")
        memberDiv.id = "member"
        memberDiv.className = "hover"

        const pfp = document.createElement("img")
        pfp.id = "pfp"
        pfp.height = 24
        pfp.width = 24
        pfp.src = member.avatar

        let status
        if (!member.badges.includes("BotHTTPInteractions")) {
            status = document.createElement("img")
            status.id = "userstatus"
            status.height = 8
            status.width = 8
            const statusData = getStatusData(member.status)
            status.src = statusData.icon
            createHoverText(status, statusData.name)
        }

        const memberName = document.createElement("p")
        memberName.id = "displayname"
        memberName.innerText = member.displayName

        const username = document.createElement("p")
        username.id = "username"
        username.innerText = member.name

        memberDiv.appendChild(pfp)
        if (status) memberDiv.appendChild(status)
        memberDiv.appendChild(memberName)
        memberDiv.appendChild(username)
        members.appendChild(memberDiv)

        memberDiv.addEventListener("click", async (e) => {
            if (document.getElementById("autocomplete")) document.getElementById("autocomplete").remove()
            const split = message.split("@" + filter)
            const last = split[split.length - 1]
            split.pop()
            const input = document.querySelector("#chat #chatinput")
            input.value = split.join("@" + filter) + `<@${member.id}>` + last + " "
            input.focus()
        })

    })

    content.appendChild(title)
    content.appendChild(members)
    autoComplete.appendChild(content)
    if (document.getElementById("autocomplete")) document.getElementById("autocomplete").remove()
    chat.appendChild(autoComplete)
}

/** @param {string} message */
async function checkChannelAutoComplete(e, message){
    const filter = message.replace(/.*#(.*)/g, "$1")

    const channelList = (await ipcRenderer.invoke("channels")).filter(c => [0, 5].includes(c.type) && (c.name.toLowerCase().includes(filter.toLowerCase()) || c.name.toLowerCase().includes(filter.toLowerCase())))
    if (channelList.length < 1) {
        if (document.getElementById("autocomplete")) document.getElementById("autocomplete").remove()
        return;
    }

    const chat = document.getElementById("chat")

    const autoComplete = document.createElement("div")
    autoComplete.id = "autocomplete"

    const content = document.createElement("div")
    content.id = "content"

    const title = document.createElement("p")
    title.id = "title"
    title.innerText = "TEXT CHANNELS"

    const channels = document.createElement("div")
    channels.id = "list"
    channels.className = "channels"

    channelList.forEach(channel => {
        const channelDiv = document.createElement("div")
        channelDiv.id = "member"
        channelDiv.className = "hover"

        const pfp = document.createElement("img")
        pfp.id = "pfp"
        pfp.height = 20
        pfp.width = 20
        pfp.src = getChannelIconPath(channel.type)

        const channelName = document.createElement("p")
        channelName.id = "displayname"
        channelName.innerText = channel.name

        let categoryName;
        if (channel.category.name) {
            categoryName = document.createElement("p")
            categoryName.id = "username"
            categoryName.innerText = channel.category.name
        }

        channelDiv.appendChild(pfp)
        channelDiv.appendChild(channelName)
        if (categoryName) channelDiv.appendChild(categoryName)
        channels.appendChild(channelDiv)

        channelDiv.addEventListener("click", async (e) => {
            if (document.getElementById("autocomplete")) document.getElementById("autocomplete").remove()
            const split = message.split("#" + filter)
            const last = split[split.length - 1]
            split.pop()
            const input = document.querySelector("#chat #chatinput")
            input.value = split.join("#" + filter) + `<#${channel.id}>` + last + " "
            input.focus()
        })

    })

    content.appendChild(title)
    content.appendChild(channels)
    autoComplete.appendChild(content)
    if (document.getElementById("autocomplete")) document.getElementById("autocomplete").remove()
    chat.appendChild(autoComplete)
}

//! messages
async function createMessageDiv(message) {
    const messageDiv = document.createElement("div")
    messageDiv.id = "message"
    messageDiv.classList.add("hover", `message-${message.id}`)
    messageDiv.setAttribute("userid", message.author.id)

    let extradata;
    if (message.interaction || message.referenceMessage) {
        extradata = document.createElement("div")
        extradata.id = "extradata"
        extradata.classList.add("interaction")
        
        const user = (message.interaction) ? await ipcRenderer.invoke("getUser", message.interaction.user.id) : message.referenceMessage.modifiedMember

        const line = document.createElement("div")
        line.id = "line"

        const pfp = document.createElement("img")
        pfp.id = "pfp"
        pfp.height = 16
        pfp.width = 16
        pfp.src = user.avatar
        pfp.addEventListener("click", async (e) => await openUserModalAtCursor(e, user))

        const username = document.createElement("p")
        username.id = "username"
        username.innerText = user.displayName
        username.style.color = user.displayColor
        username.addEventListener("click", async (e) => await openUserModalAtCursor(e, user))

        extradata.replaceChildren(line, pfp, username)

        if (message.interaction) {
            const p1 = document.createElement("p")
            p1.innerText = "used "

            const command = document.createElement("p")
            command.id = "command"
            command.innerText = "/" + message.interaction.commandName
            extradata.appendChild(p1)
            extradata.appendChild(command)

        } else if (message.referenceMessage) {
            const replyDiv = document.querySelector("#chat #messages").getElementsByClassName(`message-${message.referenceMessage.id}`).item(0)
            
            const reply = document.createElement("p")
            reply.id = "referencecontent"
            if (message.referenceMessage.content.length > 0) reply.innerText = message.referenceMessage.content
            else {
                reply.innerText = (replyDiv) ? "Click to view message" : "Unknown message"
                reply.classList.add("italic")
            }
            extradata.appendChild(reply)

            if (replyDiv) {
                reply.addEventListener("click", () => {
                    replyDiv.scrollIntoView({behavior: "smooth"})
                })
            }
        }

    }

    const messageContent = document.createElement("div")
    messageContent.id = "messagecontent"

    const pfp = document.createElement("img")
    pfp.id = "pfp"
    pfp.height = 42
    pfp.width = 42
    pfp.src = message.avatar
    pfp.addEventListener("click", async (e) => await openUserModalAtCursor(e, message.modifiedMember))

    const content = document.createElement("div")
    content.id = "content"
    
    const usernameandtime = document.createElement("div")

    const username = document.createElement("p")
    username.id = "username"
    username.innerText = message.authorDisplayName
    username.style.color = message.authorDisplayColor
    username.addEventListener("click", async (e) => await openUserModalAtCursor(e, message.modifiedMember))

    const time = document.createElement("p")
    time.id = "time"
    time.innerText = message.time

    const msg = document.createElement("p")
    msg.id = "msg"

    if (message.content) {
        const msgcontent = document.createElement("p")
        msgcontent.id = "msgcontent"
        msgcontent.innerHTML = await parseContent(message.content)
        msg.appendChild(msgcontent)
    }

    let embeds;
    message.embeds.forEach(async embed => {
        if (!embeds) {
            embeds = document.createElement("div")
            embeds.id = "embeds"
            msg.appendChild(embeds)
        }
        const data = embed.data

        const embedDiv = document.createElement("div")
        embedDiv.id = "embed"

        const content = document.createElement("div")
        content.id = "embedcontent"

        const contentData = document.createElement("div")
        contentData.id = "embedcontentdata"

        const contentDataContent = document.createElement("div")
        contentDataContent.id = "embedcontentdatacontent"

        const color = document.createElement("div")
        color.id = "color"
        color.style.background = "#" + (data.color ? data.color.toString(16).padStart(6, '0') : "101010")

        let author;
        if (data.author) {
            author = document.createElement("div")
            author.id = "author"

            if (data.author.icon_url) {
                const authorIcon  = document.createElement("img")
                authorIcon.id = "authoricon"
                authorIcon.src = data.author.icon_url
                author.appendChild(authorIcon)
            }

            const authorName = document.createElement(data.author.url ? "a" : "p")
            authorName.id = "authorname"
            authorName.innerText = data.author.name
            authorName.href = data.author.url
            author.appendChild(authorName)
        }

        let title;
        if (data.title) {
            title = document.createElement(data.url ? "a" : "p")
            title.id = "title"
            title.innerText = data.title
            title.href = data.url
        }

        let description
        if (data.description) {
            description = document.createElement("p")
            description.id = "description"
            description.innerHTML = await parseContent(data.description)
        }

        let fields
        if (data.fields) {
            fields = document.createElement("div")
            fields.id = "fields"
            
            for (const field of data.fields) {
                const fieldDiv = document.createElement("div")
                fieldDiv.id = "field"
                
                const fieldName = document.createElement("p")
                fieldName.id = "fieldname"
                fieldName.innerText = field.name

                const fieldValue = document.createElement("p")
                fieldValue.id = "fieldvalue"
                fieldValue.innerHTML = await parseContent(field.value)

                fieldDiv.replaceChildren(fieldName, fieldValue)
                fields.appendChild(fieldDiv)
            }
        }

        let thumbnail
        if (data.thumbnail) {
            thumbnail = document.createElement("img")
            thumbnail.id = "thumbnail"
            thumbnail.src = data.thumbnail.url
        }

        let image
        if (data.image) {
            image = document.createElement("img")
            image.id = "image"
            image.src = data.image.url
        }

        let footer;
        if (data.footer) {
            footer = document.createElement("div")
            footer.id = "footer"

            if (data.footer.icon_url) {
                const footerIcon  = document.createElement("img")
                footerIcon.id = "footericon"
                footerIcon.src = data.footer.icon_url
                footer.appendChild(footerIcon)
            }

            const footerText = document.createElement("p")
            footerText.id = "footertext"
            footerText.innerText = data.footer.text
            footer.appendChild(footerText)

            embedDiv.appendChild(footer)
        }

        if (author) contentDataContent.appendChild(author)
        if (title) contentDataContent.appendChild(title)
        if (description) contentDataContent.appendChild(description)
        if (fields) contentDataContent.appendChild(fields)
        contentData.appendChild(contentDataContent)
        if (thumbnail) contentData.appendChild(thumbnail)
        content.appendChild(contentData)
        if (image) content.appendChild(image)
        if (footer) content.appendChild(footer)
        embedDiv.replaceChildren(color, content)
        embeds.appendChild(embedDiv)
    })

    let attachments;
    function createAttachmentsDiv() {
        if (!attachments) {
            const div = document.createElement("div")
            div.id = "attachments"
            attachments = div
            msg.appendChild(div)
        }
    }

    Array.from(msg.getElementsByTagName("a")).forEach(async element => {
        if (element.id) return;
        if (!(await fetch(element.href)).ok) return;
        createAttachmentsDiv()
        if (/https:\/\/cdn.discordapp.com\/attachments\/(?:[0-9]{17,19})\/(?:[0-9]{17,19})\/.*.png\?.*/g.test(element.href)) {
            const p = document.createElement("p")
            p.innerHTML = "<mention>File: " + element.href.replace(/https:\/\/cdn.discordapp.com\/attachments\/(?:[0-9]{17,19})\/(?:[0-9]{17,19})\/(.*.png)\?.*/g, "$1") + "</mention>"
            element.outerHTML = p.outerHTML

            const img = document.createElement("img")
            img.src = element.href
            attachments.appendChild(img)

        } else if (/https:\/\/cdn.discordapp.com\/attachments\/(?:[0-9]{17,19})\/(?:[0-9]{17,19})\/.*.mp4\?.*/g.test(element.href)) {
            const p = document.createElement("p")
            p.innerHTML = "<mention>File: " + element.href.replace(/https:\/\/cdn.discordapp.com\/attachments\/(?:[0-9]{17,19})\/(?:[0-9]{17,19})\/(.*.mp4)\?.*/g, "$1") + "</mention>"
            element.outerHTML = p.outerHTML

            const video = document.createElement("video")
            video.src = element.href
            video.type = "video/mp4"
            video.controls = true
            attachments.appendChild(video)
        }
    })

    message.attachments.forEach(async attachment => {
        createAttachmentsDiv()
        if (attachment.contentType?.startsWith("image")) {
            const img = document.createElement("img")
            img.src = attachment.url
            attachments.appendChild(img)
            
        } else if (attachment.contentType?.startsWith("videoe")) {
            const video = document.createElement("video")
            video.src = attachment.url
            video.type = "video/mp4"
            video.controls = true
            attachments.appendChild(video)
        } else {
            const file = document.createElement("div")
            file.id = "file"
            file.url = attachment.url

            const fileIcon = new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="#ebebeb" viewBox="0 0 256 256"><path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM152,88V44l44,44Z"></path></svg>', "image/svg+xml").documentElement
            
            const info = document.createElement("div")
            info.id = "info"

            const fileName = document.createElement("p")
            fileName.id = "name"
            fileName.innerText = attachment.name

            const fileSize = document.createElement("p")
            fileSize.id = "size"
            fileSize.innerText = `${attachment.size} bytes`

            const download = new DOMParser().parseFromString('<svg id="download" class="hover" xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="#ebebeb" viewBox="0 0 256 256"><path d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40A8,8,0,0,0,168,96H136V32a8,8,0,0,0-16,0V96H88a8,8,0,0,0-5.66,13.66Z"></path></svg>', "image/svg+xml").documentElement
            createHoverText(download, "Download")

            download.addEventListener("click", async (e) => {
                console.log("trying to download file:", attachment.name)
                const download = await ipcRenderer.invoke("downloadAttachment", attachment)
                console.log(download)
                if (download.status == "canceled") return showToast("warn", "Cancelled attachment download.")
                if (download.status == "success") return showToast("success", `Downloaded attachment named '${attachment.name}' as '${download.fileName}'!`)
            })

            info.replaceChildren(fileName, fileSize)
            file.replaceChildren(fileIcon, info, download)
            attachments.appendChild(file)
        }
    })

    const messagesDiv = document.querySelector("#chat #messages")
    const lastMessage = messagesDiv.lastElementChild

    let isAnotherMessage = false
    if (!extradata &&
        lastMessage &&
        lastMessage.getAttribute("userid") == message.author.id &&
        ((lastMessage.querySelector("#messagecontent").querySelector("#messagecontent #content div #username")?.innerText ?? message.author.username) == message.author.username)
    ) {
        messageDiv.classList.add("anothermessage")
        lastMessage.classList.add("hasothermessages")
        isAnotherMessage = true
    }

    if (extradata) messageDiv.appendChild(extradata)
    if (!isAnotherMessage) {
        messageContent.appendChild(pfp)
        usernameandtime.appendChild(username)
        appendBotBadge(usernameandtime, message.modifiedMember)
        usernameandtime.appendChild(time)
        content.appendChild(usernameandtime)
    }
    content.appendChild(msg)
    messageContent.appendChild(content)
    messageDiv.appendChild(messageContent)

    messageDiv.addEventListener("contextmenu", (e) => openContextMenu(e,
        {
            text: "Reply",
            callback: (e) => {
                showReplyDiv(message)
                e.close()
            }
        },
        {
            text: "Copy Text",
            callback: (e) => {
                navigator.clipboard.writeText(message.content)
                e.close()
            }
        },
        {type: "seperator"},
        {
            text: "Copy Message ID",
            callback: (e) => {
                navigator.clipboard.writeText(message.id)
                e.close()
            }
        }
    ))

    return messageDiv
}

function appendMessage(messageDiv) {
    const messagesDiv = document.querySelector("#chat #messages")
    messagesDiv.appendChild(messageDiv)
    messagesDiv.scrollTop = messagesDiv.scrollHeight - messagesDiv.clientHeight;
}

async function displayChatMessages() {
    const currentChannel = await ipcRenderer.invoke("currentChannel")
    console.log(currentChannel)
    document.querySelector("#chat #channelInfo p").innerText = currentChannel.name
    document.querySelector("#chat #channelInfo #icon").src = getChannelIconPath(currentChannel.id)
    
    const messagesDiv = document.querySelector("#chat #messages")
    messagesDiv.replaceChildren()

    const startedloadlastmessages = new Date()
    console.warn("started loading last messages")
    const lastMessages = await ipcRenderer.invoke("lastMessagesFromCurrentChannel", 30)
    console.warn(`loaded last messages in ${new Date() - startedloadlastmessages}ms`)
    console.log(lastMessages)
    for (const message of lastMessages) {
        appendMessage(await createMessageDiv(message))
    }
}

ipcRenderer.on("messageCreate", async (_, message) => {
    console.log(`received messageCreate from ${message.author.username}: ${message.content}`)
    appendMessage(await createMessageDiv(message))
})

ipcRenderer.on("messageDelete", (_, message) => {
    console.log(`received messageDelete with id ${message.id}`)
    const messageDiv = document.querySelector(`#chat #messages #message.message-${message.id}`)
    if (!messageDiv) return;
    messageDiv.classList.add("deleted")
})

// ipcRenderer.on("messageUpdate", async (_, oldMessage, newMessage) => {
//     console.log(`received messageUpdate from ${oldMessage.author.username}: ${oldMessage.content} -> ${newMessage.content}`)
//     const messageDiv = document.querySelector(`#chat #messages #message.message-${oldMessage.id}`)
//     if (!messageDiv) return;
//     console.log(messageDiv.outerHTML)
//     const newdiv = await createMessageDiv(newMessage)
//     console.log(newdiv.outerHTML)
//     messageDiv.outerHTML = newdiv.outerHTML
//     console.log(messageDiv.outerHTML)
// })

function showReplyDiv(message) {
    if (document.getElementById("reply")) document.getElementById("reply").remove()
    const chat = document.getElementById("chat")

    const reply = document.createElement("div")
    reply.id = "reply"
    reply.setAttribute("messageid", message.id)

    const textdiv = document.createElement("div")
    textdiv.id = "textdiv"

    const text = document.createElement("p")
    text.id = "text"
    text.innerText = "Replying to "

    const username = document.createElement("p")
    username.id = "username"
    username.innerText = message.modifiedMember.displayName
    username.style.color = message.modifiedMember.displayColor

    const close = new DOMParser().parseFromString('<div id="close"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#c3c3c3" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm37.66,130.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg></div>', "application/xml").documentElement

    close.addEventListener("click", (e) => {
        reply.remove()
    })

    textdiv.replaceChildren(text, username)
    reply.replaceChildren(textdiv, close)
    chat.appendChild(reply)
}

//! user modal
async function openUserModalAtCursor(event, user) {
    if (document.getElementById("usermodal")) document.getElementById("usermodal").remove()
    const userModal = await getUserModal(user)
    const userModalWidth = 340
    const userModalHeight = 500

    userModal.style.top = (
        (event.clientY + userModalHeight > document.body.clientHeight) ?
        document.body.clientHeight - (userModalHeight + 10) :
        event.clientY
        ) + "px"
    userModal.style.left = (
        (event.clientX + userModalWidth > document.body.clientWidth) ?
        document.body.clientWidth - (userModalWidth + 10) :
        event.clientX
        ) + "px"

    document.body.append(userModal)
}

async function getUserModal(user) {
    const userModal = document.createElement("div")
    userModal.id = "usermodal"

    const userBanner = await ipcRenderer.invoke("getBannerURL", user.id)
    const banner = document.createElement("img")
    banner.id = "banner"
    banner.src = userBanner || "../../assets/bannerdefault.png"

    if (!user.badges?.includes("Nitro") && !user.bot && userBanner) user.badges.push("Nitro")

    const pfp = document.createElement("img")
    pfp.id = "pfp"
    pfp.height = 80
    pfp.width = 80
    pfp.src = user.avatar ?? ""

    let status
    if (!user.badges?.includes("BotHTTPInteractions") && user.joinedAt) {
        status = document.createElement("img")
        status.id = "userstatus"
        status.height = 20
        status.width = 20
        const statusData = getStatusData(user.status)
        status.src = statusData.icon
        createHoverText(status, statusData.name)
    }

    let badges
    if (user.badges?.length > 0) {
        badges = document.createElement("div")
        badges.id = "badges"

        console.log(user.badges)
        for (const badge of user.badges) {
            if (getBadge(badge)) {
                const badgeInfo = getBadge(badge)
                const badgeImg = document.createElement("img")
                badgeImg.id = "badge"
                badgeImg.height = 22
                badgeImg.width = 22
                badgeImg.src = badgeInfo.icon
                badges.appendChild(badgeImg)

                createHoverText(badgeImg, badgeInfo.name)

            }
        }
    }
    if (badges && badges.children.length == 0) badges = undefined

    const info = document.createElement("div")
    info.id = "info"

    if (user.badges?.length > 8) {
        const y = Math.floor(user.badges.length / 8) * 20
        info.style.height = 290 - y + "px"
        info.style.top = 160 + y + "px"
    }

    const displayname = document.createElement("p")
    displayname.id = "displayname"
    displayname.innerText = user.displayName

    const username = document.createElement("p")
    username.id = "username"
    username.innerText = user.name
    
    const seperator = document.createElement("p")
    seperator.id = "seperator"

    const content = document.createElement("div")
    content.id = "content"

    const aboutmeData = (user.bot) ? await ipcRenderer.invoke("getApplicationRPC", user) : undefined
    if (aboutmeData || !user.bot) {
        const aboutme = document.createElement("div")
        aboutme.id = "aboutme"

        const aboutmeTitle = document.createElement("h1")
        aboutmeTitle.id = "title"
        aboutmeTitle.innerText = "ABOUT ME"

        const aboutmeText = document.createElement("p")
        if (user.bot) aboutmeText.innerHTML = await parseContent(aboutmeData)
        else aboutmeText.innerText = "Due to discord not allowing bots to obtain user about me information, this is not possible to add."

        aboutme.appendChild(aboutmeTitle)
        aboutme.appendChild(aboutmeText)
        content.appendChild(aboutme)
    }
    
    const membersince = document.createElement("div")
    membersince.id = "membersince"
    
    const membersinceTitle = document.createElement("h1")
    membersinceTitle.id = "title"
    membersinceTitle.innerText = "MEMBER SINCE"

    const membersinceDiscord = document.createElement("div")
    membersinceDiscord.id = "discord"

    const membersinceDiscordImg = new DOMParser().parseFromString("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"28\" height=\"28\" fill=\"#bbbbbb\" viewBox=\"0 0 24 24\"><path d=\"M19.73 4.87a18.2 18.2 0 0 0-4.6-1.44c-.21.4-.4.8-.58 1.21-1.69-.25-3.4-.25-5.1 0-.18-.41-.37-.82-.59-1.2-1.6.27-3.14.75-4.6 1.43A19.04 19.04 0 0 0 .96 17.7a18.4 18.4 0 0 0 5.63 2.87q.69-.93 1.2-1.98c-.65-.25-1.29-.55-1.9-.92.17-.12.32-.24.47-.37 3.58 1.7 7.7 1.7 11.28 0l.46.37c-.6.36-1.25.67-1.9.92.35.7.75 1.35 1.2 1.98 2.03-.63 3.94-1.6 5.64-2.87.47-4.87-.78-9.09-3.3-12.83ZM8.3 15.12c-1.1 0-2-1.02-2-2.27 0-1.24.88-2.26 2-2.26s2.02 1.02 2 2.26c0 1.25-.89 2.27-2 2.27m7.4 0c-1.1 0-2-1.02-2-2.27 0-1.24.88-2.26 2-2.26s2.02 1.02 2 2.26c0 1.25-.88 2.27-2 2.27\"/></svg>", "image/svg+xml").documentElement

    const membersinceDiscordText = document.createElement("p")
    membersinceDiscordText.innerText = user.createdAt

    membersinceDiscord.appendChild(membersinceDiscordImg)
    membersinceDiscord.appendChild(membersinceDiscordText)

    const membersinceSeperator = document.createElement("div")
    membersinceSeperator.id = "seperator"

    let membersinceServer;
    if (user.joinedAt) {
        membersinceServer = document.createElement("div")
        membersinceServer.id = "server"

        const currentGuild = await ipcRenderer.invoke("currentGuild")

        const membersinceServerImg = document.createElement("img")
        membersinceServerImg.height = 18
        membersinceServerImg.width = 18
        membersinceServerImg.src = currentGuild.pfp

        const membersinceServerText = document.createElement("p")
        membersinceServerText.innerText = user.joinedAt

        membersinceServer.appendChild(membersinceServerImg)
        membersinceServer.appendChild(membersinceServerText)
    }

    membersince.appendChild(membersinceTitle)
    membersince.appendChild(membersinceDiscord)
    if (membersinceServer) membersince.appendChild(membersinceSeperator)
    if (membersinceServer) membersince.appendChild(membersinceServer)
    content.appendChild(membersince)

    info.appendChild(displayname)
    info.appendChild(username)
    appendBotBadge(info, user)
    info.appendChild(seperator)
    if (content.children.length > 0) info.appendChild(content)
    
    userModal.appendChild(banner)
    userModal.appendChild(pfp)
    if (status) userModal.appendChild(status)
    if (badges) userModal.appendChild(badges)
    userModal.appendChild(info)

    return userModal
}

//! handle error
ipcRenderer.on("error", (e, title, description) => {
    console.error(title, description)
    showMessageBox(title, description)
})

//! handle urls
document.addEventListener("click", (e) => {
    if (e.target.tagName == "A" && e.target.href) {
        e.preventDefault()
        showConfirmationBox(
            "Are you sure you want to open this url?",
            `A new window will appear with the website "${e.target.href}"`,
            () => ipcRenderer.send("openLink", (e.target.href)),
            () => {}
        )
    }
})