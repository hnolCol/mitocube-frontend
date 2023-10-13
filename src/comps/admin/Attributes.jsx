
import _ from "lodash"
import { Header } from "../core/base/Header"
import { useGetSubmissionAttributes } from "../../hooks/queries/submission.hooks"
import { AttributeHeader, AttributeValue } from "../core/base/attribute"
import { objectHasKey } from "../../services/objects/checks"
import { groupListByProperty } from "../../services/arrays/groupby"
import TextInput from "../core/input/Text"
import { useMemo, useState } from "react"
import { filterArrayBySearchString } from "../../services/arrays/filter"


function AdminAttributes({ authenticationStatus }) {
    const [query, setQuery] = useState("")

    const { data: attributes,
        isLoading: attributesLoading,
        error: attributesAPIError,
        isError: attributeIsError,
        isSuccess: attributesIsSuccess } = useGetSubmissionAttributes({ tokenString: authenticationStatus.token }) //
    
    //const {data : attributes, isLoading, isFetching } = useGetSubmissionAttributes({tokenString : authenticationStatus.token})
    //console.log(attributes)

    const attrValuesByAttrID = useMemo(() => {
        if (!_.isObject(attributes)) return {}
        console.log("called")
        //group attr values by attr id, handling search queries
        let attrValues = attributes.attribute_values
        if (query === "" || !_.isString(query)) return groupListByProperty(attributes.attribute_values, "attribute_id")
        else {
            const attrValueMatchQuery = filterArrayBySearchString({ searchString: query, searchColumns: ["name", "tag", "details"], array: attrValues })
            return groupListByProperty(attrValueMatchQuery, "attribute_id")
        }
    }, [query,attributesIsSuccess]) 
    // .submission__item__container {
    //     font-size: 0.85rem;
    //     background-color :#fafafa;
    //     cursor: default;
    //     border-radius: 0.25rem;
    //     margin-top : 0.8rem;
    //     padding-left : 0.5rem;
    //     box-shadow: 0 3px 5px 0 rgba(0,0,0,0.2);
    //     transition: 0.3s;
    //     width : 100%;
    //     margin : 1rem;
    // }style={{,margin : "1rem"}}
    return (
        <div className="intent-margin-top--little padding--medium" >
            <p>Attributes are used to ensure that submission are accompanied by standardized attributes.</p>
            <TextInput placeholder="Search attribute" callbackKey={"query"}  onChange={(callbackKey,value) => setQuery(value)}/>
            <div className="container--scroll-y-hide-x div--expand" style={{height : "80vh"}}>
            
            <div className="bg--lightgrey">  
            {attributesIsSuccess ? attributes.attributes.map(attribute => {
                const attrHasValues = objectHasKey({ object: attrValuesByAttrID, keyName: attribute.id })
                return <div key={attribute.tag} className="intent-margin-top--medium" >
                    <AttributeHeader {...attribute} addStringToName={attrHasValues?`(${attrValuesByAttrID[attribute.id].length})`:``} />
                    <div className="container--scroll-y-hide-x div--expand padding--medium" style={{maxHeight : "15rem"}}>
                    {attrHasValues ?
                        attrValuesByAttrID[attribute.id].map(attributeValue =>
                            <AttributeValue key={`${attribute.tag}-${attributeValue.tag}`} {...attributeValue}/>) : null}
                    </div>
                    </div>
            }) : null}
            </div>  
            </div>

        </div>
    )
}

export default AdminAttributes