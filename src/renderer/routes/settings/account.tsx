import { createFileRoute } from '@tanstack/react-router'
import { getAsset, getBadge } from '../../../shared/utils'
import { useLocalStorage } from 'usehooks-ts'
import { Member } from 'src/shared/types'
import { useEffect, useState } from 'react'
import { Badge } from '../../components'

export const Route = createFileRoute('/settings/account')({
    component: Account
})

function Account() {
    const [clientUser] = useLocalStorage<Member>("clientUser", JSON.parse(localStorage.getItem("clientUser")!))
    const [UserBanner, setUserBanner] = useState<string>()

    useEffect(() => {
        async function fetchData() {
            const bannerURL: string | undefined = await window.api.invoke("getBannerURL", clientUser)
            if (bannerURL) setUserBanner(bannerURL)
        }

        fetchData()
    }, [])
    
    return <>
        <h1>ACCOUNT</h1>
        <div id="account">
            <div id="useraccount">
                <img id="banner" src={UserBanner || getAsset("bannerdefault.png")} />
                <img id="pfp" height="80" width="80" src={clientUser.avatar} />
                <p id="name">{clientUser.displayName}</p>
                <div id="info">
                    <h2>USERNAME</h2>
                    <p id="username">{clientUser.name}</p>
                </div>
                <div id="badges">
                    {clientUser.badges.map(badge => {
                        const badgeInfo = getBadge(badge)
                        if (badgeInfo) {
                            return <Badge key={badgeInfo.name} badge={badgeInfo} />
                        }
                    })}
                </div>
            </div>
        </div>
    </>
}