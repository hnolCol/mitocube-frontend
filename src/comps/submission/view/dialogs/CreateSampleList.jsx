import { Button, Dialog, InputGroup } from "@blueprintjs/core"
import axios from "axios"
import _ from "lodash"
import { useEffect, useState } from "react"
import { arrayOfObjectsToTabDel, downloadTxtFile } from "../../../../services/downloads/txt"
import { Combobox } from "../../../core/input/Combobox"
import PropTypes from "prop-types"


const comboboxProps = [
        {callbackKey:"direction",items:["Rows","Columns"],title:"Sample direction:"},
        {callbackKey:"startRow",items:["A","B","C","D","E","F","G","H"],title:"Start Row:"},
        {callbackKey:"startColumn",items:_.range(1,13),title:"Start Column:"},
        {callbackKey:"scramble",items:["True","False"],title:"Scramble:"},
    ]

const isLoadingInit = { loading: false, msg: "" }


CreateSampleList.propTypes = {
    dataID: PropTypes.string.isRequired,
    token: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    handleDataChange : PropTypes.func.isRequired
}


function CreateSampleList({dataID, token, onClose, handleDataChange, isOpen = true, title = "Create sample list.", ...rest}) {

    const [input, setInput] = useState({ direction: "Rows", startRow: "A", startColumn: "1", scramble: "True", internalID: "" })
    const [sampleList, setSampleList] = useState([])
    const [isLoading,setIsLoading] = useState(isLoadingInit)


    useEffect(() => {
        setSampleList([])
    },[dataID])

    const handleInput = (id, value) => {

        setInput(prevValues => {
            return { ...prevValues, [id]:value}}
            )
    }
    
    const handleClose = (e) => {

        if (_.isFunction(onClose)) {
            setSampleList([])
            setIsLoading(isLoadingInit)
            onClose({isOpen:false})
        }
    }

    const createSampleList = ( ) => {
        setIsLoading({loading:true,msg:"Request send to API."})
        axios.get('/api/admin/samplelist', {params:{token:token,dataID:dataID, ...input}}).then(response => 
            
            {
                //console.log(response.data)
                if (response.data["success"] && Object.keys(response.data).includes("paramsFile")){
                    
                    handleDataChange(dataID,response.data["paramsFile"])
                    setSampleList(JSON.parse(response.data["sampleList"]))
                    setIsLoading({loading:false,msg:"Sample list created and ready for download."})

                }
                else {
                    setIsLoading({loading:false,msg:"The API returned an error. " + response.data["msg"]})
                    setSampleList([])
                }
            }
        )
            
    }

    return(
        <Dialog {...{isOpen, title, onClose : handleClose}} {...rest}>
        <div style={{margin:"2rem"}}>
            <p>Creates a sample list for measurement of desired project. Please select first if samples follow 1-N in direction of rows (A1, A2, A3) or columns (A1, B1, C1) in a 96 well plate.</p>
            {comboboxProps.map(v => {
                const {title, ...rest} = v
                return(
                    <div key = {v.title} className="flex">
                        <div style={{minWidth:"160px"}}>
                            <Button small={true} minimal={true}>
                                {title}
                            </Button>
                        </div>
                        <Combobox
                            {...rest}
                            callback = {handleInput} 
                            placeholder = {input[rest.callbackKey]}
                            />
                    </div>
                )
            })}

                <div className="flex">
                        <div style={{minWidth:"160px"}}>
                            <Button small={true} minimal={true}>
                                Internal ID:
                            </Button>
                        </div>
                        <InputGroup 
                            value={input["internalID"]} 
                            placeholder = {"Internal project identifier"} 
                            onChange={e => handleInput("internalID",e.target.value)}/> 
                    </div>
            <p>After creation of the sample list, the download will be enabled.</p>
            <div className="flex justify-space-between" style={{marginTop:"1rem"}}>
                <div>
                        <Button
                            text="Create"
                            intent="none"
                            onClick={createSampleList}
                            loading={isLoading.loading} />
                        
                        <Button text="Download"
                                intent="primary"
                                disabled={sampleList.length === 0} // not clickable until create was pressed and successful
                                onClick={e => downloadTxtFile(arrayOfObjectsToTabDel(sampleList, Object.keys(sampleList[0])), `sample-list-${dataID}.txt`)} />
                </div>
                <div>
                <Button text = "Close" intent="danger" onClick={e => onClose({isOpen:false})}/>
                </div>

            </div>
            <p>{isLoading.msg}</p>
        </div>
        </Dialog>
    )
}


export default CreateSampleList