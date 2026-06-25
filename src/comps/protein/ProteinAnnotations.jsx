import { api } from "@/api"
import _ from "lodash"
import { Loading } from "../core/base/states/Loading"
import APIError from "../core/error/APIerror"
import { AnnotationGroup } from "../core/base/annotations/AnnotationGroup"
import { Annotation } from "../core/base/annotations/Annotation"

export function ProteinAnnotations({ tag }) {
    
    
    const { data: annotation_tags, isLoading, isSuccess, isError, error } = api.annotations.queryAnnotations.useGetAnnotationsBySearchString({ protein_tags: tag, group_by_group : true, limit : 50 }, { enabled: _.isString(tag) })
    return (
        <div>
            <h4>Protein Annotations</h4>
            {isSuccess && annotation_tags.length > 0 && <span>Protein annotated by the following annotations.</span>}
            {isLoading ? <Loading /> : isError ? <APIError error={error} /> :
                <div>
                
                    {_.isArray(annotation_tags) && annotation_tags.length > 0 ? annotation_tags.map(annotations_by_group => {
                        return <div className="bg--lightgrey padding--little">
                            <AnnotationGroup tag={annotations_by_group.group_tag} />
                            <div style={{paddingLeft : "0.6rem"}}> 
                                {annotations_by_group.annotation_tags.map(annotation_tag => <Annotation tag ={annotation_tag} /> )}
                            </div>
                        </div>
                    } ) : <div>No annotations found for this protein.</div>}
                
                </div>
        }

        </div>
    )
}