import { useOutlet } from "react-router"


export function ProteinOverviewPage({}) {
    
    const { feature_tag } = useOutletContext()

    return (
        <div style={{ display: "grid", gridTemplateColumns : "400px 1fr", gridTemplateRows : "1fr", height : "100%"}}>
            <div style={{gridColumn : 1, gridRow : 1}}>
                <h3>Overview</h3>
                <div>

                    {/* add basic infor here (gene name, proteine name) */}

                </div>

                <div>
                    
                    {/* add tags here such as MitoCarta */}

                </div>

                <div> 

                    {/* Recent publications */}

                </div>

                <div>
                    {/* stats (views) */}

                </div>

            </div>
            <div style={{ gridColumn: 2, gridRow: 1}}>
                
                {/* Relative variance */}

                {/* abundance plot */}

            </div>

        </div>
    )
}