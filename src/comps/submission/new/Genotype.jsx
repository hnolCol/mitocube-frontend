
import _ from "lodash"
import { Button, Drawer, InputGroup } from "@blueprintjs/core"
import { useEffect, useMemo, useState } from "react"
import { createDataTree } from "../../../services/arrays/nest"
import { objectHasKey } from "../../../services/objects/checks"
import { useGetFeatureByTag, useGetSequenceByFeatureTag } from "../../../hooks/queries/feature.hooks"
import { splitStringByNCharacters } from "../../../services/format/string"
import {motion} from "framer-motion"
import SingleAttributeInput from "./attribute/select/SelectAttribute"

import TooltipButton from "../../core/base/buttons/TooltipButton"
import { getRandomID } from "../../../services/random"
import { addItemToArrayOrRemoveItIfPresent } from "../../../services/arrays/transforms"
import { usePostGenotype } from "../../../hooks/queries/genotype.hooks"
import { FeatureInput } from "../../core/input/api/FeatureInput"
import { GenotypeInfo } from "./GenotypeNomenclatureInfo"
import { constructGenotypeName } from "../../../services/genotypes"
import { useGetAttributeValues } from "../../../hooks/queries/attribute.hooks"


function GenotypeAttributeSelection({
            attrIdx = 0,
            attribute,
            //attributeValues,
            //attributeValuesByID,
            onSelection, level = 0,
            prevAttribute = {},
            genotypeProps,
            genotypeLabel = 0,
    entryIdx,
    handleFeatureSelection,
    handlePositionSelection,
    proteome_id,
    handleGenotypePositionSelection
          }) {
    
    const { data: attributeValues, isLoading, isFetching } = useGetAttributeValues({attribute_tag : attribute.tag})
    console.log(attributeValues)
    const hasChildNodes = attribute.childNodes.length > 0
    const allowFeatures = attribute.has_features_value 
    const hasAttibuteData = _.isEmpty(prevAttribute) ? false : objectHasKey({ object: genotypeProps.attributes[entryIdx], keyName: attribute.tag }) 
    const hasSlectionValue = _.isObject(genotypeProps.attributes[entryIdx]) && _.has(genotypeProps.attributes[entryIdx],attribute.tag) && _.isObject(genotypeProps.attributes[entryIdx][attribute.tag])
    const childNode = attribute.childNodes[0]
    
    /**
     * 
     * @param {import("../../../types/attributes").Attribute} attribute 
     * @param {import("../../../types/attributes").AttributeValue} attrValue 
     */
    const handleSelection = (attribute, attrValue, attrMutationValue,attrIdx) => {
        // change this. //handleGenotypePositionSelection

        const positionSelectionAttributeValue = attrValue.tag === "att_protein_position:aa" || attrValue.tag === "att_protein_position:region"
        if (positionSelectionAttributeValue) {
            handlePositionSelection(
                genotypeProps.attributes[entryIdx]["att_protein_coding_sequence"][0],
                attrValue.tag !== "att_protein_position:region",
                genotypeProps.attributes[entryIdx]["att_protein_mutation"][attrIdx].value === "substitution" || genotypeProps.attributes[entryIdx]["att_protein_mutation"][attrIdx].value === "insertion",
                handleGenotypePositionSelection,
                {genotypeLabel,entryIdx,attribute,attrValue,attrMutationValue} // if a substitution should be available to the user
                )
            onSelection(genotypeLabel,attribute.tag, attrValue, entryIdx, attrMutationValue, positionSelectionAttributeValue)
        }
        else {
            onSelection(genotypeLabel,attribute.tag, attrValue, entryIdx, attrMutationValue, positionSelectionAttributeValue)
        }
        
       
    }
    return (
        <div className="flex flex-column div--expand">
{/* genotypeProps.attributes[entryIdx]["att_protein_mutation"].length > 1 */}
            {prevAttribute.tag === "att_protein_mutation" ? <div>
                {genotypeProps.attributes[entryIdx]["att_protein_mutation"].map((attributeValue, attrIdx) => {

                    let selectedAttributeValues = []
                    const hasSelection = _.has(genotypeProps.attributes[entryIdx], [attribute.tag, attributeValue.tag])
                    if (hasSelection && attribute.tag !== "att_protein_position") {
                        selectedAttributeValues = genotypeProps.attributes[entryIdx][attribute.tag][0]
                    }
                    else if (hasSelection) {
                        selectedAttributeValues = [genotypeProps.attributes[entryIdx][attribute.tag][attributeValue.tag].attribute_value]
                    }
                    return <div key={`${attribute.tag}-${entryIdx}-${attributeValue.tag}`}
                        className="flex" style={{ width: "15rem" }}>
                        <div>{attributeValue.text}</div>
                            <SingleAttributeInput {...{
                            attribute,
                            attributeValues: attributeValues,
                            onItemSelect: (attribute, attrValue) => handleSelection(attribute, attrValue, attributeValue,attrIdx),
                            handleFeatureSelection,
                            featureSelectionProps: { genotypeLabel, entryIdx },
                            selectedItems: selectedAttributeValues,
                            matchTargetWidth: false,
                            selectedAttributeValue: selectedAttributeValues[0]
                        }} />
                    </div>
                })}
            </div> :
                allowFeatures ?
                    <FeatureInput {...{
                        attribute,
                        proteome_ids: [proteome_id],
                        onItemSelect: handleSelection,
                        selectedItems: genotypeProps.attributes[entryIdx][attribute.tag]
                    }} /> :
                <SingleAttributeInput {...{
                attribute,
                attributeValues: attributeValues,
                onItemSelect: handleSelection,
                //genotypeLabel, attributeTag, attributeValue, entryIdx = 0
                handleFeatureSelection,
                featureSelectionProps: { genotypeLabel, entryIdx },
                selectedItems: hasSlectionValue ? genotypeProps.attributes[entryIdx][attribute.tag] : [],
                //label : genotypeLabel,
                //entryIdx,
                matchTargetWidth: false,
                selectedAttributeValue: hasSlectionValue ? genotypeProps.attributes[entryIdx][attribute.tag][0] : null
            }} />}
            <div>
                {hasChildNodes && hasAttibuteData ? <GenotypeAttributeSelection
                    attribute={childNode}
                    //attributeValues={attributeValuesByID[childNode.id]}
                    {...{
                        //attributeValuesByID,
                        handleFeatureSelection,
                        handlePositionSelection,
                        genotypeLabel,
                        onSelection,
                        genotypeProps, entryIdx, handleGenotypePositionSelection
                    }} prevAttribute={attribute} attrIdx={attrIdx + 1} /> : null}
            </div>
        </div>
    )
}





function GenotypeRow({ attributes, nestedAttributes, attributeValuesByID, onSelection, genotypeLabel, genotypeProps, addGenotypeEntry, removeGenotypeEntry, handleFeatureSelection,handlePositionSelection, proteome_id, handleGenotypePositionSelection }) {
    const genotypeEntries = genotypeProps.attributes.length 

    return (
        <div className="bg--white">
            <h4>Name : {genotypeProps.text}</h4>
            {/* <div className="flex"><div>Protein coding sequence</div><div></div></div>
            <div className="flex"><div>Gene engineering</div><div></div></div>
            <div>Protein Mutation</div> */}
            <TooltipButton content={<p>Add genotype entry (for example to add a double KO or to define a rescue/reexpression of a protein/feature).</p>} icon="plus" small={true} intent="primary" onClick={() => addGenotypeEntry(genotypeLabel)} />
        <div className="flex">
        {_.range(genotypeEntries).map(entryIdx => {
                return (
                    <div className="bg--white padding--little" key={`genotype-row${entryIdx}`} style={{minWidth : "min(200px,90vw)"}}>
                        <p></p>
                        <div className="flex">
                            {nestedAttributes.map((attribute, attrIdx) => <GenotypeAttributeSelection
                                key={`genotype-row-${attribute.tag}-${attrIdx}-${entryIdx}`}
                                {...{
                                    attrIdx,
                                    attribute,
                                    //attributeValues: attributeValuesByID[attribute.id],
                                    handleFeatureSelection,
                                   // attributeValuesByID,
                                    genotypeProps,
                                    onSelection,
                                    genotypeLabel,
                                    entryIdx: entryIdx,
                                    prevAttribute: attribute,
                                    handlePositionSelection,
                                    proteome_id,
                                    handleGenotypePositionSelection
                                }} />)}
                        
                        </div>
                        <TooltipButton content={<p>Delete genotype entry.</p>} icon="minus" small={true} minimal={true} intent="danger" onClick={() => removeGenotypeEntry(genotypeLabel, entryIdx)} />
                        
                    </div>
                )
            })
                }
            </div>
            
            
            <hr/>
        </div>
        
    )
}

function GenotypeGenerator({ index = 6,
    attributes,
    attributeValuesByID,
    //onSelection,
    //addGenotype,
    genotypes,
    //addGenotypeEntry,
    //removeGenotypeEntry,
    handleFeatureSelection,
    handlePositionSelection,
    proteome_ids,
    refetchGenotypes}) {    
    const [genotype, setGenotype] = useState({})
    const [isDrawerOpen, setIsDrawerOpen] = useState()
    const nestedAttributes = createDataTree({ array: attributes, link: "parent_id" })
    const submitDisabled = _.isEmpty(genotype) || !_.isArray(genotype.attributes) || genotype.attributes.length === 0 || !_.isString(genotype.text) || !_.isString(genotype.proteome_id) // || _.some(_.map(genotype.attributes,  attrs => !_.isEmpty(attrs)))
    const { mutate, error, isError, isLoading, isFetching } = usePostGenotype({ enabled: !submitDisabled })
        
    useEffect(() => {setGenotype(prevValues => {return {...prevValues, proteome_id : proteome_ids[0]}})},[_.join(proteome_ids)])

    const addGenotype = () => {

        const genotypeLabel = getRandomID(5)
        let genotypeProps = {
            text: "",
            proteome_id : proteome_ids[0], //dangerous, rather get it from the features selection
            label : genotypeLabel,
            attributes: [{}],
        }
        setGenotype(genotypeProps)
    }


    const handleGenotypePositionSelection = (selectedPosition,selectedAA, substitutionAA, saveProps) => {

    
        const { genotypeLabel, entryIdx, attribute, attrValue, attrMutationValue } = saveProps
        const feature = genotype.attributes[entryIdx]["att_protein_coding_sequence"][0]
        let genotypeToModify = { ...genotype }
        let genotypeEntry = genotypeToModify.attributes[entryIdx]
   
        genotypeEntry[attribute.tag][attrMutationValue.tag].aa = selectedAA
        genotypeEntry[attribute.tag][attrMutationValue.tag].aa_position = selectedPosition
        if (substitutionAA.length > 0) {
            genotypeEntry[attribute.tag][attrMutationValue.tag].substitution = substitutionAA
            
        }
        
        genotypeToModify.attributes[entryIdx] = genotypeEntry
        genotypeToModify.text = constructGenotypeName(genotypeToModify.attributes)
        setGenotype(genotypeToModify)
    }

    const onAttibuteSelection = (genotypeLabel, attributeTag, attributeValue, entryIdx = 0, attrMutationValue = undefined, positionSelectionAttributeValue = false) => {
        
        let genotypeToModify = {...genotype} 
        let genotypeEntry = genotypeToModify.attributes[entryIdx]
        if (attributeTag === "att_protein_mutation") {
            //mutation can have multiple entries (e.g. a deletion and a flag tag)
            genotypeEntry[attributeTag] ??= []
            const attributeFound = genotypeEntry[attributeTag].includes(attributeValue)
            genotypeEntry[attributeTag] = addItemToArrayOrRemoveItIfPresent({ array: genotypeEntry[attributeTag], item: attributeValue })
            const proteinPosition = genotypeEntry["att_protein_position"]
            if (_.isObject(proteinPosition) && attributeFound) {
                delete genotypeEntry["att_protein_position"][attributeValue.tag]
                if (_.isEmpty(genotypeEntry["att_protein_position"])) {
                    delete genotypeEntry["att_protein_position"]
                }
            }
        }
        else if (attributeTag === "att_protein_position") {
            genotypeEntry[attributeTag] ??= {}
            genotypeEntry[attributeTag][attrMutationValue.tag] = { attribute_value: attributeValue, aa_position : undefined, substitution : undefined, aa : undefined}
            
        }

        else {
            genotypeEntry[attributeTag] = [attributeValue]
        }


        
        genotypeToModify.attributes[entryIdx] = genotypeEntry
        genotypeToModify.text = constructGenotypeName(genotypeToModify.attributes)
        setGenotype(genotypeToModify)
    }
    const removeGenotypeEntry = (entryIdx) => {
        if (_.isEmpty(genotype) || !_.has(genotype, "attributes")) return 
        let genotypeToModify = {...genotype}
        let genotypeAttrs = genotypeToModify.attributes
        if (genotypeAttrs.length === 1) {
            genotypeAttrs = [{}]
        }
        else {
            genotypeAttrs = genotypeAttrs.filter((attrs,idx) => idx !== entryIdx && _.isEmpty(attrs))
        }
        genotypeToModify.attributes = genotypeAttrs
        genotypeToModify.text = constructGenotypeName(genotypeAttrs)
        setGenotype(genotypeToModify)
    }

    const addGenotypeEntry = () => {
        let genotypeToModify = {...genotype}
        let genotypeAttrs = _.concat(genotypeToModify.attributes, [{}])
        genotypeToModify.attributes = genotypeAttrs
        setGenotype(genotypeToModify)
    }


    const submitGenotype = () => {
        const features = genotype.attributes.map(attrValue => attrValue["att_protein_coding_sequence"][0])
        let genotypeToSubmit = { ...genotype }
        genotypeToSubmit["features"] = features
        mutate({ genotype: genotypeToSubmit }, {
            onSuccess: (data) => {
                setGenotype({})
                refetchGenotypes()

            }
        })
    }
    //console.log(genotype)
    return (
        
        <div className="bg--lightgrey padding--medium div--round intent-margin-toplittle">
            <Drawer isOpen={isDrawerOpen} isCloseButtonShown={true} title="Protein mutation nomenclature" onClose={() => setIsDrawerOpen(false)} children={<GenotypeInfo />} />
            <h3>{`${index}. Genotypes`}</h3>
            <p>Please specify your genotypes. This section requires you to provide an organism before to select specific target protein. You are able to specify amino acid mutations and truncations as well as tags. If you are just using wild types, for example knock-down of a gene expression in just wild type cells does not require the definition of a genotype. </p>
            <p>Note that in case of a knockout and a reexpression of a protein, you need to define first the knockout and then the reexpression. Once you have defined your genotypes, you will have to assign them to each sample below in the sample attributes. Once you defined your genotypes, they are available from the drop-down menu for future submissions.</p>
            <p>The selected proteome is: <strong>{genotype.proteome_id}</strong></p>
            <div style={{ overflowX: "scroll" }}>
                {_.has(genotype ,"label") ? <GenotypeRow key={genotype.label}
                    {...{
                        attributes,
                        nestedAttributes,
                        attributeValuesByID,
                        onSelection: onAttibuteSelection,
                        genotypeLabel : genotype.label,
                        genotypeProps : genotype,
                        addGenotypeEntry,
                        removeGenotypeEntry,
                        handleFeatureSelection,
                        handlePositionSelection,
                        proteome_id: proteome_ids[0],
                        handleGenotypePositionSelection
                    }} /> : null}
            
            </div>    

            <Button icon={!_.has(genotype, "attributes") ? "plus" : "reset"} onClick={addGenotype} small={true} />
            <Button small={true} icon="info-sign" onClick={() => setIsDrawerOpen(true)}/>
            <Button small={true} text="Save" onClick={submitGenotype} disabled={submitDisabled} loading={isLoading || isFetching} />
        </div>
    )
}


export default GenotypeGenerator