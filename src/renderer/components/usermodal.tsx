import { forwardRef, useEffect, useRef, useState } from "react";
import { Member } from "src/shared/types";
import { getAsset, getBadge } from "../../shared/utils";
import { BotBadge, PFP, UserStatus } from ".";
import { useHoverText } from "../hooks";

export default forwardRef<HTMLDivElement, {user: Member, location: {x: number, y: number}}>((props, ref) => {
    const { user, location } = props

    const [UserAboutMe, setUserAboutMe] = useState<string>()
    const [UserBanner, setUserBanner] = useState<string>()

    useEffect(() => {
        async function fetchData() {
            if (user.bot) {
                const aboutme: string | undefined = await window.api.invoke("getAboutMe", user)
                if (aboutme) setUserAboutMe(aboutme)
            }
            
            const bannerURL: string | undefined = await window.api.invoke("getBannerURL", user)
            if (bannerURL) setUserBanner(bannerURL)
        }

        fetchData()
    }, [])

    return <div ref={ref} id="usermodal" style={{top: location.y, left: location.x}}>
        <img id="banner" src={UserBanner ?? getAsset("bannerdefault.png")} />
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
                        <p>{UserAboutMe}</p>
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
            </div>
        </div>
    </div>
})

function Badge({ badge }: { badge: {name: string, icon: string} }) {
    const badgeRef = useRef<HTMLImageElement>(null)
    const [HoverText, isOpen] = useHoverText(badgeRef, badge.name)

    return <>
        {isOpen && HoverText}
        <img ref={badgeRef} id="badge" width={22} height={22} src={badge.icon} />
    </>
}