
import _ from "lodash"
import { Button } from "@blueprintjs/core"
import NumericValueInput from "../../core/input/Numeric"
import { useMemo, useState } from "react"
import { createDataTree } from "../../../services/arrays/nest"
import { objectHasKey } from "../../../services/objects/checks"
import { useGetAnnotationsByFeatureID } from "../../../hooks/queries/feature.hooks"
import { splitStringByNCharacters } from "../../../services/format/string"
import {motion} from "framer-motion"
import SingleAttributeInput from "./attribute/select/SelectAttribute"



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
    entryIdx, handleFeatureSelection,
    handlePositionSelection 
          }) {
    
    const hasChildNodes = attribute.childNodes.length > 0
    const allowFeatures = attribute.allow_features_as_values && !_.has(attributeValuesByID,attribute.id)
    const hasAttibuteData = _.isEmpty(prevAttribute) ? false : objectHasKey({ object: genotypeProps.attributes[entryIdx], keyName: attribute.tag }) 
    const hasSlectionValue = _.isObject(genotypeProps.attributes[entryIdx]) && _.has(genotypeProps.attributes[entryIdx],attribute.tag) && genotypeProps.attributes[entryIdx][attribute.tag].length > 0
    const childNode = attribute.childNodes[0]
                // handles only a signle child node! Set warnong 
    
    const handleSelection = (attribute, attrValue) => {
       
        // change this.
        if (attrValue.tag === "att_protein_position:aa" || attrValue.tag === "att_protein_position:region") {
            handlePositionSelection("Q96E52")
            onSelection(genotypeLabel,attribute.tag, attrValue, entryIdx)
        }
        else {
            onSelection(genotypeLabel,attribute.tag, attrValue, entryIdx)
        }
        
       
    }
    return (
        <div className="flex">
            <SingleAttributeInput {...{
                attribute,
                attributeValues : allowFeatures?[]:attributeValues,
                onItemSelect: handleSelection,
                //genotypeLabel, attributeTag, attributeValue, entryIdx = 0
                handleFeatureSelection,
                featureSelectionProps: { genotypeLabel, entryIdx },
                selectedItems : hasSlectionValue  ? genotypeProps.attributes[entryIdx][attribute.tag] : [],
                //label : genotypeLabel,
                //entryIdx,
                matchTargetWidth : false,
                selectedAttributeValue: hasSlectionValue  ? genotypeProps.attributes[entryIdx][attribute.tag][0] : null
            }} />
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


function GenotypeRow({ attributes, nestedAttributes, attributeValuesByID, onSelection, genotypeLabel, genotypeProps, addGenotypeEntry, removeGenotypeEntry, authenticationStatus, handleFeatureSelection,handlePositionSelection }) {
    const genotypeEntries = genotypeProps.attributes.length 

    return (
        <div>
            {/* <div>Genotype Name : {genotypeProps.name}</div> */}
        {_.range(genotypeEntries).map(entryIdx => {
                return (
                    <div className="flex bg--white padding--little" key={`genotype-row${entryIdx}`} style={{width : "100%"}}>
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
                                    handlePositionSelection 
                                }} />)}
                        
                        </div>
                        <Button icon="minus" small={true} minimal={true} intent="danger" onClick={() => removeGenotypeEntry(genotypeLabel, entryIdx)} />
                        
                    </div>
                )
            })
                }
               
            <Button icon="plus" small={true} minimal={true} intent="primary" onClick={() => addGenotypeEntry(genotypeLabel)} />
            <hr/>
        </div>
        
    )
}

export function PositionSelection({authenticationStatus, featureID, onSelection, onClose}) {
    // Select a position in 
    const {data : feautreAnnotations, isSuccess : featureIsSuccess} = useGetAnnotationsByFeatureID({featureID,tokenString : authenticationStatus.token})
    const [isMouseDown, setMouseDown] = useState(false)
    const [selectedAA, setSelectedAA] = useState([])
    
    const splitSequence = useMemo(() => featureIsSuccess  ? splitStringByNCharacters(feautreAnnotations.aa_sequence) : [],[featureIsSuccess])
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

    // const aaSorted = selectedAA.slice().sort().reverse()
    //  console.log(selectedAA,aaSorted)
    // const aasSorted = isRegionSelected ? selectedAA.slice().sort() : selectedAA
    // console.log(aasSorted)
    // console.log(isSingleAASelected)
    // console.log(selectedAA)
    const minAAIndex = _.min(selectedAA)
    const maxAAIndex = _.max(selectedAA)
    return (
        <div>
            <h4>Sequence</h4>
            <p>Select the amino acid position or region.</p>
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
                                    onMouseDown={e => handleMouseDown(e,aminoAcidPosition)}
                                    onMouseUp={handleMouseUp}
                                    onMouseEnter={(e) => handleMouseEnter(e,aminoAcidPosition)}
                                >
                                    {aa}
                                </motion.span>})}</div>
                        </div>
                    }):null}
                
            </div>
            <h4>{featureIsSuccess ? isRegionSelected ? `Selected region: ${minAAIndex + 1} (${feautreAnnotations.aa_sequence[minAAIndex]}) .... ${maxAAIndex} (${feautreAnnotations.aa_sequence[maxAAIndex]})` :
                `Selected AA: ${minAAIndex + 1} (${feautreAnnotations.aa_sequence[minAAIndex]})` : null}</h4>
            <Button text="Save" intent="primary" onClick={handleSelection} disabled={!(featureIsSuccess && selectedAA.length > 0)} />
        </div>
    )
}


function GenotypeGenerator({ index = 6,
    attributes,
    attributeValuesByID,
    onSelection,
    addGenotype,
    genotypes,
    addGenotypeEntry,
    removeGenotypeEntry,
    authenticationStatus,
    handleFeatureSelection,
    handlePositionSelection }) {    
    const nestedAttributes = createDataTree({ array: attributes, link: "parent_id" })
    return (
        
        <div className="bg--lightgrey padding--medium div--round intent-margin-top--little">
            <h3>{`${index}. Genotypes`}</h3>
            <p>Please specifiy your genotypes. This section requires you to provide an organism before to select specific target protein. You are able to specify amino acid mutations and truncations as well as tags. If you are just using wild types, for example knock-down of a gene expression in just wild type cells does not require the definition of a genotype. </p>
            <p>Once you have defined your genotypes, you will have to assign them to each sample below in the sample attributes. Once you defined your genotypes, they are available from the drop-down menu for future submission.</p>
            {Object.keys(genotypes).map(genotypeLabel => {
                const genotypeProps = genotypes[genotypeLabel]
                return <GenotypeRow key={genotypes[genotypeLabel].label}
                    {...{
                        attributes,
                    nestedAttributes,
                    attributeValuesByID,
                    onSelection,
                    genotypeLabel,
                    genotypeProps,
                    addGenotypeEntry,
                    removeGenotypeEntry,
                    authenticationStatus,
                    handleFeatureSelection,
                    handlePositionSelection 
                    }} />
            })}            

            <Button icon="plus" onClick={addGenotype} small={true} />
            {/* <PositionSelection {...{authenticationStatus,featureID : "Q96E52"}} /> */}
        </div>
    )
}


export default GenotypeGenerator