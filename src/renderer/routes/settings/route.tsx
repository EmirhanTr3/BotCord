import { Link, Outlet, createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/settings')({
    validateSearch: (search: Record<string, unknown>): {redirect: string} => {
        return {
            redirect: (search.redirect as string) || "/"
        }
    },
    beforeLoad: ({location, search}) => {
        if (location.pathname == "/settings") {
            throw redirect({
                to: "/settings/account",
                search: search
            })
        }
    },
    component: Settings
})

function Settings() {
    const { redirect } = Route.useSearch()
    return <div id="settings">
        <Link to={redirect}><svg id="close" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="#d1d1d1" viewBox="0 0 256 256"><path d="M165.66,101.66,139.31,128l26.35,26.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path></svg></Link>
        <div id="leftbar">
            <div id="buttons">
                <h1>USER SETTINGS</h1>
                <Link to="/settings/account" search={{redirect}}><p id="account" className="hover">Account</p></Link>
                <div id="seperator"></div>
                <h1>APP SETTINGS</h1>
                <Link to="/settings/appearance" search={{redirect}}><p id="appearance" className="hover">Appearance</p></Link>
                <div id="seperator"></div>
                <p id="switchaccount" className="hover">Switch Account</p>
                <p id="logout" className="hover">Logout</p>
            </div>
        </div>
        <div id="maincontent">
            <div id="content">
                <Outlet />
            </div>
        </div>
    </div>
}