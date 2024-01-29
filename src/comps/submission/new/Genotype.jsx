
import _ from "lodash"
import { Button, InputGroup, MenuItem } from "@blueprintjs/core"
import NumericValueInput from "../../core/input/Numeric"
import { useMemo, useState } from "react"
import { createDataTree } from "../../../services/arrays/nest"
import { objectHasKey } from "../../../services/objects/checks"
import { useGetAnnotationsByFeatureID, useGetFeatureByQuery, useGetSequenceByFeatureKey } from "../../../hooks/queries/feature.hooks"
import { splitStringByNCharacters } from "../../../services/format/string"
import {motion} from "framer-motion"
import SingleAttributeInput from "./attribute/select/SelectAttribute"
import { Select, Suggest } from "@blueprintjs/select"
import useDebounce from "../../../hooks/useDebounce"
import { FeatureInput } from "./features/FeatureInput"
import TooltipButton from "../../core/base/buttons/TooltipButton"
import { getRandomID } from "../../../services/random"
import { addItemToArrayIfNotPresent, addItemToArrayOrRemoveItIfPresent } from "../../../services/arrays/transforms"
import { usePostGenotype } from "../../../hooks/queries/genotype.hooks"



function AASequencePositionMutation({ }) {
    return (<div className="flex center-items">
        <AttributeSelection
            attribute={{ name: "wt AA", tag: "att_aa" }}
            attributeValues={[{ name: "Leucine", tag: "att_aa: L" }, { name: "Isoleucine", tag: "att_aa: I" }, { name: "Serine", tag: "att_aa: S" }]}
        />
        <NumericValueInput placeholder="Enter AA position ..."/>
        <AttributeSelection
            attribute={{ name: "mutant AA", tag: "att_aa" }}
            attributeValues={[{ name: "Leucine", tag: "att_aa: L" }, { name: "Isoleucine", tag: "att_aa: I" }, { name: "Serine", tag: "att_aa: S" }]}
        />
        </div>
    )
}



function GenotypeAttributeSelection({
            attrIdx = 0,
            attribute,
            attributeValues,
            attributeValuesByID,
            onSelection, level = 0,
            prevAttribute = {},
            genotypeProps,
            genotypeLabel = 0,
    entryIdx,
    handleFeatureSelection,
    handlePositionSelection,
    proteome_id
          }) {
    
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
    const handleSelection = (attribute, attrValue, attrMutationValue) => {
        
        // change this.
        if (attrValue.tag === "att_protein_position:aa" || attrValue.tag === "att_protein_position:region") {
            handlePositionSelection(
                genotypeProps.attributes[entryIdx]["att_protein_coding_sequence"][0],
                !attrValue.tag === "att_protein_position:region",
                genotypeProps.attributes[entryIdx]["att_protein_mutation"][0].value === "substitution" // if a substitution should be available to the user 
                )
            onSelection(genotypeLabel,attribute.tag, attrValue, entryIdx, attrMutationValue)
        }
        else {
            onSelection(genotypeLabel,attribute.tag, attrValue, entryIdx, attrMutationValue)
        }
        
       
    }
    return (
        <div className="flex flex-column div--expand">
            {prevAttribute.tag === "att_protein_mutation" && genotypeProps.attributes[entryIdx]["att_protein_mutation"].length > 1 ? <div>
                {genotypeProps.attributes[entryIdx]["att_protein_mutation"].map(attributeValue => {
                    return <div className="flex" style={{width : "15rem"}}><div>{attributeValue.text}</div><SingleAttributeInput {...{
                        attribute,
                        attributeValues: attributeValues,
                        onItemSelect: (attribute, attrValue) => handleSelection(attribute, attrValue, attributeValue),
                        //genotypeLabel, attributeTag, attributeValue, entryIdx = 0
                        handleFeatureSelection,
                        featureSelectionProps: { genotypeLabel, entryIdx },
                        selectedItems: hasSlectionValue ? genotypeProps.attributes[entryIdx][attribute.tag][attributeValue.tag] : [],
                        //label : genotypeLabel,
                        //entryIdx,
                        matchTargetWidth: false,
                        selectedAttributeValue: hasSlectionValue ? genotypeProps.attributes[entryIdx][attribute.tag][0] : null
                    }} /></div>
                })}
            </div> :
                allowFeatures ?
                    <FeatureInput {...{ attribute, proteome_id, onItemSelect: handleSelection, selectedItems: genotypeProps.attributes[entryIdx][attribute.tag] }} /> :
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
                    attributeValues={attributeValuesByID[childNode.id]}
                    {...{
                        attributeValuesByID,
                        handleFeatureSelection,
                        handlePositionSelection,
                        genotypeLabel,
                        onSelection,
                        genotypeProps, entryIdx
                    }} prevAttribute={attribute} attrIdx={attrIdx + 1} /> : null}
            </div>
        </div>
    )
}





export function PositionSelection({feature, singlePosition  = true, aaSubstitution = true, onSelection, onClose}) {
    // Select a position in 
    const { data: featureSequence, isSuccess: featureIsSuccess } = useGetSequenceByFeatureKey({feature})
    const [isMouseDown, setMouseDown] = useState(false)
    const [selectedAA, setSelectedAA] = useState([])
    
    const splitSequence = useMemo(() => featureIsSuccess  ? splitStringByNCharacters(featureSequence.sequence) : [],[featureIsSuccess])
    const isRegionSelected = selectedAA.length == 2
    const isSingleAASelected = selectedAA.length == 1

    const handleClick = (e, aaPosition) => {
        // handle click on a amino acid 
        if (e.shiftKey) {
            let aaIndcs = _.sortedUniq([selectedAA[0], aaPosition])
            setSelectedAA(aaIndcs)
        }
        else {
            setSelectedAA([aaPosition])
        }
    }

    const handleMouseDown = (e, aaPosition) => {
        //handle a mouse down 
        if (e.shiftKey) return
        if (!isMouseDown) {
            setSelectedAA([aaPosition])
        }
        setMouseDown(true)
    }

    const handleMouseUp = (e) => {
        setMouseDown(false)
    }
    const handleMouseEnter = (e, aaPosition) => {
        if (e.buttons === 0) return 
        if (!isMouseDown) return 
        let aaIndcs = []
        if (isRegionSelected || isSingleAASelected) {
            aaIndcs = [selectedAA[0], aaPosition]
        }
        else {
            aaIndcs = [aaPosition]
        }
        setSelectedAA(aaIndcs)
    }

    const handleSelection = () => {
        onClose()
    }

    const minAAIndex = _.min(selectedAA)
    const maxAAIndex = _.max(selectedAA)
    return (
        <div>
            <h3>Amino acid sequence {feature.genes} ({feature.length} aa)</h3>
            {singlePosition ? <p>Select the exact amino acid position.</p> : <p> Select an amino acid region.</p>}
            <div className="flex flex--wrap prevent-select" style={{ fontFamily: "monospace", fontSize : "0.8rem", height : "50vh", overflowY : "scroll"}} onMouseLeave={handleMouseUp} onMouseUp={handleMouseUp}>
                
                    {featureIsSuccess ? splitSequence.map((splitSeq, idx) => {
                        return <div key={`${splitSeq}-${idx}`} className="bg--white" style={{ margin: "0.4rem" }}>
                            <div className="flex justify-end" style={{fontSize:"0.7rem"}}><div>{(idx) * 10 + splitSeq.length}</div></div>
                            <div className="flex justify-end" style={{fontSize:"0.5rem"}}><div>|</div></div>
                            <div className="flex" style={{ cursor: "crosshair" }}>{splitSeq.split("").map((aa, aaIdx) =>{
                                let aminoAcidPosition = idx * 10 + (aaIdx)
                                const isAAPosSelected = isRegionSelected? _.inRange(aminoAcidPosition,minAAIndex,maxAAIndex+1) : isSingleAASelected && minAAIndex == aminoAcidPosition
                                return <motion.span key={`${aminoAcidPosition}-${aa}`} className="intent-padding-bottom--smallest"
                                    style={{backgroundColor : isAAPosSelected ? "#466688" : "#ffffff", color : isAAPosSelected ? "white":"black"}}
                                    onClick={(e) => handleClick(e,aminoAcidPosition)}
                                    onMouseDown={singlePosition ? undefined : e => handleMouseDown(e,aminoAcidPosition)}
                                    onMouseUp={singlePosition ? undefined : handleMouseUp}
                                    onMouseEnter={(e) => handleMouseEnter(e,aminoAcidPosition)}
                                >
                                    {aa}
                                </motion.span>})}</div>
                        </div>
                    }):null}
                
            </div>
            <h4>{featureIsSuccess ? isRegionSelected ? `Selected region: ${minAAIndex + 1} (${featureSequence.sequence[minAAIndex]}) .... ${maxAAIndex} (${featureSequence.sequence[maxAAIndex]})` :
                `Selected AA: ${minAAIndex + 1} (${featureSequence.sequence[minAAIndex]})` : null}</h4>
            {aaSubstitution ? <InputGroup placeholder="Amino acid" /> : null}
            <Button text="Save" intent="primary" onClick={handleSelection} disabled={!(featureIsSuccess && selectedAA.length > 0)} />
        </div>
    )
}

function GenotypeRow({ attributes, nestedAttributes, attributeValuesByID, onSelection, genotypeLabel, genotypeProps, addGenotypeEntry, removeGenotypeEntry, handleFeatureSelection,handlePositionSelection, proteome_id }) {
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
                    <div className="bg--white padding--little" key={`genotype-row${entryIdx}`} style={{minWidth : "33vw"}}>
                        <p></p>
                        <div className="flex">
                            {nestedAttributes.map((attribute, attrIdx) => <GenotypeAttributeSelection
                                key={`genotype-row-${attribute.tag}-${attrIdx}-${entryIdx}`}
                                {...{
                                    attrIdx,
                                    attribute,
                                    attributeValues: attributeValuesByID[attribute.id],
                                    handleFeatureSelection,
                                    attributeValuesByID,
                                    genotypeProps,
                                    onSelection,
                                    genotypeLabel,
                                    entryIdx: entryIdx,
                                    prevAttribute: attribute,
                                    handlePositionSelection,
                                    proteome_id
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
    proteome_id,
    refetchGenotypes}) {    
    const [genotype, setGenotype] = useState({})
   
    const nestedAttributes = createDataTree({ array: attributes, link: "parent_id" })
    const submitDisabled = _.isEmpty(genotype) || genotype.attributes.length === 0 || !_.isString(genotype.text) || !_.isString(genotype.proteome_id) || _.some(_.map(genotype.attributes,  attrs => _.isEmpty(attrs)))
    const {mutate, error, isError, isLoading, isFetching}  = usePostGenotype({enabled : !submitDisabled})


    const addGenotype = () => {

        const genotypeLabel = getRandomID(5)
        let genotypeProps = {
            name: "",
            proteome_id,
            label : genotypeLabel,
            attributes: [{}]
        }
        setGenotype(genotypeProps)
    }

    /**
     * 
     * @param {Object.<string, import("../../../types/feature").Feature | import("../../../types/attributes").AttributeValue>[]} genotypeAttributes 
     * @returns 
     */
    const constructGenotypeName = (genotypeAttributes) => {
        let baseName = ""
        const genotypeTexts = _.map(genotypeAttributes, (genotypeEntryAttributes, entryIdx) => {
            let entryName = ""
            if (_.isEmpty(genotypeEntryAttributes)) return ""
            entryName += genotypeEntryAttributes["att_protein_coding_sequence"][0].genes.split(" ").at(0)

            if (_.has(genotypeEntryAttributes, "att_gene_engineering")) {
                const geneEngineeringAttribute = genotypeEntryAttributes["att_gene_engineering"][0]

                if (geneEngineeringAttribute.text === "Knockout") {
                    entryName += "-KO"
                }
                else if (geneEngineeringAttribute.text === "Knockin") {
                    entryName += "-KI"
                }
            }

            if (_.has(genotypeEntryAttributes, "att_protein_mutation") && genotypeEntryAttributes["att_protein_mutation"].length > 0) {
                console.log(genotypeEntryAttributes["att_protein_mutation"])
                const proteinMutationAttribute = genotypeEntryAttributes["att_protein_mutation"][0]
                if (proteinMutationAttribute.text.endsWith("tag")) {
                    const tagName = proteinMutationAttribute.value.toUpperCase()
                    if (_.has(genotypeEntryAttributes, "att_protein_position")) {
                        //if position is know, add it in front or after.
                        const positionAttribute = genotypeEntryAttributes["att_protein_position"][0]
                        if (positionAttribute.text === "N-term") {
                            entryName = tagName + "-" + entryName
                        }
                        else if (positionAttribute.text === "C-term") {
                            entryName = entryName += "-" + tagName
                        }
                    }
                    else {
                        entryName += "-" + tagName
                    }
                }
                else if (proteinMutationAttribute.text === "Truncation") {
                    entryName += "\u0394"
                }
            }
            console.log(genotypeEntryAttributes["att_gene_zygosity"])
            if (_.has(genotypeEntryAttributes, "att_gene_zygosity") && genotypeEntryAttributes["att_gene_zygosity"][0].value !== "unknown") {
                entryName += genotypeEntryAttributes["att_gene_zygosity"][0].value
            }
            
            if (entryIdx > 0) {
                baseName += " " + entryName
            }
            else {
                baseName += entryName
            }
            
        })
        
        return baseName
    }

    const onAttibuteSelection = (genotypeLabel, attributeTag, attributeValue, entryIdx = 0, attrMutationValue = undefined) => {
        
        let genotypeToModify = {...genotype} 
        let genotypeEntry = genotypeToModify.attributes[entryIdx]
        if (attributeTag === "att_protein_mutation") {
            genotypeEntry[attributeTag] ??= []
            genotypeEntry[attributeTag] = addItemToArrayOrRemoveItIfPresent({array : genotypeEntry[attributeTag], item : attributeValue})
        }
        else if (_.isObject(attrMutationValue) && _.isObject(attributeValue)) {
            genotypeEntry[attributeTag] ??= {}
            genotypeEntry[attributeTag][attrMutationValue.tag] = [attributeValue]
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
            genotypeAttrs = genotypeAttrs.filter((attrs,idx) => idx !== entryIdx)
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

    return (
        
        <div className="bg--lightgrey padding--medium div--round intent-margin-top--little">
            <h3>{`${index}. Genotypes`}</h3>
            <p>Please specify your genotypes. This section requires you to provide an organism before to select specific target protein. You are able to specify amino acid mutations and truncations as well as tags. If you are just using wild types, for example knock-down of a gene expression in just wild type cells does not require the definition of a genotype. </p>
            <p>Note that in case of a knockout and a reexpression of a protein, you need to define first the knockout and then the reexpression. Once you have defined your genotypes, you will have to assign them to each sample below in the sample attributes. Once you defined your genotypes, they are available from the drop-down menu for future submission.</p>
            <div>
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
                        proteome_id
                    }} /> : null}
            
            </div>    

            <Button icon="plus" onClick={addGenotype} small={true} />
            <Button small={true} text="Save" onClick={submitGenotype} disabled={submitDisabled} loading={isLoading || isFetching} />
            {/* <PositionSelection {...{authenticationStatus,featureID : "Q96E52"}} /> */}
        </div>
    )
}


export default GenotypeGenerator