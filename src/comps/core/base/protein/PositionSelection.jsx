import { motion } from "framer-motion"
import { useGetFeatureByTag, useGetSequenceByFeatureTag } from "../../../../hooks/queries/feature.hooks"
import _ from "lodash"
import { splitStringByNCharacters } from "../../../../services/format/string"
import { useMemo, useState } from "react"
import { Button, InputGroup } from "@blueprintjs/core"

const AMINO_ACIDS = new Set(["A","G","C","T","S","W","Y","N","D","E","I","L","M","V","P","F","H","K","R","Q"])

/**
 * @description JSX Component that fetches the protein sequence from the data base and then
 * displays it. The user can select a range and also define a substitution. It is intended 
 * to define genotype based alterations to a protein. 
 * @param {Object} props 
 * @param {String} props.feature_tag 
 * @param {Boolean} props.singlePosition 
 * @param {Boolean} props.aaSubstitution 
 * @param {Function} props.onSave 
 * @param {Function} props.onClose 
 * @param {Function} props.onSaveProps 
 * @returns 
 */
export function PositionSelection({feature_tag, singlePosition  = true, aaSubstitution = true, onSave, onSaveProps, onClose}) {
    // Select a position in 
    const { data, isSuccess: featureIsSuccess } = useGetSequenceByFeatureTag({ feature_tag })
    const {data : feature } = useGetFeatureByTag({tag : feature_tag})
    const featureSequence = _.isArray(data) && data.length > 0 ?  data[0] : {}
    const [isMouseDown, setMouseDown] = useState(false)
    const [selectedAAPos, setselectedAAPos] = useState([])
    const [substitutionAA, setSubstitutionAA] = useState("")
    
    const splitSequence = useMemo(() => featureIsSuccess && _.has(featureSequence,"sequence")  ? splitStringByNCharacters(featureSequence.sequence) : [],[featureIsSuccess])
    const isRegionSelected = selectedAAPos.length == 2
    const isSingleAASelected = selectedAAPos.length == 1
    const minAAIndex = _.min(selectedAAPos)
    const maxAAIndex = _.max(selectedAAPos)
    const handleClick = (e, aaPosition) => {
        // handle click on a amino acid 
        if (e.shiftKey) {
            let aaIndcs = _.sortedUniq([selectedAAPos[0], aaPosition])
            setselectedAAPos(aaIndcs)
        }
        else {
            setselectedAAPos([aaPosition])
        }
    }

    const handleMouseDown = (e, aaPosition) => {
        //handle a mouse down 
        if (e.shiftKey) return
        if (!isMouseDown) {
            setselectedAAPos([aaPosition])
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
            aaIndcs = [selectedAAPos[0], aaPosition]
        }
        else {
            aaIndcs = [aaPosition]
        }
        setselectedAAPos(aaIndcs)
    }
    const handleSubAAEntry = (value) => {
        
        if (value.length === 0) setSubstitutionAA("")

        let v = value.toUpperCase()
        
        if (singlePosition && AMINO_ACIDS.has(v[0])) setSubstitutionAA(v[0])
        else if (!singlePosition) {
            //split and check for valid AAs then join again.
            setSubstitutionAA(_.join(v.split("").filter(c => AMINO_ACIDS.has(c)),""))
        }
        else setSubstitutionAA("")
    }

    const handleSelection = () => {
        let selectedAA = singlePosition ?  [featureSequence.sequence[minAAIndex]] : [featureSequence.sequence[minAAIndex],featureSequence.sequence[maxAAIndex]]
        let positions = singlePosition ? [selectedAAPos[0]+1] : [selectedAAPos[0]+1,selectedAAPos[1]+1]
        onSave(positions.filter(n => _.isFinite(n)), selectedAA, substitutionAA, onSaveProps)
        onClose()
    }

    
    return (
        <div >
        

            {_.isObject(feature) ? <h3>Amino acid sequence {feature.gene_name} ({feature.length} aa)</h3> : null }
            {singlePosition ? <p>Select the exact amino acid position.</p> : <p> Select an amino acid region.</p>}
            <div className="flex flex--wrap prevent-select" style={{ fontFamily: "monospace", fontSize : "0.8rem", height : "50vh", overflowY : "scroll"}} onMouseLeave={handleMouseUp} onMouseUp={handleMouseUp}>
                
                    {featureIsSuccess ? splitSequence.map((splitSeq, idx) => {
                        return <div key={`${splitSeq}-${idx}`} className="bg--white" style={{ margin: "0.2rem", height : "2.2rem" }}>
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
            <h4>{featureIsSuccess ? isRegionSelected ? `Selected region: ${minAAIndex + 1} (${featureSequence.sequence[minAAIndex]}) .... ${maxAAIndex+1} (${featureSequence.sequence[maxAAIndex]})` :
                `Selected AA: ${minAAIndex + 1} (${featureSequence.sequence[minAAIndex]})` : null}</h4>
            {aaSubstitution ? <InputGroup placeholder="Amino acid" onValueChange={handleSubAAEntry} value={substitutionAA} /> : null}
            <Button text="Save" intent="primary" onClick={handleSelection} disabled={!(featureIsSuccess && selectedAAPos.length > 0) || aaSubstitution && substitutionAA.length === 0} />
        </div>
    )
}