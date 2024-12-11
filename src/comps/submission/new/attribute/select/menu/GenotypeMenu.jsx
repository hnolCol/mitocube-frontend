import { useEffect, useMemo, useState } from "react"
import { filterArrayBySearchString } from "../../../../../../services/arrays/filter"
import { Menu, MenuDivider, MenuItem } from "@blueprintjs/core"
import _ from "lodash"
import TextInput from "../../../../../core/input/Text"







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

//tODO make this connected to API instead of loading the genotypes first.
export function GenotypeContextMenu({ genotypes, selectedRows, handleGenotypeSelection, proteome_ids, clearGenotypeColumn  }) {
    
    const [queryString, setQuery] = useState("")
    let genotpesBySearchQuery = useMemo(() => queryString === "" ? genotypes : filterArrayBySearchString({
        searchString: queryString,
        array: genotypes,
        keyNames: ["text"]
    }), [queryString])

    
    useEffect(() => {
        const el = document.getElementById("genotype-input")
        el.focus()
    },[])

    return (
        <Menu style={{minWidth : "500px"}} onWheelCapture={e => e.stopPropagation()}>
            <MenuItem text="Genotypes" disabled={true} />
            <TextInput
                id={"genotype-input"}
                    value={queryString}
                    callbackKey={"a"}
                    placeholder="Search genotype..."
                    onChange={(key,value,type) => setQuery(value)}
                    
                />
            <MenuDivider />
            <Menu style={{ overflowY: "scroll", maxHeight: "280px" }} onWheelCapture={e => e.stopPropagation()}> 
            {!_.isArray(proteome_ids) || proteome_ids.length === 0 ? <MenuItem text="Select an organism/proteome first." disabled={true} /> : 
                _.isArray(genotpesBySearchQuery) && genotpesBySearchQuery.length === 0 ? <MenuItem text="No results..."/>: 
            _.isArray(genotypes) && genotypes.length > 0 ?
                genotpesBySearchQuery .map(genotype =>
                    <MenuItem text={genotype.text} onClick={() => handleGenotypeSelection(selectedRows, genotype)}
                        labelElement={<div className="labelelement-wrap--fixed-width" style={{textAlign:"right"}}>{extractGenotypeRepresentation(genotype)}</div>} />)
                    : null}
            </Menu>
            <MenuDivider />
            <MenuItem text="Clear Selection" icon="clean" onClick={() => clearGenotypeColumn(selectedRows)}/>
        </Menu>
    )
}

