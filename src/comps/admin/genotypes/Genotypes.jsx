import { Button, Card, Divider } from "@blueprintjs/core"
import { useDeleteGenotype } from "../../../hooks/queries/genotype.hooks"
import _ from "lodash"
import { GenotypeDefinition } from "./GenotypeDefinition"
/**
 * 
 * @param {Object} props 
 * @param {import("../../../types/genotypes").GenotypeResponse} props.genotype
 * @returns 
 */
export function GenotypeCard({ genotype, refetchGenotypes, justDisplay = false, fill = false }) {
    const {mutate, isLoading, isSuccess} = useDeleteGenotype()
    if (!isFetched) return null 
    return (<Card compact={true} interactive={true} className="margin--little" style={{ padding: "0.4rem", width : fill ? undefined:"min(350px,80vw)" }}>
        <div className="div--expand bg--grey padding--medium">
            <div className="flex center-items justify-space-between"><h4>{genotype.text}</h4>
                {!justDisplay ? <Button
                    icon="trash"
                    small={true}
                    minimal={true}
                    intent="danger"
                    onClick={() => mutate({ genotype_label: genotype.label }, { onSuccess: () => refetchGenotypes() })}
                    loading={isLoading} /> : null}
            </div>
            <Divider />
            {_.isObject(genotype) ? <div>
                <div className="flex">
                    
                </div>
                <div className="flex flex-column"><h4>AttributeValues:</h4>
                    <div className="flex flex--wrap">
                        {_.isArray(genotype.attributes)?genotype.attributes.map(entryAttributes => {
                            return _.keys(entryAttributes).map(attributeTag => {
                                const attribute = attributesByTag.attributes[attributeTag]
                                return <div>{_.isArray(entryAttributes[attributeTag])?entryAttributes[attributeTag].map(attributeValue => <AttributeFeatureTag value={attributeValue} attribute={attribute} valueIsFeature={_.has(attributeValue,"genes")}/>):null}</div>
                        })
                        }): null}
                    </div>
                </div>

            </div> : null}
        
        
    </div>
    </Card>)
}


export function AdminGenotypes() {
    
    return (
        <div className="div--expand" >
            <h3>Genotypes</h3>
            <div style={{ height: "70vh", overflowY: "scroll", paddingBottom: "2rem" }}>
            <GenotypeDefinition />
            
            </div>
        </div>
    )
}