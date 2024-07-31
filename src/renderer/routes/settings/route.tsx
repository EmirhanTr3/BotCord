import { Link, Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { useConfirmationBox } from '../../hooks'
import { SyntheticEvent, useEffect, useRef, useState } from 'react'
import { Account, Member } from 'src/shared/types'
import { PFP, T } from '../../components'
import { useLocalStorage } from 'usehooks-ts'
import { Portal } from 'react-portal'
import { t } from 'i18next'

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
                <h1><T k="settings.user.title" /></h1>
                <Link to="/settings/account" search={{redirect}}><p id="account" className="hover"><T k="settings.user.account.button" /></p></Link>
                <div id="seperator"></div>
                <h1><T k="settings.app.title" /></h1>
                <Link to="/settings/appearance" search={{redirect}}><p id="appearance" className="hover"><T k="settings.app.appearance.button" /></p></Link>
                <div id="seperator"></div>
                <SwitchAccount />
                <Logout />
            </div>
        </div>
        <div id="maincontent">
            <div id="content">
                <Outlet />
            </div>
        </div>
    </div>
}

function Logout() {
    const [ConfirmationBox, isConfirmationBoxOpen, openConfirmationBox] = useConfirmationBox({
        title: t("settings.logout.confirm.title"),
        description: t("settings.logout.confirm.description"),
        confirm: {
            callback: () => window.api.send("logout")
        }
    })

    return <>
        {isConfirmationBoxOpen && ConfirmationBox}
        <p id="logout" className="hover" onClick={openConfirmationBox}><T k="settings.logout.label" /></p>
    </>
}

function SwitchAccount() {
    const [isOpen, setOpen] = useState<boolean>(false)
    const [accounts, setAccounts] = useState<Account[]>([])
    const switchAccountDivRef = useRef<HTMLDivElement>(null)
    const [isLoginOpen, setLoginOpen] = useState<boolean>(false)
    const loginDivRef = useRef<HTMLDivElement>(null)
    const loginInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        async function getAccounts() {
            const accounts: Account[] = await window.api.invoke("getAccounts")
            setAccounts(accounts)
        }

        getAccounts()
    }, [])

    function removeAccount(account: Account) {
        setAccounts(accounts.filter(a => a.token !== account.token))
    }

    async function addAccount() {
        const response = await window.api.invoke("addAccount", loginInputRef.current!.value)
        if (response == true) {
            const accounts: Account[] = await window.api.invoke("getAccounts")
            setAccounts(accounts)
            setLoginOpen(false)
        }
    }

    return <>
        {isOpen && <Portal>
            <div ref={switchAccountDivRef} id="switchaccountdiv" onClick={(e) => { e.target == switchAccountDivRef.current && setOpen(false) }}>
                <div id="switchaccount">
                    <h1><T k="settings.accounts.manage" /></h1>
                    <div id="accounts">
                        {accounts.map((account, index) =>
                            <AccountC
                                key={account.id}
                                accounts={accounts}
                                account={account}
                                index={index}
                                removeAccount={removeAccount}
                            />
                        )}
                    </div>
                    <div id="addaccount">
                        <p onClick={() => setLoginOpen(true)}><T k="settings.accounts.add" /></p>
                    </div>
                </div>
            </div>
        </Portal>
        }
        
        {isLoginOpen && <Portal>
            <div ref={loginDivRef} id="logindiv" onClick={(e) => { e.target == loginDivRef.current && setLoginOpen(false) }}>
                <div id="login">
                    <h1><T k="settings.accounts.add" /></h1>
                    <p><T k="settings.accounts.token" /></p>
                    <input ref={loginInputRef}/>
                    <button onClick={() => addAccount()}><T k="settings.accounts.add" /></button>
                </div>
            </div>
        </Portal>
        }

        <p id="switchaccount" className="hover" onClick={() => setOpen(true)}><T k="settings.accounts.switch.label" /></p>
    </>
}

function AccountC(
    { accounts, account, index, removeAccount }:
    { accounts: Account[], account: Account, index: number, removeAccount: (account: Account) => void }
) {
    const [clientUser] = useLocalStorage<Member>("clientUser", JSON.parse(localStorage.getItem("clientUser")!))
    const [SwitchConfirmationBox, isSwitchConfirmationBoxOpen, openSwitchConfirmationBox] = useConfirmationBox({
        title: t("settings.accounts.switch.confirm.title"),
        description: t("settings.accounts.switch.confirm.description", {name: `${account.username}#${account.discriminator}`}),
        confirm: {
            callback: () => window.api.send("switchAccount", account.token)
        }
    })
    const [LogoutConfirmationBox, isLogoutConfirmationBoxOpen, openLogoutConfirmationBox] = useConfirmationBox({
        title: t("settings.accounts.remove.confirm.title"),
        description: t("settings.accounts.remove.confirm.description", {name: `${account.username}#${account.discriminator}`}),
        confirm: {
            callback: () => {
                window.api.send("removeAccount", account.token)
                removeAccount(account)
            }
        }
    })

    return <>
        {isLogoutConfirmationBoxOpen && LogoutConfirmationBox}
        {isSwitchConfirmationBoxOpen && SwitchConfirmationBox}

        <div id="account">
            <PFP height={40} width={40} src={`https://cdn.discordapp.com/avatars/${account.id}/${account.avatar}.webp?size=128`} />
            <div id="texts">
                <p id="username">{`${account.username}#${account.discriminator}`}</p>
                {clientUser.id == account.id && <p id="loggedin"><T k="settings.accounts.active" /></p>}
            </div>
            {clientUser.id !== account.id &&
                <>
                    <button onClick={openSwitchConfirmationBox}><T k="settings.accounts.switch.button" /></button>
                    <svg onClick={openLogoutConfirmationBox} xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="#e14545" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
                </>
            }
        </div>
        {index !== (accounts.length - 1) && <div id="seperator" />}
    </>
}