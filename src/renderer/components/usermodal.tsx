import { forwardRef, useEffect, useState } from "react";
import { Guild, Member } from "src/shared/types";
import { getAsset, getBadge } from "../../shared/utils";
import { BotBadge, PFP, UserStatus } from ".";

export default forwardRef<HTMLDivElement, {user: Member, location: {x: number, y: number}}>((props, ref) => {
    const { user, location } = props

    return <div ref={ref} id="usermodal" style={{top: location.y, left: location.x}}>
        <img id="banner" src={getAsset("bannerdefault.png")} />
        <PFP width={80} height={80} src={user.avatar}/>
        <UserStatus height={20} width={20} status={user.status} />
        {user.badges.length > 0 &&
            <div id="badges">
                {user.badges.map(badge => {
                    const badgeInfo = getBadge(badge)
                    if (badgeInfo) {
                        return <img key={badgeInfo.name} id="badge" width={22} height={22} src={badgeInfo.icon} />
                    }
                })}
            </div>
        }
        <div id="info">
            <p id="displayname">{user.displayName}</p>
            <p id="username">{user.name}</p>
            <BotBadge member={user} />
            <p id="seperator" />
            <div id="content">
                <div id="aboutme">
                    <h1 id="title">ABOUT ME</h1>
                    <p>About me/bio section is currently unavailable.</p>
                </div>
                <div id="membersince">
                    <h1 id="title">MEMBER SINCE</h1>
                    <div id="discord">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="#bbbbbb" viewBox="0 0 24 24"><path d="M19.73 4.87a18.2 18.2 0 0 0-4.6-1.44c-.21.4-.4.8-.58 1.21-1.69-.25-3.4-.25-5.1 0-.18-.41-.37-.82-.59-1.2-1.6.27-3.14.75-4.6 1.43A19.04 19.04 0 0 0 .96 17.7a18.4 18.4 0 0 0 5.63 2.87q.69-.93 1.2-1.98c-.65-.25-1.29-.55-1.9-.92.17-.12.32-.24.47-.37 3.58 1.7 7.7 1.7 11.28 0l.46.37c-.6.36-1.25.67-1.9.92.35.7.75 1.35 1.2 1.98 2.03-.63 3.94-1.6 5.64-2.87.47-4.87-.78-9.09-3.3-12.83ZM8.3 15.12c-1.1 0-2-1.02-2-2.27 0-1.24.88-2.26 2-2.26s2.02 1.02 2 2.26c0 1.25-.89 2.27-2 2.27m7.4 0c-1.1 0-2-1.02-2-2.27 0-1.24.88-2.26 2-2.26s2.02 1.02 2 2.26c0 1.25-.88 2.27-2 2.27"/></svg>
                        <p>{user.createdAt}</p>
                    </div>
                    {user.guild && <>
                        <div id="seperator" />
                        <div id="server">
                            <img width={18} height={18} src={user.guild.icon!}/>
                            <p>{user.joinedAt}</p>
                        </div></>
                    }
                </div>
            </div>
        </div>
    </div>
})

/*
*banner
*pfp
*status
*badges
info:
  *displayname
  *username
  *botbadge
  *seperator
  content:
    aboutme:
      *title
      text
    *membersince:
      *discord:
        *icon
        *text
      *server:
        *icon
        *text

*/

/*
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
}*/