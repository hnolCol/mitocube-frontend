
import _ from "lodash"

import { useOutletContext } from "react-router"
import { ProteinAbundance } from "../FeatureAbundance"

import { OptionButton } from "../../../core/base/buttons/OptionButton"
import { useSearchParams } from "react-router-dom"
import { OpenAiPublicationSummary } from "../../../core/openai/OpenAiPublicationSummary"
import { ProteinOverview } from "./ProteinOverview"


import { ProteinCorrelationWrapper } from "../../correlation"
import { ProteinSubmissionRanking } from "../../data/ProteinSubmissionRanking"
import { ProteinHelp } from "./ProteinHelp"




export function ProteinPage() {
    
    const { feature_tag } = useOutletContext()
    const [searchParams, setSearchParams] = useSearchParams();

    const viewOptions = [{ tag: "overview", text: "Overview" },
        { tag: "data", text: "Data" },
        { tag: "correlation", text: "Correlation" },
        { tag: "abundance", text: "Abundance" },
        { tag: "literature", text: "Literature (AI)" },
        { tag: "publications", text: "Publications" },
        {tag : "documentation", text : "Documentation"}];
    
    const viewParam = searchParams.get("view");
    const selectedView = viewParam && viewOptions.some(o => o.tag === viewParam) ? viewParam : viewOptions[0].tag;
    

    const handleClick = (option_tag) => {
        const newParams = new URLSearchParams(searchParams);
        if (option_tag === viewOptions[0].tag) {
            newParams.delete("view");
        } else {
            newParams.set("view", option_tag);
        }
        setSearchParams(newParams);
    }
    

    return (
        <div className="div-expand" style={{ height: "100%", }}>
            <div className="bg--lightgrey padding--little margin--little">
            {viewOptions.map(option =>
                <OptionButton key={option.tag} isSelected={selectedView === option.tag} onClick={() => handleClick(option.tag)}>
                    <span>{option.text}</span>
                </OptionButton>
                )}
                </div>
            {/* <ProteinFilter tag={feature_tag} /> */}
            <div className="flex flex-column div--expand padding--little" style={{overflowY:"scroll", height : "88vh"}}>

            {selectedView === "overview" ? <ProteinOverview feature_tag={feature_tag} /> : null }
            {selectedView === "data" ? <ProteinSubmissionRanking tag={feature_tag} /> : null     }
            {selectedView === "correlation" ? <  ProteinCorrelationWrapper tag={feature_tag} /> : null }
            {selectedView == "literature" ? <div style={{paddingLeft : "3rem", paddingRight : "3rem"}}><OpenAiPublicationSummary feature_tag={feature_tag} /></div> : null }
            {selectedView === "abundance" ? <ProteinAbundance tag={feature_tag} /> : null}
            {selectedView === "documentation" ? <ProteinHelp /> : null  }
            </div>
           
        </div>

    )
}
