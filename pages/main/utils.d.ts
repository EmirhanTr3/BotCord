interface ContextMenuButton {
    type: "normal"|"danger"|"seperator" = "normal",
    text: string,
    callback: (event: MouseEvent, button: ContextMenuButton) => void
}

declare function formatMessage(key: string, values: {[key: string]: any} = {}): string

declare function dragElement(element: Element, moveElement: Element): void

declare function showMessageBox(title: string, description: string, moveable: boolean = false): void

declare function showConfirmationBox(
    title: string,
    description: string,
    confirmCallback: () => void,
    cancelCallback: () => void,
    moveable: boolean = false
): void

declare function showToast(type: "info"|"warn"|"error"|"success", message: string): void

declare function openContextMenu(event: MouseEvent, ...options: ContextMenuButton[]): void

declare function getBadge(badge: string): { name: string, icon: string }

declare function showHoverText(event: MouseEvent, parentDiv: Element, text: string): Element

declare function getBotBadge(user: any): Element | undefined

declare function appendBotBadge(div: Element, user: any): void

declare function getStatusData(status: string): { name: string, icon: string }

declare function parseContent(content: string): Promise<string>