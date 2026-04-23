
import { motion } from "framer-motion"
import _ from "lodash"
import "./style.css"

import { isHexColorLight } from "../../../../services/colors"
import { RemoveButton } from '../buttons/RemoveButton'
import PropTypes from 'prop-types'

import { api } from "@/api";
import { Loading } from '../states/Loading'
import { TraitChildren } from "./TraitChildren"



TraitWithValueInput.propTypes = {
    attribute_tag : PropTypes.string.isRequired,
    trait_tag: PropTypes.string.isRequired,
    disableTooltip: PropTypes.bool,
    onRemove: PropTypes.func,
    popoverPosition: PropTypes.string,
    highlight: PropTypes.bool,
}


/**
 * @description 
 * @param {Object} props 
 * @param {String} props.attribute_tag
 * @param {String} props.trait_tag 
 * @param {Boolean} props.disableTooltip 
 * @param {Function} prop.onRemove 
 * @param {Function} prop.onUserInput
 * @returns 
 */
export function TraitWithValueInput({
        rowIndex,
        trait_tag, 
        attribute_tag = "",
        // disableTooltip = false,
        onRemove = undefined,
        // popoverPosition = "top",
        highlight = false,
        onChildrenSelection,
        getSelectionByPath,
        referenceID,
        checkAttributeRequiredTraits,
        sel }) {
    
    const { data: trait, isLoading: traitIsLoading, isSuccess: traitIsSuccess } = api.traits.queryTraits.useGetTraitByTag({tag : trait_tag}, {enabled : _.isString(trait_tag), staleTime: Infinity})
    const {data : children, isLoading : childrenIsLoading, isSuccess : childrenIsSuccess} = api.attributes.queryAttributes.useGetAttributeChildren({tag : attribute_tag}, {enabled : _.isString(attribute_tag) && traitIsSuccess})
    const hasChildren = childrenIsSuccess && _.isArray(children) && children.length > 0
    //handle colors 
    const backgroundColor = highlight ? "#466688" : "#e5e5e5"
    const fontColor = isHexColorLight(backgroundColor) ? "#000000" : "#fff"

    const traitPath = [{ "tag": attribute_tag, "type": "attribute", "id" : referenceID }, { "tag": trait_tag, "type": "trait", "id": referenceID }]
    return (
        <div>
            { traitIsLoading || childrenIsLoading ? <Loading /> : traitIsSuccess && childrenIsSuccess?
                <motion.div
                    style={{ backgroundColor: backgroundColor, color: fontColor, fontSize: "0.75rem" }}
                    className="flex center-items padding--tiny cursor--default div--round margin-right--tiny"
                    whileHover={{ backgroundColor: "#efefef" }}>
                
                    <div className="flex">
                        <div className="flex flex-column" style={{ width: "100%" }}>
                            <div><strong>{trait.text}</strong></div>
                            {hasChildren ?
                                <TraitChildren children_tags={children} {...{
                                    onChildrenSelection,
                                    rowIndex,
                                    getSelectionByPath,
                                    path:  traitPath,
                                    selectedRows: sel,
                                    onRemove,
                                    referenceID,
                                    checkAttributeRequiredTraits,
                                }} /> : null}
                        </div>
                        {_.isFunction(onRemove) ?
                            <div style={{ paddingLeft: "0.5rem", paddingRight: "0.5rem" }}>
                                <RemoveButton fontColor={fontColor} onRemove={(e) => onRemove(traitPath, [rowIndex])} />
                            </div>
                            : null}
                    </div>
                </motion.div> : null }
        </div>
    )
}


