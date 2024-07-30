import { forwardRef, useEffect, useState } from "react";
import { Member } from "src/shared/types";
import { getAsset, getBadge } from "../../shared/utils";
import { Badge, BotBadge, PFP, UserStatus, HoverText } from ".";
import { parseContent } from "../utils";
import { useNavigate } from "@tanstack/react-router";

export default forwardRef<HTMLDivElement, {user: Member, location: {x: number, y: number}}>((props, ref) => {
    const { user, location } = props

    const [UserAboutMe, setUserAboutMe] = useState<string>()
    const [UserBanner, setUserBanner] = useState<string>()
    const navigate = useNavigate()

    useEffect(() => {
        async function fetchData() {
            if (user.bot) {
                const aboutme: string | undefined = await window.api.invoke("getAboutMe", user)
                if (aboutme) setUserAboutMe(aboutme)
            }
            
            const bannerURL: string | undefined = await window.api.invoke("getBannerURL", user)
            if (bannerURL) setUserBanner(bannerURL)

            if (!user.badges.includes("Nitro") && !user.bot && bannerURL) user.badges.push("Nitro")
        }

        fetchData()
    }, [])

    async function openDM() {
        const response = await window.api.invoke("addDM", user.id)
        if (response.status == true) {
            navigate({
                to: `/dm/${response.channel.id}`
            })
        }
    }

    return <div ref={ref} id="usermodal" style={{top: location.y, left: location.x}}>
        <img id="banner" src={UserBanner ?? getAsset("bannerdefault.png")} />
        {!user.bot &&
            <div id="buttons">
                <HoverText text="Send a message">
                    <div id="dm" onClick={openDM}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#d9d9d9" viewBox="0 0 256 256"><path d="M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128ZM84,116a12,12,0,1,0,12,12A12,12,0,0,0,84,116Zm88,0a12,12,0,1,0,12,12A12,12,0,0,0,172,116Zm60,12A104,104,0,0,1,79.12,219.82L45.07,231.17a16,16,0,0,1-20.24-20.24l11.35-34.05A104,104,0,1,1,232,128Zm-16,0A88,88,0,1,0,51.81,172.06a8,8,0,0,1,.66,6.54L40,216,77.4,203.53a7.85,7.85,0,0,1,2.53-.42,8,8,0,0,1,4,1.08A88,88,0,0,0,216,128Z"></path></svg>
                    </div>
                </HoverText>
            </div>
        }
        <PFP width={80} height={80} src={user.avatar}/>
        <UserStatus height={20} width={20} status={user.status} />
        {user.badges.length > 0 &&
            <div id="badges">
                {user.badges.map(badge => {
                    const badgeInfo = getBadge(badge)
                    if (badgeInfo) {
                        return <Badge key={badgeInfo.name} badge={badgeInfo} />
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
                {UserAboutMe &&
                    <div id="aboutme">
                        <h1 id="title">ABOUT ME</h1>
                        <p dangerouslySetInnerHTML={{ __html: parseContent(UserAboutMe) }}></p>
                    </div>
                }
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
                {user.roles && user.roles.filter(r => !r.isEveryone).length > 0 &&
                    <div id="roles">
                        <h1 id="title">{user.roles.length > 2 ? "ROLES": "ROLE"}</h1>
                        <div id="list">
                            {user.roles.filter(r => !r.isEveryone).map((role, index) =>
                                <div key={index} id="role">
                                    <div id="color" style={{backgroundColor: role.color}} />
                                    {role.icon && <img width={16} height={16} src={role.icon}/>}
                                    <p>{role.name}</p>
                                </div>
                            )}
                        </div>
                    </div>
                }
            </div>
        </div>
    </div>
})