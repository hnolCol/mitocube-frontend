
import _ from "lodash"
import { Combobox } from "../../core/input/Combobox"
import { Header } from "../../core/base/Header"
import { Select } from "@blueprintjs/select"
import { TagWithTooltip } from "../../core/base/tags/TagWithTooltip"
import { Button, InputGroup, Menu, MenuItem } from "@blueprintjs/core"
import { filterArrayBySearchString } from "../../../services/arrays/filter"
import SimpleTag from "../../core/base/tags/SimpleTag"
import NumericValueInput from "../../core/input/Numeric"
import { useMemo, useState } from "react"
import DeleteButton from "../../core/base/buttons/DeleteButton"
import TextInput from "../../core/input/Text"
import { createDataTree } from "../../../services/arrays/nest"
import { objectHasKey } from "../../../services/objects/checks"
import { useGetAnnotationsByFeatureID } from "../../../hooks/queries/feature.hooks"
import { splitStringByNCharacters } from "../../../services/format/string"
import {motion} from "framer-motion"
import AttributeInput from "./attribute/MultiSelectAttribute"
import SingleAttributeInput from "./attribute/SelectAttribute"


// export function AttributeSelection({ label, attribute, attributeValues, onSelection, selectedAttributeValue = undefined, entryIdx }) {
//     console.log(attributeValues,attribute)
//     const renderItem = (item, { handleClick, modifiers, index, query }) => {
//         const itemSelected = _.isObject(selectedAttributeValue)?item.tag === selectedAttributeValue.tag:false
//         return <MenuItem
//             icon={itemSelected?"tick":"blank"}
//             key={item.tag}
//             onClick={handleClick}
//             text={item.name}
//             active={modifiers.active}
//             disabled={modifiers.disabled}
//             multiline={true}
//             labelElement={<div style={{ width: "14rem", fontSize: "0.7rem", textAlign:"left"}}>{item.details}</div>} />
//     }

//     const filterItems = (query, items) => {
//         if (query.length < 2) return items 
//         const filteredItems = filterArrayBySearchString({ array:  items, searchString: query, searchColumns : ["tag","name","details"]})
//         return filteredItems
//     }
//     return <Select
//         fill={false}
//         items={attributeValues}
//         itemListPredicate={filterItems}
//         itemRenderer={renderItem}
//         onItemSelect={attributeValue => onSelection(label, attribute.tag, attributeValue, entryIdx)}
//         resetOnSelect={true}
//         >
//         <SimpleTag text={_.isObject(selectedAttributeValue)?selectedAttributeValue.name:attribute.name}/>
//     </Select>
// }



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


function AASequenceTruncation({ }) {
    return (<div className="flex center-items">
        <NumericValueInput placeholder="Start AA ..."/>
        <NumericValueInput placeholder="End AA ..." />
        </div>
    )
}



function Mutations({ }) {
    //mutation includes truncations/tags  

    return (
        <div>


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
            entryIdx,handleFeatureSelection
          }) {
    
    const hasChildNodes = attribute.childNodes.length > 0
    const allowFeatures = attribute.allow_features_as_values && !_.has(attributeValuesByID,attribute.id)
    const hasAttibuteData = _.isEmpty(prevAttribute) ? false : objectHasKey({ object: genotypeProps.attributes[entryIdx], keyName: attribute.tag }) 
    const hasSlectionValue = _.isObject(genotypeProps.attributes[entryIdx]) && _.has(genotypeProps.attributes[entryIdx],attribute.tag) && genotypeProps.attributes[entryIdx][attribute.tag].length > 0
    const childNode = attribute.childNodes[0]
                // handles only a signle child node! Set warnong 
    return (
        <div className="flex" style={{paddingTop:`${attrIdx*0.05}rem`}}>
            <SingleAttributeInput {...{
                attribute,
                attributeValues : allowFeatures?[]:attributeValues,
                onSelection,
                handleFeatureSelection,
                //label : genotypeLabel,
                //entryIdx,
                selectedAttributeValue: hasSlectionValue  ? genotypeProps.attributes[entryIdx][attribute.tag][0] : null
            }} />
            <div>
                {hasChildNodes && hasAttibuteData ? <GenotypeAttributeSelection attribute={childNode} attributeValues={attributeValuesByID[childNode.id]}
                    {...{attributeValuesByID, genotypeLabel, onSelection, genotypeProps, entryIdx}} prevAttribute={attribute} attrIdx={attrIdx+1}/> : null}
            </div>
        </div>
    )
}


function GenotypeRow({ attributes, nestedAttributes, attributeValuesByID, onSelection, genotypeLabel, genotypeProps, addGenotypeEntry, removeGenotypeEntry, authenticationStatus, handleFeatureSelection}) {
    const genotypeEntries = genotypeProps.attributes.length 


    return (
        <div>
            <div>Genotype Name : {genotypeProps.name}</div>
        {_.range(genotypeEntries).map(entryIdx => {
                return (
                    <div className="flex bg--white padding--little">
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
                                    prevAttribute : attribute
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

function PositionSelection({authenticationStatus, featureID}) {
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
            <p>Sequence</p>
            <div className="flex flex--wrap prevent-select" style={{ fontFamily: "monospace", fontSize : "0.9rem"}} onMouseLeave={handleMouseUp} onMouseUp={handleMouseUp}>
                
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
                                    // whileHover={isMouseDown ? {} : { y : -8 }}>
                                >
                                    {aa}
                                </motion.span>})}</div>
                        </div>
                    }):null}
                
            </div>
            <h3>{featureIsSuccess ? isRegionSelected ? `Selected region: ${minAAIndex + 1} (${feautreAnnotations.aa_sequence[minAAIndex]}) .... ${maxAAIndex} (${feautreAnnotations.aa_sequence[maxAAIndex]})` :
                `Selected AA: ${minAAIndex + 1} (${feautreAnnotations.aa_sequence[minAAIndex]})` : null}</h3>
        </div>
    )
}



function GenotypeGenerator({ index = 6, attributes, attributeValuesByID, onSelection, addGenotype, genotypes, addGenotypeEntry, removeGenotypeEntry, authenticationStatus, handleFeatureSelection}) {
    
    const nestedAttributes = createDataTree({ array: attributes, link: "parent_id" })
    return (
        
        <div className="bg--lightgrey padding--medium div--round intent-margin-top--little">
            <Header text={`${index}. Genotypes`} />
            <p>Please specifiy your genotypes. This section requires you to provide an organism before to select specific target protein. You are able to specify amino acid mutations and truncations as well as tags. If you are just using wild types, for exmaple knock-down of a gene expression in just wild type cells does not require the definition of a genotype. </p>
            <p>Once you have defined your genotypes, you will have to assign them to each sample below in the sample attributes. Once you defined your genotypes you will not have to enter it again and it is available from the drop-down menu.</p>
            {Object.keys(genotypes).map(genotypeLabel => {
                const genotypeProps = genotypes[genotypeLabel]
                return <GenotypeRow key={genotypes[genotypeLabel].label}
                    {...{ attributes, nestedAttributes, attributeValuesByID, onSelection, genotypeLabel, genotypeProps,addGenotypeEntry, removeGenotypeEntry, authenticationStatus, handleFeatureSelection}} />
            })}
                    

            <Button icon="plus" onClick={addGenotype} small={true} />
            {/* <PositionSelection {...{authenticationStatus,featureID : "Q96E52"}} /> */}
        </div>
    )
}


export default GenotypeGenerator