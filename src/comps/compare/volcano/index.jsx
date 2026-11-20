
import { useIsSmallScreen } from "../../../hooks/useViewport";
import { SmallScreenWarning } from "../../core/base/SmallScreenWarning";
import { CompareVolcano } from "./CompareVolcano";


export function CompareVolcanoPlot() {
    const isSmallScreen = useIsSmallScreen()

    if (isSmallScreen) {
        return (
            <div>
                <h2>Compare Volcano Plots</h2>
                <SmallScreenWarning feature="Volcano plot comparison" />
            </div>
        )
    }

    return <CompareVolcano />
}
