import { Menu, MenuDivider, MenuItem } from "@blueprintjs/core"
import NumericValueInput from "../../../../../core/input/Numeric"
import _ from "lodash"
import { useEffect } from "react"


export function ReplicateMenu({ selectedRows, numberReplicates, onReplicateChange }) {
    

    useEffect(() => {
        //ensure that the input field is focused on.
        const el = document.getElementById("numeric-replicate-input")
        el.focus()
    }, [])
    
    return <Menu>
    <MenuItem text="Replicates." disabled={true} />
        <MenuDivider /> 
    {numberReplicates === 0 ? <MenuItem text="Select the number of replicates above." /> :
        <Menu>
            <MenuItem text="Fill pattern" disabled={true} />
            <MenuItem text="1,2,3 ... 1,2,3" onClick={() => onReplicateChange(selectedRows,undefined,0)}/>
            <MenuItem text={`1,1,1 ... ${_.join([numberReplicates, numberReplicates, numberReplicates], ",")}`}
                onClick={() => onReplicateChange(selectedRows, undefined, 1)} />
            <MenuDivider />
                <NumericValueInput
                id = "numeric-replicate-input"
                placeholder={`Select replicate`}
                callbackKey={"replicate"}
                submitButton={true}
                buttonProps={{
                    intent: "primary",
                    icon: "rocket"
                    }}
                    minValue={1}
                maxValue = {_.toNumber(numberReplicates)}
                onButtonClick={(callbackKey, replicate) => onReplicateChange(selectedRows,_.toInteger(replicate),undefined)}
                />
    </Menu>}
    </Menu>
    }
