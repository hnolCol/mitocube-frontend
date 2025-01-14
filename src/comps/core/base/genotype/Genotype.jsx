import { useGetGenotypeByTag } from "../../../../hooks/queries/genotype.hooks"
import { isHexColorLight } from "../../../../services/checks/color"

export function Genotype({ tag, highlight }) {

    const { data: genotype, isLoading, isFetching } = useGetGenotypeByTag({ tag })

    const backgroundColor = highlight ? "#466688" : "#efefef"
    const motionBackgroundColor = highlight ? "#efefef" : "#466688"
    const fontColor = isHexColorLight(backgroundColor) ? "#000000" : "#fff"
    const motionFontColor = isHexColorLight(motionBackgroundColor) ? "#000000" : "#fff"

    return (<motion.div
        style={{
            backgroundColor: backgroundColor,
            color: fontColor,
            fontSize: "0.75rem"
            }} 
        className="flex center-items padding--tiny cursor--default div--round intent-margin-right--tiny"
        whileHover={{
            backgroundColor: motionBackgroundColor,
            color: motionFontColor
        }}
        >
            <Popover
                disabled={disableTooltip}
                content={
                <div className="padding--little bg--grey margin--little padding--little" style={{ maxWidth: "24rem" }}>
                        <h4>{genotype.text}</h4>
                    <div className="div--expand">
                            <div>
                                
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
                <button className="flex" style={{ border: "none", backgroundColor: "transparent" }} >
                {/* onClick={() => redirect(`/protein/${tag}`)} */}
                        <div>{genotype.text}</div>
                </button>
            </Popover>
    </motion.div>
    )
}