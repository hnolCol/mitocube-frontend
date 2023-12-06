

import _ from "lodash"
import "./plate.css"
import { motion } from "framer-motion"
import { useState } from "react"

function Well({row, column, handleMouseDown}) {
    
    return <div className="well-border">
        <div className="well" onMouseDown={(e) => handleMouseDown(e,row,column)}><div>A</div></div>
    </div>
}

export function WellPlate96({ }) {
    const [isMouseDown, setMouseDown] = useState(false)
    const [selectedWells, setSelectedWells] = useState([])
    console.log("bum")

    const handleMouseDown = (e,row,column) => {
        //handle a mouse down 
        if (e.shiftKey) return
        if (!isMouseDown) {
            setSelectedWells([{row,column}])
        }
        console.log(row,column)
        setMouseDown(true)
    }
    return (
        
        <div>
            <p>Well plae</p>
            {_.range(8).map(j => {return <div key={j}>
                <div className="flex">
                    {_.range(12).map(i => {
                        return <div key={`${i}-${j}`} className="flex"><Well {...{handleMouseDown, row : j, column : i}}/></div>
                    })}
                </div>
        </div>})}
    </div>
    )
}