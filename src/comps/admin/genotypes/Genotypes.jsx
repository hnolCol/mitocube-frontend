import { Button, Card, Divider } from "@blueprintjs/core"
import { useDeleteGenotype, useGetGenotypes } from "../../../hooks/queries/genotype.hooks"
import Loading from "../../core/base/loading"
import APIError from "../../core/error/APIerror"
import _ from "lodash"
import { AttributeFeatureTag } from "../../submission/new/attribute/view/DatasetAttributesHierarchy"
import { useGetSubmissionAttributesByTag } from "../../../hooks/queries/submission.hooks"
/**
 * 
 * @param {Object} props 
 * @param {import("../../../types/genotypes").GenotypeResponse} props.genotype
 * @returns 
 */
export function GenotypeCard({ genotype, refetchGenotypes, justDisplay = false, fill = false }) {
    const { data: attributesByTag, isFetched } = useGetSubmissionAttributesByTag()
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
        <div className="flex">
            {genotype.features.map(feature => <AttributeFeatureTag value={feature} valueIsFeature={true} />)}</div>
        <div className="flex flex-column"><h4>AttributeValues:</h4>
            <div className="flex flex--wrap">
            {genotype.attributes.map(entryAttributes => {
                return _.keys(entryAttributes).map(attributeTag => {
                    const attribute = attributesByTag.attributes[attributeTag]
                    return <div>{_.isArray(entryAttributes[attributeTag])?entryAttributes[attributeTag].map(attributeValue => <AttributeFeatureTag value={attributeValue} attribute={attribute} valueIsFeature={_.has(attributeValue,"genes")}/>):null}</div>
            })
            })}
            </div>
        </div>
        
    </div>
    </Card>)
}


export function AdminGenotypes() {
    
    const {data : genotypes, isLoading, isFetching, isError, error, refetch : refetchGenotypes} = useGetGenotypes({})
    return (
        <div className="div--expand" >
            <h3>Genotypes</h3>
            <div style={{height : "70vh", overflowY:"scroll", paddingBottom : "2rem"}}>
            {isError ? <APIError error={error} /> :
                isLoading || isFetching ?
                    <Loading /> :
                    _.isArray(genotypes) ?
                        <div  className="flex flex--wrap">
                            {genotypes.map(genotype => { return <GenotypeCard {...{ genotype, refetchGenotypes }} /> })} </div>: null}
            </div>
        </div>
    )
}