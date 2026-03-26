import { Button } from "@blueprintjs/core"
import Maintenance from "../../core/svg/icons/performance/Maintenance"
import { AddQCRunDialog } from "./dialogs/AddQCRun"
import { useState } from "react"

function PerformanceRuns({ }) {

    // const { data, isLoading } = useGetDendro()

    const [dialogProps, setDialogProps] = useState({isOpen : false})
    return (
        <div>
            {/* {_.isObject(data) ? <Example data={data["lines"]} width={500} height={600} /> : null} */}
            <h3>Quality Control Runs</h3>
            <AddQCRunDialog {...dialogProps} />

            <Button icon="plus" intent="primary" small minimal text="Add"/>


            <Maintenance />



{/* 
            <Maintenance />
            <QualityControl />
            <PercentageLine />
            <System /> */}
        </div>
       
    )
}


export default PerformanceRuns
