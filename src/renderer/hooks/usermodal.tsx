import { SyntheticEvent, useState } from "react"
import { Portal } from "react-portal"
import { UserModal } from "../components"
import { Member } from "src/shared/types"

export default function useUserModal(user: Member): [
    JSX.Element,
    boolean,
    React.Dispatch<SyntheticEvent<HTMLElement, MouseEvent>>,
    {x: number, y: number}
] {
    const [mouseLocation, setMouseLocation] = useState<{x: number, y: number}>({x: 0, y: 0})
    const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false)

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
    
    return [
        <Portal><UserModal user={user} location={mouseLocation} /></Portal>,
        isUserModalOpen,
        toggleUserModal,
        mouseLocation
    ]
}
