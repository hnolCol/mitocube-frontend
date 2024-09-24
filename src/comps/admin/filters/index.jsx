import { Button, ButtonGroup, InputGroup, TextArea } from "@blueprintjs/core";
import { AttributeValueInput } from "../../core/input/api/AttributeValueInput";
import { useState } from "react";
import TextInput from "../../core/input/Text";

import _ from "lodash"
import { usePostFilter } from "../../../hooks/queries/filter.hooks";
import APIError from "../../core/error/APIerror";
import { FilterSetView } from "./View";

const INIT_PROPS = {proteome_tags : [], description : "", text : "", publication : "", protein_tags : [], protein_tag_string  : ""}
export function AdminFilterSets({ }) {

    const [filterProps, setFilterProps] = useState(INIT_PROPS)
    const { mutate : postFilter, isLoading, isError, error, isSuccess, reset} = usePostFilter()

    /**
     * 
     * @param {import("react").ChangeEventHandler} e 
     */
    const handleProteinIDInput = (e) => {
        const value = e.target.value 
        const protein_tags = _.flatten(_.split(value, "\n").map(subString => subString.includes(";") ? _.split(subString, ";") : subString))
        setFilterProps(prevValues => {return {...prevValues, protein_tags, protein_tag_string : value}})

    }

    const handleChange = (callbackKey, value) => {
        
        setFilterProps(prevValues => {return {...prevValues, [callbackKey] : value}})
    }


    const submitFilter = () => {

        if ((isSuccess) && _.isEqual(filterProps,INIT_PROPS)) reset()

        const proteome_tag = filterProps.proteome_tags[0].tag 
        const props = {
            description: filterProps.description,
            protein_tags: filterProps.protein_tags,
            publication: filterProps.publication,
            proteome_tag : proteome_tag, 
            text : filterProps.text 
        }

        console.log(props)

        postFilter(props,{ 
            onSuccess: (data) => {
                setFilterProps(INIT_PROPS)
            } // reset probs on success 
        })
        
    }


    const disabledSubmit = filterProps.proteome_tags.length != 1 || filterProps.description.length === 0 || filterProps.protein_tags.length < 5 || filterProps.text.length == 0

    return (
        <div style={{ display: "grid", gridTemplateColumns : "400px 1fr", gridTemplateRows : "1fr", height : "100%"}}>
            <div style={{gridColumn : 1, gridRow : 1}}>
                <h3>Protein sets / filter</h3>
                <p>Protein sets are simply a list of proteins that can be used to quickly subset a dataset. For example, if you have a volcano plot you have the option to filter for proteins that are part of a particular set.</p>
                <p>In addition, the quality control (qc) panel will check for systematic shifts for the applicable sets (e.g. of the same proteome).</p>
                <p>The mimimum number of feature tags that have to be added is <strong>5</strong>. </p>
                <div>
                    <TextInput value={filterProps["text"]} callbackKey="text" placeholder="Provide a name for the filter." onChange={handleChange}/>
                    <AttributeValueInput attribute={{ tag: "att_proteome" }} selectedItems={filterProps.proteome_tags} onItemSelect={(attribute,attribute_value) => handleChange("proteome_tags",[attribute_value])} />
                    <TextInput value={filterProps["description"]} callbackKey="description" placeholder="Provide a description of the protein set." onChange={handleChange} />
                    <TextInput value={filterProps["publication"]} callbackKey="publication" placeholder="Provide the pubmed id of the associated publication(s)." onChange={handleChange} hint="Publication" isRequired={false} />
                    <TextArea value={filterProps.protein_tag_string} style={{ width: "100%", minHeight: "400px" }} placeholder="Paste Uniprot IDs, separated by a new line or/and semicolon." onChange={handleProteinIDInput} />
                    {filterProps.protein_tags.length > 0 ? <div>{filterProps.protein_tags.length} proteins detected.</div> : null}
                    <ButtonGroup fill style={{paddingTop : "1rem"}}>
                        <Button text="Submit" small intent="primary" fill loading={isLoading} disabled={disabledSubmit} onClick={submitFilter}/>
                        <Button icon="reset" small onClick={() => setFilterProps(INIT_PROPS)} disabled={isLoading} />
                    </ButtonGroup>
                    {isError ? <APIError error={error} /> : null}
                    {isSuccess ? <p>Successfully added the filter.</p> : null}
                </div>


            </div>
            <div style={{ gridColumn: 2, gridRow: 1}}>
                
                {

                    <FilterSetView />

                }



            </div>

        </div>
        
    )
}