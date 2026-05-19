import { useOutletContext } from "react-router";
import _ from "lodash"
import { VolcanoPlotWrapper } from "./Wrapper";




function DatasetVolcanoPlot(logout) {
    const { submission_tag } = useOutletContext()

    return <VolcanoPlotWrapper {...{ submission_tag}} />
}

export default DatasetVolcanoPlot