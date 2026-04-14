import { useState } from "react"
import useDebounce from "../../../hooks/useDebounce"
import { AttributeGroupSelection } from "./Groups"
import { addStringToArrayOrRemove } from "../../../services/arrays/transforms"
import _ from "lodash"
import { AttributeCount } from "./Count"
import { OptionButton } from "../../core/base/buttons/OptionButton"
import { AttributeContainer } from "./AttributeContainer"

import { api } from "@/api"


export function AttributeQueryContainer({ search_string, limit = 50, attribute_groups = [] }) {

    const { data: attribute_tags, isError, isFetching } = api.attributes.queryAttributes.useGetAttributesByQuery({
        search_string,
        limit: limit === Infinity ? 1E5 : limit,
        include_traits: false,
        attribute_groups: _.isArray(attribute_groups) && attribute_groups.length > 0 ? _.join(attribute_groups, ";") : undefined
    }, { staleTime: 1000 * 60 * 5, placeholderData: (prev) => prev || [] })


    const n_attributes_shown = _.isArray(attribute_tags) ? attribute_tags.length : _.keys(attribute_tags || {}).reduce((acc, key) => acc + (attribute_tags[key] || []).length, 0)

    return (
        <div>
            <div className="margin-bottom--little">
                    <span>
                        <strong>{n_attributes_shown}</strong> / <AttributeCount />{" "}
                    <span style={{ fontSize: 13, color: "#aaa" }}>(shown/total)</span>
                    </span>
            </div>
            <div className="container--scroll-y-hide-x" style={{height : "60vh"}}>
            {_.isArray(attribute_tags) ? <AttributeContainer attribute_tags={attribute_tags} isOpen={true} /> :
                _.keys(attribute_tags).map((key) => (
                    <div key={key}>
                        <div><h3>{key}</h3></div>
                        <AttributeContainer attribute_tags={attribute_tags[key]} isOpen={true} />
                    </div>
                ))}
            </div>

        </div>
    )
    
}

 /**
 * @description The main admin view for attributes. This components allows for searching, editing, deleting and creating attributes.
 * @returns {JSX.Element} The AttributesAdminView component
 */
export function AttributesAdminView() {
    const [limit, setLimit] = useState(50) // Default limit
    const [searchString, setSearchString] = useState()
    const [attribute_groups, setAttributeGroups] = useState([])
    const debouncedSearchString = useDebounce(searchString, 30)
    const group_by = "attribute_group"
    
    // const { data: attribute_tags, isError, isFetching } = hooks.attributes_query.useGetAttributesByQuery({
    //     search_string: debouncedSearchString,
    //     limit: limit === Infinity ? 1E5 : limit,
    //     include_traits: false,
    //     // group_by,
    //     attribute_groups: _.isArray(attribute_groups) && attribute_groups.length > 0 ? _.join(attribute_groups, ";") : undefined
    // }, { staleTime: 1000 * 60 * 5, placeholderData: (prev) => { console.log(prev, "PREV");  return prev || []}, cacheTime : 1000 * 60 * 10 })

    
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f5f5f5",
            }}
        >
            <div
                style={{
                    width: "90vw",
                    height: "auto",
                    marginTop: "40px",
                    marginBottom: "40px",
                    padding: 32,
                    background: "#fff",
                    borderRadius: 10,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                }}
            >
                <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24, letterSpacing: -1 }}>Attributes</h2>
                <div className="flex flex-column" style={{ marginBottom: 24 }}>
                    <div>
                        <input
                            className="search-input"
                            type="text"
                            placeholder="Search attributes ..."
                            value={searchString || ""}
                            onChange={(e) => setSearchString(e.target.value)}
                        />
                    </div>

                    <div className="flex">
                        <div className="flex center-items">
                            <div>Groups | </div>
                            <AttributeGroupSelection
                                onSelection={(tag) =>
                                    setAttributeGroups((prev) => addStringToArrayOrRemove({ array: prev, string: tag }))
                                }
                                selected_tags={attribute_groups}
                            />
                        </div>

                        <div className="flex center-items margin-left--medium">
                            <div>Limit | </div>
                            {[50, 100, 200, "All"].map((attribute_show_limit) => (
                                <OptionButton
                                    key={attribute_show_limit}
                                    children={
                                        <span>
                                            {attribute_show_limit !== "All" ? attribute_show_limit : "All"}
                                        </span>
                                    }
                                    isSelected={
                                        _.isNumber(attribute_show_limit)
                                            ? limit === attribute_show_limit
                                            : limit === Infinity
                                    }
                                    onClick={() =>
                                        _.isNumber(attribute_show_limit)
                                            ? setLimit(attribute_show_limit)
                                            : setLimit(Infinity)
                                    }
                                />
                            ))}
                        </div>
                    </div>
                    <div
                        className="padding--medium"
                        style={{
                            height: "100%",
                        }}
                    >
                        <AttributeQueryContainer
                            search_string={debouncedSearchString}
                            limit={limit}
                            attribute_groups={attribute_groups}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}