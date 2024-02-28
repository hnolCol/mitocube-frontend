import { Button, Card } from "@blueprintjs/core"
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
function GenotypeCard({ genotype, refetchGenotypes }) {
    const { data: attributesByTag, isFetched } = useGetSubmissionAttributesByTag()
    const {mutate, isLoading, isSuccess} = useDeleteGenotype()

    if (!isFetched) return null 
    return (<Card compact={true} interactive={true} className="margin--little" style={{padding:"0.4rem"}}>
        <h3>{genotype.text}</h3>
        <div className="flex"><h4>Features:</h4>
            {genotype.features.map(feature => <AttributeFeatureTag value={feature} valueIsFeature={true} />)}</div>
        <div className="flex"><h4>AttributeValues:</h4>
        
            {genotype.attributes.map(entryAttributes => {
                return _.keys(entryAttributes).map(attributeTag => {
                    const attribute = attributesByTag.attributes[attributeTag]
                    return <div>{_.isArray(entryAttributes[attributeTag])?entryAttributes[attributeTag].map(attributeValue => <AttributeFeatureTag value={attributeValue} attribute={attribute} valueIsFeature={_.has(attributeValue,"genes")}/>):null}</div>
            })
            })}
        </div>
        <Button
            icon="trash"
            small={true}
            minimal={true}
            intent="danger"
            onClick={() => mutate({ genotype_label: genotype.label }, { onSuccess: () => refetchGenotypes() })}
            loading={isLoading} />
        
    </Card>)
}


export function AdminGenotypes() {
    
    const {data : genotypes, isLoading, isFetching, isError, error, refetch : refetchGenotypes} = useGetGenotypes({})
    return (
        <div>
            <h3>Genotypes</h3>
            {isError ? <APIError error={error} /> :
                isLoading || isFetching ?
                    <Loading /> :
                    _.isArray(genotypes) ?
                        <div  className="div--expand" style={{overflowY:"scroll"}}>
                            {genotypes.map(genotype => { return <GenotypeCard {...{ genotype, refetchGenotypes }} /> })} </div>: null}

        </div>
    )
}