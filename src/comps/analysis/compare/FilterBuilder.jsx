import { useState } from "react"

import { FilterNode } from "./FilterNode"



export function FilterBuilder({ submission_tag }) {

    const [tree, setTree] = useState({children : [], type : "and"})

    return <div className="div--expand">

        <div>
            <FilterNode node={tree} onChange={setTree} init_submission_tag={submission_tag} />
        </div>

    </div>
}