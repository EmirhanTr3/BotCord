import { createFileRoute } from '@tanstack/react-router'
import { T } from '../../components'

export const Route = createFileRoute('/settings/appearance')({
    component: Appearance
})

function Appearance() {
    return <>
        <h1><T k="settings.app.appearance.label" /></h1>
        <h2><T k="settings.app.appearance.theme" /></h2>
        <div id="light" className="theme"></div>
        <div id="dark" className="theme"></div>
        {/* 
        ! CUSTOM THEME SUPPORT WILL BE SOON !
        <div id="maincolor"><input type="color" /></div>
        <div id="secondarycolor"><input type="color" /></div>
        */}
    </>
}