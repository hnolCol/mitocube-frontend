import { Outlet } from "react-router";
import Tabs from "../core/navigation/tabs";
import { useState } from "react";
import _ from "lodash"

function ProteinHeader({ }) {
    const [featureList, setFeatureList] = useState({items : []})
    return (
        <div>
            <Tabs tabs={
                _.concat(featureList.items,[
                { text: "+", to: "/protein/selection" }])} />
            <div className="no-scroll">
                <Outlet context={...{setFeatureList}} />
            </div>
            
        </div>
    )
}

export default ProteinHeader