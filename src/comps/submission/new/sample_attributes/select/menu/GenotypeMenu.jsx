import { useEffect, useMemo, useState } from "react"
import { filterArrayBySearchString } from "../../../../../../services/arrays/filter"
import { Menu, MenuDivider, MenuItem } from "@blueprintjs/core"
import _ from "lodash"
import TextInput from "../../../../../core/input/Text"
import { GenotypeContainer } from "../../../../../admin/genotypes/GenotypeContainer"
import hooks from "@mitocube/api-hooks"
import useDebounce from "../../../../../../hooks/useDebounce"
import { GenotypeDescription } from "../../../../../admin/genotypes/GentotypeDescription"


function getPositionString(positionAttrValue) {

    if (_.isString(positionAttrValue.aa)) {
        return positionAttrValue.aa
    }
    else if (_.isArray(positionAttrValue.aa_position)) {
        if (positionAttrValue.aa_position.length > 1) return _.join(positionAttrValue.aa_position, "-")
        else return positionAttrValue.aa_position.at(0)
    }
    else if (positionAttrValue.aa_position === null && positionAttrValue.aa === null) {
        return positionAttrValue.attribute_value.text
    }
}

function extractGenotypeRepresentation(genotype) {
    if (!_.isArray(genotype.attributes)) return null 
    return <div>{genotype.attributes.map((attribute,attrIdx) => {
        const hasProteinMutation = _.has(attribute, "att_protein_position")
        const mutations = hasProteinMutation && _.has(attribute, "att_protein_mutation") ? attribute["att_protein_mutation"] : []
        const positions = attribute["att_protein_position"]
        const hasEditingMethod = _.has(attribute, "att_gene_editing_method") && _.isArray(attribute["att_gene_editing_method"]) && attribute["att_gene_editing_method"].length > 0
        const hasZygosity = _.has(attribute,"att_gene_zygosity") && _.isArray(attribute["att_gene_zygosity"]) && attribute["att_gene_zygosity"].length > 0

        return <div style={{fontSize : "0.7rem"}}><ul style={{listStyleType: "none",margin:"0px",padding:"0px"}}>
            <li>{genotype.proteome_id}</li>
            {hasEditingMethod ? <li>{attribute["att_gene_editing_method"][0].text} <strong>{attribute["att_gene_engineering"][0].text}</strong></li> : null}
            {hasZygosity ? <li><strong>{attribute["att_gene_zygosity"][0].text}</strong></li> : null}
            <li>{hasProteinMutation ? mutations.map(mutationAttrValue => {
                if (_.has(positions, mutationAttrValue.tag)) {
                    const positionAttrValue = positions[mutationAttrValue.tag]
                    return <li>{mutationAttrValue.text} : {getPositionString(positionAttrValue)}</li>
                }
            }) : null}</li></ul>
         {attrIdx > 0 ? <Divider /> : null}
        </div>
           
    })}
        
        </div>

}

export function GenotypeMenuItem({ genotype_tag, handleClick, handleFocus, index, modifiers, selectedRows }) {
    
    const {data : genotype_text, isSuccess} = hooks.genotypes.useGetGenotypeText({ genotype_tag })
    const {data : proteome_tag} = hooks.genotypes.useGetGenotypeProteome({ genotype_tag })
    
    const {data : proteome_name} = hooks.proteomes.useGetProteomeText({ tag: proteome_tag }, { enabled: !!proteome_tag })

    return <MenuItem text={isSuccess ? genotype_text : ""} 
        {...{onClick : (e) => handleClick(selectedRows, genotype_tag), onFocus : handleFocus}} 
        labelElement = {
        <div>
            {proteome_name && <div style={{fontSize: "0.8rem", fontWeight: "bold", color: "#106ba3", marginBottom: "4px"}}>{proteome_name}</div>}
            <GenotypeDescription tag={genotype_tag} />
        </div>}/>
}

//tODO make this connected to API instead of loading the genotypes first.
export function GenotypeContextMenu({ selectedRows, handleGenotypeSelection, proteome_tags, clearGenotypeColumn}) {
    
    const [queryString, setQueryString] = useState("")
    const search_string = useDebounce(queryString, 200)
    const {data : genotype_tags, refetch } = hooks.genotypes.useGetGenotypesBySearchString({search_string, limit : 20},{})
    
    useEffect(() => {
        const el = document.getElementById("genotype-input")
        el.focus()
    },[])

    
    return (
        <Menu style={{minWidth : "500px"}} onWheelCapture={e => e.stopPropagation()}>
            <MenuItem text="Genotypes" disabled={true} />
            {proteome_tags && proteome_tags.length > 0 && (
    <>
        <MenuItem text={`Proteomes: ${proteome_tags.join(", ")}`} disabled={true} style={{fontSize: "0.85rem"}} />
        <MenuDivider />
    </>
)}
            <TextInput
                id={"genotype-input"}
                    value={queryString}
                    callbackKey={"a"}
                    placeholder="Search genotype..."
                    onChange={(key,value,type) => setQueryString(value)}
                />
               
            <MenuDivider />
            <Menu style={{ overflowY: "scroll", maxHeight: "280px" }} onWheelCapture={e => e.stopPropagation()}>
                {_.isArray(genotype_tags)
                ? genotype_tags.map(genotype_tag => (
                    <GenotypeMenuItem
                        key={genotype_tag}
                        genotype_tag={genotype_tag}
                        handleClick={(rows, genotype_tag) => {
                            
                            handleGenotypeSelection(rows, genotype_tag)
                            
                            
                            const sample_tags = selectedRows.map(row => `${submission_tag}|${sampleNames[row]}`)
                            
                            if (sample_tags.length > 0) {
                                insertSampleGenotype.mutate(
                                    { sample_tags, genotype_tag },
                                    {
                                        onSuccess: () => setTimeout(() => refetch(), 100),
                                        onError: (error) => console.error("Failed:", error)
                                    }
                                )
                            }
                        }} 
                        selectedRows={selectedRows}
                    />

  ))
  : null}
            </Menu>
            <MenuDivider />
            <MenuItem text="Clear Selection" icon="clean" onClick={() => clearGenotypeColumn(selectedRows)}/>
        </Menu>
    )
}
