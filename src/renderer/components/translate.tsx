import { t } from "i18next"

type Values = {
    [key: string]: any
}

export default function T({ k, v }: { k: string, v?: Values }) {
    return <>{t(k, v)}</>
}