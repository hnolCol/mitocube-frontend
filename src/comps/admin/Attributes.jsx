
import _ from "lodash"

import TextInput from "../core/input/Text"
import { useEffect, useMemo, useState } from "react"
import { filterArrayBySearchString } from "../../services/arrays/filter"
import useDebounce from "../../hooks/useDebounce"
import APIError from "../core/error/APIerror"
import Loading from "../core/base/loading"
import { Button, ButtonGroup, Dialog } from "@blueprintjs/core"
import { usePostAttributeValue, useUpdateAttributeValue, useGetAttributes } from "../../hooks/queries/attribute.hooks"


/**
 * 
 * @param {Object} props 
 * @param {import("../../types/attributes").Attribute} props.attribute 
 * @returns 
 */
function AddAndEditAttributeValueDialog({ isOpen = false, attribute = {}, setOpen, edit = false, initialValues = {}, refetchAttributes }) {
    const [attributeValueInput, setAttributeValueInput] = useState({text : undefined, description : undefined})

    const {mutate : insertValue, isLoading, isError, isSuccess, error, reset : resetPost} = usePostAttributeValue()
    const { mutate: updateAttributeValue,
        isLoading: attributeUpdateLoading,
        isSuccess: attributeUpdateSuccess, reset : resetUpdate} = useUpdateAttributeValue()
    
    
    useEffect(() => {
        if (edit && attributeValueInput.text === undefined) {
            setAttributeValueInput(prevValues => {return {...prevValues, ...initialValues}})
        }
        
    }, [edit, attribute.tag, initialValues.text, initialValues.description])


    const handleTextChange = (key, value) => {
        setAttributeValueInput(prevValues => {return {...prevValues, [key] : value}})

    }

    const handleSubmit = () => {
        if (edit) {
            updateAttributeValue({attribute_tag : attribute.tag, attribute_value_props : attributeValueInput})
        }
        else {
            insertValue({ attribute_tag: attribute.tag, attribute_value: { ...attributeValueInput, attribute_tag: attribute.tag } })
        }
        
    }


    const handleClose = () => {
        // close the dialog, reset the post props. 
        resetPost()
        resetUpdate()
        setAttributeValueInput({ text: undefined, description: undefined })
        refetchAttributes()
        setOpen()
    }
    return (
        <Dialog style={{minHeight : "30vh", minWidth : "300px"}} isOpen={isOpen} title={`Add attribute value (${attribute.text})`} onClose={handleClose}>
            {isError ? <div className="margin--medium"><APIError error={error}/></div> : <div className="padding--medium margin--medium">
                <p>Add an attribute value to the database. Please make sure that the
                    attribute value does not exist under a different name / synonym.
                </p>
                <TextInput
                    value={_.has(attributeValueInput, 'text') ? attributeValueInput['text'] : ""}
                    hint="Text"
                    callbackKey="text"
                    onChange={handleTextChange} />
            
                <TextInput
                    value={_.has(attributeValueInput, 'description') ? attributeValueInput['description'] : ""}
                    hint="Description"
                    callbackKey="description"
                    onChange={handleTextChange} />
            
                <ButtonGroup vertical={false} >
                    {edit ? <Button
                        text="Edit"
                        intent="primary"
                        loading={attributeUpdateLoading}
                        onClick={handleSubmit} /> : <Button
                        text="Submit"
                        intent="primary"
                        loading={isLoading}
                        disabled={!(_.isString(attributeValueInput.text)
                            && _.isString(attributeValueInput.description)
                            && attributeValueInput.text.length > 0
                            && attributeValueInput.description.length > 0)}
                        onClick={handleSubmit} />}
                    <Button
                        text="Close"
                        onClick={handleClose}
                        disabled={isLoading} />
                </ButtonGroup>
            </div>}
            {edit & attributeUpdateSuccess ? "AttributeValue updated" : null}
        </Dialog>
    )
}


function AdminAttributes({ authenticationStatus, maxShown = 10}) {
    const [query, setQuery] = useState("")
    const [dialogProps, setDialogProps] = useState({isOpen : false, attribute : {}, input : {}})
    const debounceSearchString = useDebounce(query, 500)


    const {data: attributes,
        isLoading: attributesLoading,
        isError: attributeIsError,
        error: attributesAPIError,
        isSuccess: attributesIsSuccess,
        refetch : refetchAttributeSearch} = useGetAttributes({ search_string: debounceSearchString })

    const handleEdit = (attribute, attributeValue) => {

        setDialogProps(prevValues => {
            return {
                ...prevValues,
                isOpen: !prevValues.isOpen,
                attribute,
                edit : true,
                initialValues: { text: attributeValue.text, description: attributeValue.description, tag : attributeValue.tag }
            }
        })
    }


    return (
        <div className="margin-top--little padding--medium" >
            {attributeIsError ? <APIError error={attributesAPIError}/> :
                <div>
                <AddAndEditAttributeValueDialog {...dialogProps} refetchAttributes = {refetchAttributeSearch} setOpen={() => setDialogProps(prevValues => {return {...prevValues, isOpen : !prevValues.isOpen}})} />
                <p>Attributes are used to ensure that submission are accompanied by standardized attributes.</p>
                    <TextInput value={query} placeholder="Search attribute" callbackKey={"query"}  onChange={(callbackKey,value) => setQuery(value)}/>
                <div className="container--scroll-y-hide-x div--expand" style={{height : "80vh"}}>
                {attributesLoading?<Loading />:null}
                        <div className="bg--lightgrey flex flex-column">  
                            {attributesIsSuccess && _.isArray(attributes) ? attributes.map(attributeWithValues => {
                                const attribute = attributeWithValues[0]
                                const attributeValues = attributeWithValues[1]
                    //const attrHasValues = objectHasKey({ object: attrValuesByAttrTag, keyName: attribute.tag })
                    const numberAttributeValues = attributeValues.length 
                                return <div key={attribute.tag}
                                    className="intent-margin-topmedium intent-padding-right--little"
                                    style={{ height: "100%" }}>
                       
                        {/* <AttributeHeader {...attribute} addStringToName={`(${numberAttributeValues})`} /> */}
                        <div className="margin--little">
                            <Button icon="plus" text="Add attribute value" minimal intent="primary" onClick={() => setDialogProps(prevValues => { return { ...prevValues, isOpen: true, attribute, edit : false } })} />
                            
                            </div>
                        <div className="container--scroll-y-hide-x div--expand padding--medium" style={{maxHeight : "60vh"}}>
                        {/* {
                                attributeValues.map((attributeValue, attrValueIdx) =>{
                                    if (attrValueIdx === maxShown - 1) return <p>Not all attribute values {maxShown} / {numberAttributeValues} shown. Use search option.</p>
                                    if (attrValueIdx >= maxShown) return null 
                                    return <AttributeValueWithPropsTable key={`${attribute.tag}-${attributeValue.tag}`} {...attributeValue} handleEdit={() => handleEdit(attribute,attributeValue)} />
                                })} */}
                        </div>
                        </div> 
                }) : null}
                </div>  
                </div>
            </div>}
        </div>
    )
}

export default AdminAttributes