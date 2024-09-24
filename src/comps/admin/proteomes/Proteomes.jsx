import { Button } from "@blueprintjs/core";
import { AddProteome } from "./Add";
import { ProteomesView } from "./Table";

export function AdminProteomes({ }) {
    

    return (
        <div style={{ display: "grid", gridTemplateColumns : "300px 1fr", gridTemplateRows : "1fr", height : "100%", gap : "2rem", marginTop : "2rem"}}>
            <div style={{gridColumn : 1, gridRow : 1}}>
                <h3>Proteomes</h3>
                <div>
                    <AddProteome />
                </div>


            </div>
            <div style={{ gridColumn: 2, gridRow: 1, borderLeft : "0.5px solid black", paddingLeft : "1rem"}}>
                
                {
                    <div className="margin--little">
                        <h2>Available proteomes</h2>
                        <ProteomesView />



                    </div>

                }



            </div>

        </div>
        
    )
}