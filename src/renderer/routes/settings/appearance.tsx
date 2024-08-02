import { createFileRoute } from '@tanstack/react-router'
import { HoverText, T } from '../../components'
import { t } from 'i18next'
import { SyntheticEvent } from 'react'

export const Route = createFileRoute('/settings/appearance')({
    component: Appearance
})

function Appearance() {
    return <>
        <h1><T k="settings.app.appearance.label" /></h1>
        <h2><T k="settings.app.appearance.theme" /></h2>
        <div id="themes">
            <Theme id="dark"/>
            <Theme id="light"/>
        </div>
        {/* 
        ! CUSTOM THEME SUPPORT WILL BE SOON !
        <div id="maincolor"><input type="color" /></div>
        <div id="secondarycolor"><input type="color" /></div>
        */}
    </>
}

function Theme({ id }: { id: string }) {
    function clickEvent(e: SyntheticEvent<HTMLDivElement, MouseEvent>) {
        if (window.theme == id) return;
        window.api.send("setSetting", "theme", id)
        location.reload()
    }

    return <HoverText text={t(`settings.theme.${id}`)}>
        <div id={id} className="theme" onClick={clickEvent}></div>
    </HoverText>
}