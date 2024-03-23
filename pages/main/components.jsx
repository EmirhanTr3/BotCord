const { useRef, useEffect } = require("react");

function GuildImg ({guild}) {
    const ref = useRef(null)

    useEffect(() => {
        createHoverText(ref.current, guild.name)
    })

    const onClick = async () => {
        console.log(`clicked on server ${guild.name} (${guild.id})`)
        if ((await ipcRenderer.invoke("switchGuild", guild.id)) == false) return
        displayChannelList()
        displayMemberList()
        displayChatMessages()
    }

    return <img ref={ref} id="pfp" height="48px" width="48px" src={guild.icon} onClick={onClick}></img>
}

function ChannelCategory ({category}) {
    const ref = useRef(null)
    const channelNameRef = useRef(null)
    
    if ((category.name.length >= 20)) {
        useEffect(() => {
            createHoverText(channelNameRef.current, category.name)
        })
    }

    const icon = getChannelIconPath(category.type)
    const name = ((category.name.length < 20) ? category.name : (category.name.substring(0, 20) + "...")).toUpperCase()

    return <div ref={ref} id="category" className={`category-${category.id}`}>
        <img id="icon" className="category" height="18px" width="18px" src={icon}></img>
        <p ref={channelNameRef} id="channelname">{name}</p>
    </div>
}