import { api } from "@/api"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"

export function ProteinHelp() {
    
    const { data : mk_stat_info, isSuccess } = api.info.statistics.useGetStatisticInfo()

    return isSuccess ? <div style={{padding: "1rem", maxWidth : "60rem", textAlign : "left"}}><Markdown remarkPlugins={[remarkGfm, remarkMath]}>{mk_stat_info}</Markdown></div> : null
}