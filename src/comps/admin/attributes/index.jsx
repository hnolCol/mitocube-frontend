import { useState } from "react"
import { useSearchParamState } from "../../../hooks/useSearchParamState"
import { AttributeGroupSelection } from "./Groups"
import { addStringToArrayOrRemove } from "../../../services/arrays/transforms"
import _ from "lodash"
import { AttributeCount } from "./Count"
import { OptionButton } from "../../core/base/buttons/OptionButton"
import { AttributeContainer } from "./AttributeContainer"

import { api } from "@/api"
import { AddButton } from "@/comps/core/base/buttons/AddButton"
import { Dialog, DialogBody } from "@blueprintjs/core"
import { InsertAttribute } from "@/comps/core/base/attributes/InsertAttribute"
import { EditAttribute } from "@/comps/core/base/attributes/EditAttribute"
import { ExportAttributesButton } from "./ExportAttributesAndTraits"
import { RequestAttributeButton } from "@/comps/core/base/attributes/RequestAttributeButton"

const CURATOR_ROLE = 2

export function AttributeQueryContainer({ search_string, limit = 50, attribute_groups = [], onEditAttributeClick }) {

    const { data: attribute_tags } = api.attributes.queryAttributes.useGetAttributesByQuery({
        search_string,
        limit: limit === Infinity ? 1E5 : limit,
        include_traits: false,
        attribute_groups: _.isArray(attribute_groups) && attribute_groups.length > 0 ? _.join(attribute_groups, ";") : undefined
    }, { staleTime: 1000 * 60 * 5, placeholderData: (prev) => prev || [] })

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
            {_.isArray(attribute_tags) ? <AttributeContainer attribute_tags={attribute_tags} isOpen={true} onEditClick={onEditAttributeClick} /> :
                _.keys(attribute_tags).map((key) => (
                    <div key={key}>
                        <div><h3>{key}</h3></div>
                        <AttributeContainer attribute_tags={attribute_tags[key]} isOpen={true} onEditClick={onEditAttributeClick} />
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
export function AttributesAdminView({ userRole }) {
    const [dialogProps, setDialogProps] = useState({ isOpen: false, editMode: false, attribute_tag: null })
    const [attribute_groups, setAttributeGroups] = useState([])
    const { searchString, setSearchString, debouncedSearchString, limit, setLimit } = useSearchParamState({ limitOptions: [50, 100, 200], limitAllValue: Infinity, debounceDelay: 30 })
    const isCurator = _.isFinite(_.toNumber(userRole)) && _.toNumber(userRole) >= CURATOR_ROLE

    return (
        <div
            className="div--expand padding--medium"
            style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}
        >
            <div className="flex flex-column margin--medium padding--medium" style={{ gap: "0.4rem" }}>

                <Dialog style={{width : "min(950px,70vw)"}} isOpen={dialogProps.isOpen} onClose={() => setDialogProps({ isOpen: false })} title="Add Attribute" canOutsideClickClose={false} canEscapeKeyClose={true}> 
                <DialogBody>
                    {dialogProps.isOpen && !dialogProps.editMode ? <InsertAttribute /> : <EditAttribute attribute_tag={dialogProps.attribute_tag} />}
                </DialogBody>   
                </Dialog>
                <h3>Attributes</h3>
                <div className="flex flex-column" style={{ marginBottom: 24 }}>
                    <div>
                        <div className="flex">
                            {isCurator && <AddButton onSelect={() => setDialogProps({ isOpen: true, editMode: false })} />}
                            <ExportAttributesButton />
                            <RequestAttributeButton userRole={userRole} />
                        </div>
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
                                    children={<span>{attribute_show_limit}</span>}
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
                    <div className="padding--medium" style={{ height: "100%" }}>
                        <AttributeQueryContainer
                            search_string={debouncedSearchString}
                            limit={limit}
                        attribute_groups={attribute_groups}
                        onEditAttributeClick={(attribute_tag) => setDialogProps({ isOpen: true, editMode: true, attribute_tag })}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}