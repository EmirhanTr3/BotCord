import { createFileRoute } from '@tanstack/react-router'
import { T } from '../../components'
import { SyntheticEvent } from 'react'
import { getAsset } from '../../../shared/utils'

export const Route = createFileRoute('/settings/language')({
    component: Language
})

function Language() {
    return <>
        <h1><T k="settings.app.language.label" /></h1>
        <h2><T k="settings.app.language.select" /></h2>
        <div id="languages">
            <Lang lang="English" code="en" />
            <Lang lang="Türkçe" code="tr" />
            <Lang lang="עברית" code="he"/>
        </div>
    </>
}

function Lang({ lang, code, noFlag }: { lang: string, code: string, noFlag?: true }) {
    
    function clickEvent(e: SyntheticEvent<HTMLDivElement, MouseEvent>) {
        if (window.language == code) return;
        window.api.send("setSetting", "language", code)
        location.reload()
    }

    return <div id="language" className={window.language == code ? "current" : undefined} onClick={clickEvent}>
        <div>
            <div id="outline">
                {window.language == code && <div id="fill" />}
            </div>
            <p>{lang}</p>
        </div>
        <div>
            <p><T k={"language." + code} /></p>
            {!noFlag && <img src={getAsset(`flags/${code}.png`)}/>}
        </div>
    </div>
}