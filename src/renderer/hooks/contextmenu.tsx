import { SyntheticEvent, useState, useRef } from "react"
import { Portal } from "react-portal"

type ContextMenuButtonBase<T> = {
    text: string
    callback: (event: SyntheticEvent, item: T) => void
}

interface ContextMenuButtonNormal extends ContextMenuButtonBase<ContextMenuButtonNormal> {
    type?: "normal"
}

interface ContextMenuButtonDanger extends ContextMenuButtonBase<ContextMenuButtonDanger> {
    type: "danger"
}

type ContextMenuButton = ContextMenuButtonNormal | ContextMenuButtonDanger

type ContextMenuSeperator = {
    type: "seperator"
}

type ContextMenuItem = ContextMenuButton | ContextMenuSeperator

type ContextMenuOptions = {
    autoClose?: boolean,
    items: ContextMenuItem[]
}

export default function useContextMenu(options: ContextMenuOptions): [
    JSX.Element,
    boolean,
    React.Dispatch<SyntheticEvent<HTMLElement, MouseEvent>>,
    {x: number, y: number}
] {
    const [mouseLocation, setMouseLocation] = useState<{x: number, y: number}>({x: 0, y: 0})
    const [isContextMenuOpen, setIsContextMenuOpen] = useState<boolean>(false)
    const contextMenuRef = useRef<HTMLDivElement>(null)

    function toggleContextMenu(e: SyntheticEvent<HTMLElement, MouseEvent>) {
        setMouseLocation({
            x: e.nativeEvent.clientX,
            y: e.nativeEvent.clientY
        })
        setIsContextMenuOpen(!isContextMenuOpen)
    }
    
    function clickEvent(e: MouseEvent) {
        const target = e.target as HTMLElement
        if (contextMenuRef.current?.contains(target) || !isContextMenuOpen) return;
        setIsContextMenuOpen(false)
        document.removeEventListener("click", clickEvent)
    }

    setTimeout(() => {
        document.addEventListener("click", clickEvent)
    }, 100);
    
    return [
        <Portal>
            <div ref={contextMenuRef} id="contextmenu" style={{top: mouseLocation.y, left: mouseLocation.x}}>
                <div id="items">
                    {options.items.map((item, index) => {
                        if (item.type == "seperator") return (
                            <div key={index} id="seperator"/>
                        )
                        else if (item.type == "normal" || !item.type) return (
                            <div key={index} id="button" className="normal" onClick={(e) => { item.callback(e, item); if (options.autoClose) setIsContextMenuOpen(false) }}>
                                <p>{item.text}</p>
                            </div>
                        )
                        else if (item.type == "danger") return (
                            <div key={index} id="button" className="danger" onClick={(e) => { item.callback(e, item); if (options.autoClose) setIsContextMenuOpen(false) }}>
                                <p>{item.text}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </Portal>,
        isContextMenuOpen,
        toggleContextMenu,
        mouseLocation
    ]
}
