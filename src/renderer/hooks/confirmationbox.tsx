import { t } from "i18next"
import { useState, MouseEvent, SyntheticEvent } from "react"
import { Portal } from "react-portal"

type ConfirmationBoxOptions = {
    title: string,
    description: string,
    confirm: {
        text?: string,
        callback: (event: MouseEvent) => void
    },
    cancel?: {
        text?: string,
        callback?: (event: MouseEvent) => void
    }
}

export default function useConfirmationBox(options: ConfirmationBoxOptions): [
    JSX.Element,
    boolean,
    React.Dispatch<MouseEvent>,
    React.Dispatch<MouseEvent>
] {
    const [isConfirmationBoxOpen, setIsConfirmationBoxOpen] = useState<boolean>(false)

    function openConfirmationBox(e: MouseEvent) { setIsConfirmationBoxOpen(true) }
    function closeConfirmationBox(e: MouseEvent) { setIsConfirmationBoxOpen(false) }

    function clickConfirm(e: MouseEvent) {
        options.confirm.callback(e)
        setIsConfirmationBoxOpen(false)
    }

    function clickCancel(e: MouseEvent) {
        if (options.cancel?.callback) options.cancel.callback(e)
        setIsConfirmationBoxOpen(false)
    }

    return [
        <Portal>
            <div id="messageboxdiv">
                <div id="messagebox">
                    <p id="title">{options.title}</p>
                    <p id="description">{options.description}</p>
                    <button id="confirm" type="button" onClick={clickConfirm}>{options.confirm.text ?? t("messagebox.confirm")}</button>
                    <button id="cancel" type="button" onClick={clickCancel}>{options.cancel?.text ?? t("messagebox.cancel")}</button>
                </div>
            </div>
        </Portal>,
        isConfirmationBoxOpen,
        openConfirmationBox,
        closeConfirmationBox
    ]
}