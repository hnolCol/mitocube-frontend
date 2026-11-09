import { useOutletContext } from "react-router";
import _ from "lodash"
import { VolcanoPlotWrapper } from "./Wrapper";
import { useIsSmallScreen } from "../../../hooks/useViewport";
import { SmallScreenWarning } from "../../core/base/SmallScreenWarning";




function DatasetVolcanoPlot(logout) {
    const { submission_tag } = useOutletContext()
    const isSmallScreen = useIsSmallScreen()

    if (isSmallScreen) {
        return (
            <div>
                <h2>Volcano Plots</h2>
                <SmallScreenWarning feature="Volcano plots" />
            </div>
        )
    }

    return <VolcanoPlotWrapper {...{ submission_tag}} />
}

export default DatasetVolcanoPlot