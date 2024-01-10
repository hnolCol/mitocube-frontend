

import _ from "lodash"
import "./plate.css"
import { addItemToArrayIfNotPresent, addItemToArrayOrRemoveItIfPresent} from "../../../services/arrays/transforms"
import { Button, ButtonGroup, ContextMenu, Dialog, Divider, Menu, MenuItem, SegmentedControl, Text } from "@blueprintjs/core"
import { Combobox } from "../input/Combobox"
import { getRandomID } from "../../../services/random"

const initSelectedWells = { isMouseDown: false, selected: [], lastClicked: undefined, fromRectangleSelection: false, rectangleSelectionStarted: undefined, currentRectangleSelection: [] }
const wellPlates = [
    { text: "15 wells", description: "3 rows x 5 columns (PAL)", rows: 3, columns: 5 },
    { text: "54 wells", description: "6 rows x 9 columns (PAL)", rows: 6, columns: 9 },
    { text: "96 wells", description: "8 rows x 12 columns", rows: 8, columns: 12 },
    { text: "384 wells", description: "16 rows x 24 columns", rows : 16, columns : 24}]

    /**
     * 
     * @param {Object} props
     * @param {Number} props.row The row index.
     * @param {Number} props.column The column index.
     * @param {Function} props.handleMouseDown Function to handle the mouse down event. Expected to take the MouseEvent, row and column index as arguments. 
     * @param {Function} props.handleMouseUp Function that handles the mouse up event. Expected to take the MouseEvent, row and column index as arguments.
     * @param {Function} props.handleMouseEnter Function that handles the mouse enter event. Expected to take the MouseEvent, row and column index as arguments.
     * @param {Function} props.handleMouseLeave Function that handles the mouse leave event. Expected to take the MouseEvent, row and column index as arguments.
     * @param {String} props.rowLabel The row label, likely a character (A, B, C, ..)
     * @param {Boolean} props.selected Is the well selected. 
     * @param {Boolean} props.inCurrentRectangleSelection Is the well in the current rectangle selection. If in rectangle selection the well is colored and overwrite the selected coloring of the well.  
     * @returns {import("react").ReactElement} The JSX React Element of a well plate Well. 
     */
function Well({ row, column, handleMouseDown, handleMouseUp, handleMouseEnter, handleMouseLeave, rowLabel, selected = false, inCurrentRectangleSelection = false }) {
    return <div className="well-border prevent-select"
        onMouseUp={e => handleMouseUp(e, row, column)}
        onMouseDown={e => handleMouseDown(e, row, column)}
        onMouseEnter={e => handleMouseEnter(e, row, column)}
        onMouseLeave={e => handleMouseLeave(e, row, column)}
    >
        <div className={`well__base bg--grey ${inCurrentRectangleSelection?"well__rect_selection":selected?'well__base--selected':''}`}>
            <div>
                {rowLabel}{column + 1}
            </div>
        </div>
    </div>
}
/**
 * 
 * @param {Object} props 
 * @param {Number} props.rows - The number of rows, default 8
 * @param {Number} props.columns - The number of columns, default 12
 * @param {String} props.plateLabel - The plate label (pseudo-random string of length 5)
 * @param {Object} props.selectedWells - The selectedWells properties
 * @param {Function} props.setSelectedWells - Function the change the selectedWells props using setSelectedWells(plateLabel, updatedSelectedWell)
 * @param {Function} props.deleteWellPlate - Function that takes the plateLabel as an argument and removes the plate. 
 * @returns {import("react").ReactElement} The JSX Element
 */
export function WellPlate({rows = 8, columns = 12, plateLabel, selectedWells, setSelectedWells, deleteWellPlate}) {
   
    const rowLabels = _.range(rows).map(columnIndex => String.fromCharCode(columnIndex + 65))
    const maxDimension = Math.max(rows, columns)
    
    const handleMouseDown = (e,row,column) => {
        //handle a mouse down 
        if (e.button !== 0) return 
        if (e.shiftKey) return
        let updatedWells = {
            ...selectedWells,
            lastClicked: getWellPositionInteger(row, column),
            isMouseDown: true
        }
        
        setSelectedWells(plateLabel,updatedWells)

    }

    /**
     * @description Calculates a single integer based on the row and column index. Numbers are
     * in general fast to be compared and do not require a deep comparison as object's such as ``{row : 1, column : 1}``
     * would. The formula is ``positionInteger = row * max(rows,columns) + column``. To get the row and column back use ``getPositionFromInteger()``
     * @param {Number} row - The well row position
     * @param {Number} column - The well column position.
     * @returns {Number} The positional integer.
     */
    const getWellPositionInteger = (row,column) => {
        return row * maxDimension + column
    }

    /**
     * @description Returns the row and column index as an object ``{row: j, column : i}`` using the formular
     * row = int (positionInteger / max(rows, columns)) and column = positionInteger % max(rows, columns)
     * @param {Number} positionInteger 
     * @returns {import("../../../types/submissions").WellPosition} The row and column position.
     */
    const getPositionFromInteger = (positionInteger) => {
        return {row : _.toInteger(positionInteger/maxDimension), column : positionInteger % maxDimension}
    }

    /**
     * @description Handles the mouse up event. If rectangle selection is not active then the well is 
     * simply selected. If the wells are selected by rectangle based selection then they will be added to 
     * the selection. If all selected wells were already selected, they will be removed from the selection. 
     * TODO: Implement shift-key event handling. 
     * @param {MouseEvent} e
     * @param {Number} row The row index.
     * @param {Number} column The column index.
     */
    const handleMouseUp = (e, row, column) => {
        if (!e.shiftKey && !selectedWells.fromRectangleSelection) {
            let updatedWells = {
                ...selectedWells,
                selected: addItemToArrayOrRemoveItIfPresent({ array: selectedWells.selected, item: getWellPositionInteger(row, column) }),
                lastClicked: getWellPositionInteger(row, column),
                fromRectangleSelection: false,
                isMouseDown: false
            }

            setSelectedWells(plateLabel,updatedWells)
        }
        else if (selectedWells.fromRectangleSelection) {
            let selectedUnion = selectedWells.selected
            const diffSelection = _.difference(selectedWells.currentRectangleSelection,selectedWells.selected)
            if (diffSelection.length === 0 && selectedWells.selected.length > 0) {
                //remove the selection if all of the selected were already selected.
                selectedUnion = _.filter(selectedWells.selected, positionInteger => !selectedWells.currentRectangleSelection.includes(positionInteger))
            }
            else {
                selectedUnion = _.uniq(_.flatten(_.concat(selectedWells.selected,selectedWells.currentRectangleSelection)))
            }
            let updatedWells = {
                ...selectedWells,
                selected: selectedUnion,
                rectangleSelectionStarted: undefined,
                fromRectangleSelection: false,
                currentRectangleSelection: [],
                isMouseDown : false
            }
            setSelectedWells(plateLabel,updatedWells)
        }

        else {
            resetRectangleSelection()
        } 
    }


    /**
     * @description Handles the mouse entering event. If the mouse is pressed down, wells can be selected
     * using a rectangle like well selection. Sets the selected well by changing the state. Positions of wells
     * are stored as a single integer to facilitate easy comparison. Please see ``getPositionFromInteger`` and 
     * ``getWellPositionsInteger`` functions. 
     * @param {MouseEvent} e The mouse event invoked on entering a well. 
     * @param {Number} row The row index.
     * @param {Number} column The column index.
     */
    const handleMouseEnter = (e, row, column) => {
        if (!selectedWells.isMouseDown) return 
        if (_.isNumber(selectedWells.rectangleSelectionStarted)) {
            let rowRange = []
            let columnRange = []
            const rectangleStaredAt = getPositionFromInteger(selectedWells.rectangleSelectionStarted)
            //if mouse moves towards bottom right from the start of selection
            if (rectangleStaredAt.row <= row) {
                rowRange = _.range(rectangleStaredAt.row, row+1)
            }
            else {
                rowRange = _.range(row, rectangleStaredAt.row + 1)
            }

            if (rectangleStaredAt.column <= column) {
                columnRange = _.range(rectangleStaredAt.column, column+1)
            }
            else {
                columnRange = _.range(column, rectangleStaredAt.column+1)
            }

            const selected = _.flatten(rowRange.map(j => {
                return (columnRange.map(i => {
                    return getWellPositionInteger(j,i)
                }))
            }))

            let updatedWells = {
                ...selectedWells,
                currentRectangleSelection : selected
            }
            setSelectedWells(plateLabel,updatedWells)
        }   
    }
    /**
     * @description Handles mouse leave for a well if is mouse is pressed.
     * row and columns are 0-indexed. 
     * @param {MouseEvent} e 
     * @param {Number} row The row index.
     * @param {Number} column The colum index. 
     */
    const handleMouseLeave = (e, row, column) => {
        if (selectedWells.isMouseDown){
            const wellPositionInteger = getWellPositionInteger(row, column)
                let updatedWells = {
                    ...selectedWells,
                    fromRectangleSelection: true,
                    rectangleSelectionStarted: selectedWells.rectangleSelectionStarted === undefined ? wellPositionInteger : selectedWells.rectangleSelectionStarted,
                    currentRectangleSelection : selectedWells.rectangleSelectionStarted === undefined ? [wellPositionInteger] : selectedWells.currentRectangleSelection
                }
                setSelectedWells(plateLabel,updatedWells)
            }
    }
    /**
     * @description Select all wells in a plate. 
     */
    const selectAllWellsInPlate = () => {
        const selection = _.flatten(_.range(rows).map(row => _.range(columns).map(column => getWellPositionInteger(row, column))))
        let updatedWells = {
            ...selectedWells,
            selected: selection
        }
        setSelectedWells(plateLabel,updatedWells)
    }

    /**
     * @description Resets the rectangle selection. 
     */
    const resetRectangleSelection = () => {

        let updatedWells = {
            ...selectedWells,
            isMouseDown: false,
            rectangleSelectionStarted: undefined,
            fromRectangleSelection: false,
            currentRectangleSelection: []
        }
        setSelectedWells(plateLabel,updatedWells)
    }

    return (
       
        <div>
            <ContextMenu content={<Menu small={true}>
                <MenuItem text="Clear Selection" onClick={() => setSelectedWells(plateLabel,initSelectedWells)} />
                <MenuItem text="Select all wells" onClick={(e) => selectAllWellsInPlate()} />
            </Menu>}>
                <ButtonGroup>
                <Button text="" icon="selection" minimal={true} onClick={(e) => selectAllWellsInPlate()} small={true} />
                <Button text="" icon="circle" minimal={true} onClick={() => setSelectedWells(plateLabel, initSelectedWells)} small={true} />
                <Divider />
                <Button text="" icon="cross" minimal={true} intent="danger" onClick={() => deleteWellPlate(plateLabel)} small={true}  />
                </ButtonGroup>
            {_.range(rows).map(j => {return <div key={j}>
                <div className="flex" >
                    {_.range(columns).map(i => {
                        const wellKey = `${j}-${i}`
                        const positionInteger = getWellPositionInteger(j,i)
                        return <div key={wellKey} className="flex">
                            <Well {...{
                                handleMouseDown,
                                handleMouseUp,
                                row: j,
                                column: i,
                                rowLabel: rowLabels[j],
                                selected: selectedWells.selected.includes(positionInteger),
                                inCurrentRectangleSelection : selectedWells.currentRectangleSelection.includes(positionInteger),
                                handleMouseEnter,
                                handleMouseLeave
                            }} />
                        </div>
                    })}
                </div>
            </div>
            })}
                </ContextMenu>
    </div>
    )
}




export function WellPlates({plates, setPlates}) {
    /**
     * 
     * @param {Object} plateDimension
     * @param {Number} plateDimension.rows - The number of rows for the new well plate. 
     * @param {Number} plateDimension.columns - The number of columns for the new well plate.
     */
    const addPlate = (plateDimension) => {
        const plateLabel = getRandomID(5)
        setPlates(prevValues => {
            return {
                ...prevValues,
                activePlateLabel : prevValues.activePlateLabel === undefined || prevValues.activePlateLabel === ""?plateLabel:prevValues.activePlateLabel,
                labels : _.concat(prevValues.labels,plateLabel),
                plateDimensions: { ...prevValues.plateDimensions, [plateLabel]: { rows: plateDimension.rows, columns: plateDimension.columns } },
                selectedWells: { ...prevValues.selectedWells, [plateLabel]: initSelectedWells }// merge newly added plate.
            }
        })
    }
  
    /**
     * @description Remove a well plate completely
     * @param {String} plateLabel Label of the well plate to be deleted.
     */
    const deleteWellPlate = (plateLabel) => {
        if (plates.labels.includes(plateLabel)) {
            let updatedPlates = { ...plates }
            let plateDimensions = updatedPlates.plateDimensions 
            let selectedWells = updatedPlates.selectedWells
            //remove plates
            delete plateDimensions[plateLabel]
            delete selectedWells[plateLabel]
            let labels = updatedPlates.labels.filter(label => label !== plateLabel)
            updatedPlates["labels"] = labels 
            updatedPlates.activePlateLabel = _.isString(labels[0])?labels[0]:""
            setPlates(prevValues => {return {...prevValues,...updatedPlates}})
        }
           
        
    }

    /**
     * 
     * @param {String} plateLabel - The plate label (pseudo-random string of length 5).
     * @param {Object} updatedSelectedWells - Updated selected wells object. 
     */
    const setSelectedWells = (plateLabel, updatedSelectedWells) => {
        setPlates(prevValues => {
            return {
                ...prevValues,
                selectedWells: { ...prevValues.selectedWells, [plateLabel]: updatedSelectedWells}// merge newly added item.
            }
        })
    }

    return (
        <div>
            <div className="flex">
            <SegmentedControl
                small={true}
                options={plates.labels.map((plateLabel, plateLabelIdx) => { return { label: `${plateLabelIdx+1}  (${plates.plateDimensions[plateLabel].rows} x ${plates.plateDimensions[plateLabel].columns})`, value: plateLabel} })}
                value={plates.activePlateLabel}
                    onValueChange={(plateLabel, element) => setPlates(prevValues => { return { ...prevValues, activePlateLabel: plateLabel } })} />
                <Combobox
                    items={wellPlates}
                    labelKey={"description"}
                    placeholder=""
                    buttonProps={{ minimal: true, icon: "plus" }}
                    matchTargetWidth={false}
                    fill={false}
                    formGroupMargin={false}
                    onChange={addPlate} />
            </div>
            {_.isString(plates.activePlateLabel) && _.has(plates.plateDimensions, plates.activePlateLabel) && plates.labels.includes(plates.activePlateLabel) ?
                <WellPlate {...plates.plateDimensions[plates.activePlateLabel]}
                    {...{ plateLabel: plates.activePlateLabel, selectedWells: plates.selectedWells[plates.activePlateLabel], setSelectedWells, deleteWellPlate }} /> : null }
        </div>
    )
}