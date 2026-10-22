import { useEffect, useState } from "react"
import { Menu, MenuDivider, MenuItem } from "@blueprintjs/core"
import _ from "lodash"
import TextInput from "../../../../../core/input/Text"
import useDebounce from "../../../../../../hooks/useDebounce"
import { GenotypeDescription } from "../../../../../admin/genotypes/GentotypeDescription"
import { api } from "@/api"


export function GenotypeMenuItem({ genotype_tag, handleClick, handleFocus, index, modifiers, selected, selectedRows }) {
    
    const {data : genotype_text, isSuccess} = api.genotypes.queryGenotypes.useGetGenotypeText({ genotype_tag })
    const {data : proteome_tag} = api.genotypes.queryGenotypes.useGetGenotypeProteome({ genotype_tag })
    const {data : proteome_name} = api.proteomes.queryProteomes.useGetProteomeText({ tag: proteome_tag }, { enabled: !!proteome_tag })
    
    return <MenuItem 
        text={isSuccess ? genotype_text : genotype_tag} 
        onClick={(e) => {
            // If selectedRows is provided, use the sample attributes pattern
            // Otherwise, use the filter pattern
            if (selectedRows !== undefined) {
                handleClick(selectedRows, genotype_tag);
            } else {
                handleClick(genotype_tag, e);
            }
        }}
        onFocus={handleFocus}
        active={modifiers?.active}
        icon={selected ? "tick" : "blank"}
        labelElement={
            <div className="flex flex-column" style={{maxWidth: "24rem", textAlign: "right", float: "right", textWrap: "wrap", marginRight: "1rem"}}>
                {proteome_name && <div style={{fontSize: "0.8rem", fontWeight: "bold", color: "#106ba3", marginBottom: "4px"}}>{proteome_name}</div>}
                <GenotypeDescription tag={genotype_tag} />
            </div>
        }
    />
}

//tODO make this connected to API instead of loading the genotypes first.
export function GenotypeContextMenu({ selectedRows, handleGenotypeSelection, proteome_tags, clearGenotypeColumn, copiedRows = [], onPaste = () => {}, onCopy = () => {}, onRepeat = () => {} }) {
    
    const [queryString, setQueryString] = useState("")
    const search_string = useDebounce(queryString, 200)
    const {data : genotype_tags, refetch } = api.genotypes.queryGenotypes.useGetGenotypesBySearchString({search_string, limit : 20},{})
    
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
                            
                            
                            // const sample_tags = selectedRows.map(row => `${submission_tag}|${sampleNames[row]}`) 
                            
                            // if (sample_tags.length > 0) {
                            //     insertSampleGenotype.mutate(
                            //         { sample_tags, genotype_tag },
                            //         {
                            //             onSuccess: () => setTimeout(() => refetch(), 100),
                            //             onError: (error) => console.error("Failed:", error)
                            //         }
                            //     )
                            // }
                        }} 
                        selectedRows={selectedRows}
                    />

  ))
  : null}
            </Menu>
            <MenuDivider />
            <MenuItem text={`Repeat Selection (${selectedRows.length} rows)`} icon="clean" onClick={() => onRepeat(selectedRows)} />
            <MenuItem text={`Copy selected rows (${selectedRows.length} row(s))`} icon="clipboard" onClick={() => onCopy(selectedRows)} />
            {copiedRows.length > 0 && <MenuItem text={`Paste copied genotypes to selection (${selectedRows.length} row(s))`} icon="th-derived" onClick={() => onPaste(copiedRows, selectedRows)} />}
            <MenuItem text="Clear Selection" icon="clean" onClick={() => clearGenotypeColumn(selectedRows)}/>
        </Menu>
    )
}
