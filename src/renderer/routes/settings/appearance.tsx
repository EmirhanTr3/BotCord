import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings/appearance')({
    component: Appearance
})

function Appearance() {
    return <>
        <h1>APPEARANCE</h1>
        <h2>THEME</h2>
        <div id="light" className="theme"></div>
        <div id="dark" className="theme"></div>
        {/* 
        ! CUSTOM THEME SUPPORT WILL BE SOON !
        <div id="maincolor"><input type="color" /></div>
        <div id="secondarycolor"><input type="color" /></div>
        */}
    </>
}