import { Code, InputGroup, Tag } from "@blueprintjs/core"
import { Combobox } from "../../input/Combobox"
import { useEffect, useState } from "react"
import _ from "lodash"

function TagBasedSearch({data, onTagChange, tags = {}}) {
    
   // const [tags, setTags] = useState([])
    const [keyName,setKeyName] = useState()
    const [searchString, setSearchString] = useState({})
    const keyNames = Object.keys(data[0]).filter(keyName => _.isString(data[0][keyName]))


    
    const handleSearchStringChange = (e) => {
        setSearchString(prevValues => {return { ...prevValues, [keyName] : e.target.value}})
    }

    const handleKeyPress = (e) => {
        if (e.code === "Enter") {
            const keyNameSpecificSearchString = searchString[keyName]

            if (keyNameSpecificSearchString === "" && _.has(tags,keyName)) {
                delete tags[keyName]
                onTagChange({ ...tags })

            }
            else if (_.isString(keyNameSpecificSearchString) && keyNameSpecificSearchString !== ""){
                
                const extendedTags = {...tags, [keyName] : keyNameSpecificSearchString}
                if (_.isFunction(onTagChange)) {
                    onTagChange(extendedTags)
            }}
        }

    }

    const handleComboboxSelection = (keyName) => {
        //upon keyName selection, save the selection to state
        setKeyName(keyName)
    }
    

    return (
        <div className="flex flex-column">
            <div className="flex">
                <InputGroup placeholder="Search.." value={_.isString(searchString[keyName])?searchString[keyName]:""} leftIcon="search" onChange={handleSearchStringChange} onKeyUp={handleKeyPress}/>
                <Combobox placeholder={keyName} items={keyNames} onChange={handleComboboxSelection }/>
            </div>
            <div className="flex">
                {_.isObject(tags)?Object.keys(tags).map(tagKeyName => <Code key={tagKeyName}>{`${tagKeyName} : ${tags[tagKeyName]}`} </Code>):null}
            </div>
            
    </div>
)
}


export default TagBasedSearch