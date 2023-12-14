import { Button, Checkbox, ContextMenu, Menu, MenuItem, Popover } from "@blueprintjs/core"
import PropTypes from "prop-types"
import { downloadSVG } from "../../../services/downloads/svg"
import { arrayOfObjectsToTabDel, downloadTxtFile } from "../../../services/downloads/txt"
import _ from "lodash"


SVG.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    svgRef: PropTypes.any,
    svgID: PropTypes.string.isRequired,
    contextMenuEnabled : PropTypes.bool
}

export function SVG({width = 100, height = 200, svgRef = undefined, svgID = undefined, contextMenuEnabled = true, children}){
    return (
        <ContextMenu disabled={!contextMenuEnabled} content={
            <Menu>
                <MenuItem text="Download" onClick={() => downloadSVG(document.getElementById(svgID), "chart.svg")}>
                </MenuItem>
            </Menu>}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} id={svgID} ref={svgRef}>
            {children}
        </svg>
        </ContextMenu>
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
                <Popover content={
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
                            
                </Popover> : null
                }
            

            {_.isArray(chartData) ? <Button
                icon="database"
                onClick={() => downloadTxtFile(arrayOfObjectsToTabDel(chartData), txtFileName)}
                minimal={true}
            /> : _.isObject(chartData) ?
                    <Popover minimal={true} content={
                        <Menu>{
                            Object.keys(chartData).map(dataName =>
                                <MenuItem
                                    text={dataName}
                                    key={dataName}
                                    onClick={() => downloadTxtFile(arrayOfObjectsToTabDel(chartData[dataName]), `${dataName}-chartData.txt`)} />
                            )}
                    </Menu>}>
                    <Button icon="database" minimal={true}/>
                </Popover>
            : null}    


            
            <div className="flex center-items">
                <Checkbox label="Grid" style={{ margin: 0 }} checked={showGrid} onChange={_.isFunction(onShowGridChange)?onShowGridChange:undefined}/>
            </div>
        </div>
    )
}