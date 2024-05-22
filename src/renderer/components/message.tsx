import { Message } from "src/shared/types"
import { BotBadge, PFP } from "."
import { SyntheticEvent, useRef, useState } from "react"
import { Portal } from "react-portal"
import { UserModal } from "."

export default function MessageC({ message, extraClass }: { message: Message, extraClass?: string[] }) {
    const [isUserModalOpen, setIsUserModalOpen] = useState(false)
    const [mouseLocation, setMouseLocation] = useState<{x: number, y: number}>({x: 0, y: 0})
    const userModalRef = useRef<HTMLDivElement>(null)

    function toggleUserModal(e: SyntheticEvent<HTMLElement, MouseEvent>) {
        const userModalWidth = 340
        const userModalHeight = 500

        // if (document.getElementById("usermodal") && document.getElementById("usermodal") !== userModalRef.current) document.getElementById("usermodal")?.parentElement?.remove()

        setMouseLocation({
            x: ((e.nativeEvent.clientX + userModalWidth > document.body.clientWidth) ?
                document.body.clientWidth - (userModalWidth + 10) :
                e.nativeEvent.clientX),
                
            y: ((e.nativeEvent.clientY + userModalHeight > document.body.clientHeight) ?
                document.body.clientHeight - (userModalHeight + 10) :
                e.nativeEvent.clientY)
        })
        setIsUserModalOpen(!isUserModalOpen)
    }

    return <>
        {isUserModalOpen && <Portal><UserModal ref={userModalRef} user={message.author} location={mouseLocation} /></Portal>}
        
        <div id="message" className={"hover" + (extraClass ? " " + extraClass.join(" ") : "")}>
            <div id="messagecontent">
                {!extraClass?.includes("anothermessage") && <PFP src={message.author.avatar} height={42} width={42} onClick={toggleUserModal}/>}
                <div id="content">
                    {!extraClass?.includes("anothermessage") &&
                        <div>
                            <p id="username" style={{color: message.author.displayColor}} onClick={toggleUserModal}>{message.author.displayName}</p>
                            {(message.author.bot || message.author.webhook) && <BotBadge member={message.author} />}
                            <p id="time">{message.createdAt}</p>
                        </div>
                    }
                    <div id="msg">
                        <p id="msgcontent">{message.content}</p>
                    </div>
                </div>
            </div>
        </div>
    </>
}