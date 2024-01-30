import { Outlet, useParams } from "react-router";
import Tabs from "../core/navigation/tabs";
import { useEffect, useState } from "react";
import _ from "lodash"

function ProteinHeader({}) {
    const [featureList, setFeatureList] = useState({ items: [{ text: "+", to: "/protein/selection" }] })
    const params = useParams()
    const featureKey = params.ID

    useEffect(() => {
        //handle the case if someone sends a link around to another person
        const itemFromUrl = { text: featureKey, to: `/protein/${featureKey}` }
        if (_.isString(featureKey) && _.every(featureList.items, item => item.to != itemFromUrl.to)) {
            handleFeatureList(itemFromUrl)
        }
    },[featureKey])

    const handleFeatureList = (item) => {
        if (!_.isObject(item)) return 
        if (!featureList.items.includes(item)) {
            //item not in list
            setFeatureList(prevValues => {return {...prevValues,items : _.concat([item],prevValues.items)}})
        }
            
    }
    return (
        <div className="no-scroll div--expand">
            <Tabs tabs={_.uniqBy(featureList.items,"to")} />
            <div >
                <Outlet context={{handleFeatureList,featureKey}} />
            </div>
            
        </div>
    )
}

export default ProteinHeader