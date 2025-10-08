import PropType from "prop-types"
import { useGetAttribute, useGetTrait } from "../../../../hooks/queries/attribute.hooks"
import { isHexColorLight } from "../../../../services/checks/color"
import _ from "lodash"
import { motion } from "framer-motion"
import { Popover } from "@blueprintjs/core"


StaticTrait.propTypes = {
    attribute_tag: PropType.string.isRequired,
    trait_tag: PropType.string.isRequired,
    submission_tag: PropType.string.isRequired,
    popoverPosition: PropType.string, //define which are available oneOf
    disableTooltip: PropType.bool,
    highlight: PropType.bool,
    suffix: PropType.string,
    showDescription: PropType.bool
}

StaticTrait.defaultProps = {
    popoverPosition: "top",
    disableTooltip: false,
    highlight: false,
    suffix: "",
    showDescription: false
}
/**
 * @description Static trait is the representation of a trait/attribute value. 
 * Static means that the user cannot set any defined unit based input.
 * Use this component for visualization only. The user can still see the input but not edit it.  
 * @param {Object} props 
 * @param {String} props.attribute_tag 
 * @param {String} props.trait_tag
 * @param {String} props.submission_tag 
 * @param {Boolean} props.highlight - Highlight this trait. 
 * @param {Boolean} props.disableTooltip
 * @param {String} props.suffix - A string that is simply added after the trait text and unit string
 * @param {Boolean} props.showDescription
 */
export function StaticTrait({
    attribute_tag,
    trait_tag,
    submission_tag,
    highlight,
    disableTooltip,
    popoverPosition,
    suffix,
    showDescription
}) {

    
    const { data: attribute, isSuccess } = useGetAttribute({ tag: attribute_tag })
    const { data : trait, isSuccess : traitIsSuccess} = useGetTrait({tag : trait_tag, include_input : true, submission_tag})
    //handle colors
    const backgroundColor = highlight ? "#466688" : "#efefef"
    const motionBackgroundColor = highlight ? "#efefef" : "#466688"
    const fontColor = isHexColorLight(backgroundColor) ? "#000000" : "#fff"
    const motionFontColor = isHexColorLight(motionBackgroundColor) ? "#000000" : "#fff"
    const hasInput = traitIsSuccess && _.isObject(trait) && _.isObject(trait.user_input)
    const unitString = hasInput ? _.join(_.keys(trait.user_input).map(ui => `${trait.user_input[ui].value} ${trait.user_input[ui].unit_text}`),", ") : ""
        
    return <div>
        {isSuccess && traitIsSuccess ? <motion.div
            style={{ backgroundColor: backgroundColor, color: fontColor, fontSize: "0.75rem" }} //lighter ? "#efefef" :
            className="flex center-items padding--tiny cursor--default div--round intent-margin-right--tiny"
            whileHover={{ backgroundColor: motionBackgroundColor, color: motionFontColor }}
        >
            <Popover disabled={disableTooltip}
                content={
                <div className="padding--little bg--grey margin--little padding--little" style={{ maxWidth: "24rem" }}>
                    <h4>{attribute.text}</h4>
                    <div className="div--expand">
                            <div>
                                <div>{trait.description}</div>
                            </div>
                    </div>
                </div>}
                minimal={false}
                compact={true}
                interactionKind="hover"
                inheritDarkTheme={false}
                hoverOpenDelay={200}
                hoverCloseDelay={100}
                position={popoverPosition}>
                <div className="flex">
                    <div>{trait.text}{unitString.length > 0 ? ` (${unitString})` : null}{suffix.length > 0 ? ` ${suffix}`:null}</div>
                    {/* {attribute.has_unit && !hasInput ? <div className="margin-left--little intent-margin-right--little"> <Icon icon="info-sign" intent="danger" /> </div> : null} */}
                </div>
            </Popover>
        
        
        </motion.div> : null} 
        <div>{isSuccess && traitIsSuccess && showDescription ?
            <div className='font-size--smallest'>{trait.description}</div> : null}</div>
        </div>
}
