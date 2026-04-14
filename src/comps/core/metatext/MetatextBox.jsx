
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { copyTextToClipboard } from "../../../services/clipboard"
import { Button } from "@blueprintjs/core"
import Markdown from "react-markdown"
import _ from "lodash"
import remarkGfm from 'remark-gfm'
import { CreatedAt } from "../metrics/CreatedAt"
import { MinimalUserIcon } from "../base/user"
import { api } from "@/api"

export function MetatextBox({ tag, onEdit, onDelete, width = "25vw", showEdit = false, showDelete = false, forceUpdate = undefined }) {
    const [mouseIn, setMouseIn] = useState(false)
    const { data: metatext, refetch : update } = api.metatexts.useGetMetatext({ tag }, { enabled: !!tag })

    useEffect(() => {
        if(_.isNumber(forceUpdate)) {
            update()
        }
    }, [forceUpdate])


    if (!_.isObject(metatext)) return null
    return (
        <motion.div onMouseEnter={() => setMouseIn(true)} onMouseLeave={() => setMouseIn(false)} className="margin--little">
        <div className="flex margin--little justify-space-between">
                <div className="flex flex-column"><div><h3>{metatext.title}</h3></div></div>
                <div className="flex flex-column" style={{ opacity: mouseIn ? 1 : 0, alignItems: "flex-end"}}>  
                    <div className="flex center-items" style={{ marginRight: "8px", gap: "8px" }}>
                        <div>
                            <CreatedAt createdat={_.isNumber(metatext.updated_at) ? metatext.updated_at : metatext.created_at} showOnlyFromNow={true} />
                        </div>
                        <MinimalUserIcon user_tag={metatext.created_by} />
                        {_.isString(metatext.updated_by) && metatext.updated_by !== metatext.created_by ? <MinimalUserIcon user_tag={metatext.updated_by} /> : null}
                    </div>

                    <div className="flex">
                            <Button
                            icon="clipboard"
                            small={true}
                            minimal={true}
                            onClick={() => copyTextToClipboard(`${metatext.title}\n\n${metatext.text}`)} />
                        
                        {showEdit && _.isFunction(onEdit) ?
                            <Button small={true} minimal={true} icon="edit" onClick={() => onEdit(tag, metatext.title, metatext.text)} /> : null}


                            {showDelete && _.isFunction(onDelete) ? <Button small={true} minimal={true} icon="trash" onClick={() => onDelete(tag)} /> : null}
                    </div>
                </div>
        </div>
        <div
            className="intent-padding-right--little container--scroll-y-hide-x"
            style={{ textAlign: "justify", width, height: "33vh" }}>

                <Markdown remarkPlugins={[remarkGfm]}>{metatext.text}</Markdown>
    </div>
    </motion.div>)

}
