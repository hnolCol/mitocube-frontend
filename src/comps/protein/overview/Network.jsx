import { Button } from "@blueprintjs/core";
import { Combobox } from "../../core/input/Combobox";
import TextInput from "../../core/input/Text";
import { FeatureInput } from "../../core/input/api/FeatureInput";


export function Network() {
    

    return (
        <div className="flex" style={{width : "50vw", paddingTop : "2rem", height : "1rem"}}>
            <FeatureInput attribute={{text : ""}} allowUndefinedProteomes/>
            <div>___</div>
            <Combobox placeholder="MEDIATES" items={["MEDIATES", "EFFECTS", "INHIBITS", "CAUSES","VIA"].map(v => {return {text : v}})} />
            <div>___</div>
            <Combobox placeholder="Integrated stress response (ISR)" items={["Integrated stress response (ISR)", "mtDNA release", "Cardiomyopathy"].map(v => {return {text : v}})} />
            <div>___</div>
            <div>BASED-ON</div>
            <TextInput placeholder="Add publication using PMID" />
            <Button text="Submit" intent="primary"/>
        </div>
    )
}