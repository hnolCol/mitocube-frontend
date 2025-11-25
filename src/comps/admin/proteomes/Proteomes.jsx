import { Button } from "@blueprintjs/core";
import { AddProteome } from "./Add";
import { ProteomesView } from "./Table";
import hooks from "@mitocube/api-hooks"
export function AdminProteomes({ }) {
    
    const { data: proteomePermissions, isSuccess } = hooks.proteomes.useGetProteomePermissions({});

    return (
        <div style={{ display: "grid", gridTemplateColumns : "300px 1fr", gridTemplateRows : "1fr", height : "100%", gap : "2rem", marginTop : "2rem"}}>
            <div style={{gridColumn : 1, gridRow : 1}}>
                <h3>Proteomes</h3>
                <div>
                    <AddProteome can_insert={isSuccess && proteomePermissions.create} />
                </div>
            </div>

            <div style={{ gridColumn: 2, gridRow: 1, borderLeft : "0.5px solid black", paddingLeft : "1rem"}}>
                
                {
                    <div className="margin--little">
                        <ProteomesView />
                    </div>
                }

            </div>

        </div>
        
    )
}