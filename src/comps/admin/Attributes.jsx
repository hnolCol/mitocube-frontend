
import _ from "lodash"
import { Header } from "../core/base/Header"
import { useGetSubmissionAttributes } from "../../hooks/queries/submission.hooks"
import { AttributeHeader, AttributeValue } from "../core/base/attribute"
import { objectHasKey } from "../../services/objects/checks"
import { groupListByProperty } from "../../services/arrays/groupby"
import TextInput from "../core/input/Text"
import { useMemo, useState } from "react"
import { filterArrayBySearchString } from "../../services/arrays/filter"
import useDebounce from "../../hooks/useDebounce"
import APIError from "../core/error/APIerror"


function AdminAttributes({ authenticationStatus, maxShown = 10}) {
    const [query, setQuery] = useState("")
    const debounceSearchString = useDebounce(query, 300)

    const { data: attributes,
        isLoading: attributesLoading,
        error: attributesAPIError,
        isError: attributeIsError,
        isSuccess: attributesIsSuccess } = useGetSubmissionAttributes()

    //const {data : attributes, isLoading, isFetching } = useGetSubmissionAttributes({tokenString : authenticationStatus.token})
    //console.log(attributes)

    const attrValuesByAttrID = useMemo(() => {
        if (!_.isObject(attributes)) return {}
        //group attr values by attr id, handling search queries
        let attrValues = attributes.attribute_values
        if (debounceSearchString === "" || !_.isString(debounceSearchString)) return groupListByProperty(attributes.attribute_values, "attribute_id")
        else {
            const attrValueMatchQuery = filterArrayBySearchString({ searchString: debounceSearchString, keyNames: ["text", "tag", "description"], array: attrValues })
            return groupListByProperty(attrValueMatchQuery, "attribute_id")
        }
    }, [debounceSearchString,attributesIsSuccess]) 

    return (
        <div className="intent-margin-top--little padding--medium" >
            {attributeIsError ? <APIError error={attributesAPIError}/> :
            <div>
                <p>Attributes are used to ensure that submission are accompanied by standardized attributes.</p>
                <TextInput placeholder="Search attribute" callbackKey={"query"}  onChange={(callbackKey,value) => setQuery(value)}/>
                <div className="container--scroll-y-hide-x div--expand" style={{height : "80vh"}}>
                
                <div className="bg--lightgrey">  
                {attributesIsSuccess && _.isArray(attributes.attributes) ? attributes.attributes.map(attribute => {
                    const attrHasValues = objectHasKey({ object: attrValuesByAttrID, keyName: attribute.id })
                    const numberAttributeValues = attrHasValues?attrValuesByAttrID[attribute.id].length:0
                    return attrHasValues ? <div key={attribute.tag} className="intent-margin-top--medium intent-padding-right--little" >
                        <AttributeHeader {...attribute} addStringToName={attrHasValues?`(${numberAttributeValues})`:``} />
                        <div className="container--scroll-y-hide-x div--expand padding--medium" style={{maxHeight : "15rem"}}>
                        {
                                attrValuesByAttrID[attribute.id].map((attributeValue, attrValueIdx) =>{
                                    if (attrValueIdx === maxShown - 1) return <p>Not all attribute values {maxShown} / {numberAttributeValues} shown. Use search option.</p>
                                    if (attrValueIdx >= maxShown) return null 
                                    return <AttributeValue key={`${attribute.tag}-${attributeValue.tag}`} {...attributeValue} />
                                })}
                        </div>
                        </div> : null
                }) : null}
                </div>  
                </div>
            </div>}
        </div>
    )
}

export default AdminAttributes