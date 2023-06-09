import { Button, Checkbox, Menu, MenuItem } from "@blueprintjs/core"
import { Popover2 } from "@blueprintjs/popover2"
import { downloadSVG } from "../../../services/downloads/svg"
import { arrayOfObjectsToTabDel, downloadTxtFile } from "../../../services/downloads/txt"
import _ from "lodash"

export function SVG({width = 100, height = 200, svgRef = undefined, svgID = undefined, children}){
    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} id={svgID} ref={svgRef}>
            {children}
        </svg>
    )
}



export function SVGHeader({svgID = undefined, svgFileName = "download.svg", txtFileName = "data.txt", chartData = [], showGrid = false, onShowGridChange = undefined}) {

    return (
        <div className="flex">
            {_.isString(svgID) ?
                <Button
                    icon="download"
                    onClick={() => downloadSVG(document.getElementById(svgID), svgFileName)}
                    minimal={true}
                /> : _.isArray(svgID) ? 
                <Popover2 content={
                    <Menu >
                        {_.map(svgID.map((sID,svgIdx) => 
                            <MenuItem 
                                key={sID} 
                                text={sID} 
                                onClick={() => downloadSVG(document.getElementById(sID), svgFileName[svgIdx])}/>))}
                    </Menu>}>

                     <Button
                            icon="download"
                            minimal={true}
                            />
                            
                </Popover2> : null
                }
            
            <Button
                icon="database"
                onClick={() => downloadTxtFile(arrayOfObjectsToTabDel(chartData), txtFileName)}
                minimal={true}
            />
            <div className="flex center-items">
                <Checkbox label="Grid" style={{ margin: 0 }} checked={showGrid} onChange={_.isFunction(onShowGridChange)?onShowGridChange:undefined}/>
            </div>
        </div>
    )
}