import hooks from "@mitocube/api-hooks"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"


export function ProteinHelp() {
  
    const { data : mk_stat_info, isSuccess } = hooks.info.useGetStatisticInfo()

    return isSuccess ? <div style={{padding: "1rem", maxWidth : "60rem", textAlign : "left"}}><Markdown remarkPlugins={[remarkGfm]}>{mk_stat_info}</Markdown></div> : null
remarkPlugins={[remarkGfm, remarkMath]}
rehypePlugins={[rehypeKatex]}
}