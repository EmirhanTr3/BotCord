import { Outlet, createRootRoute, redirect } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { AppFrame } from '../components'

export const Route = createRootRoute({
    component: () => (
    <>
        <AppFrame />

        <div id="app">
            <Outlet />
        </div>
        
        <TanStackRouterDevtools position='bottom-right'/>
    </>
    ),
    loader: async (options) => {
        const isLoggedIn = await window.api.invoke("getIsLoggedIn")
        if (!isLoggedIn && options.location.href !== "/login") throw redirect({
            to: "/login"
        })
        else if (isLoggedIn && options.location.href == "/login") throw redirect({
            to: "/"
        })
    }
})