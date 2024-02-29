import { Outlet, useLocation, useNavigate, useParams } from "react-router";
import Tabs from "../core/navigation/tabs";
import { useEffect, useState } from "react";
import _ from "lodash"
import { filterArrayBySearchStringBySingleKey } from "../../services/arrays/filter";

function ProteinHeader({ }) {
    const redirect = useNavigate()
    const location = useLocation()

    const [featureList, setFeatureList] = useState({ items: [{ text: "+", to: "/protein/selection" }] })
    const params = useParams()
    const featureKey = params.ID
    const isFeatureInList = filterArrayBySearchStringBySingleKey({ array : featureList.items, keyName : "to", searchString : `/protein/${featureKey}`}).idcs.size > 0


    useEffect(() => {
        //handle the case if someone sends a link around to another person
        const itemFromUrl = { text: featureKey, to: `/protein/${featureKey}` }
        if (_.isString(featureKey) && _.every(featureList.items, item => item.to != itemFromUrl.to)) {
            handleFeatureList(itemFromUrl)
        }
    }, [featureKey])
    

    useEffect(() => {

        if (location.pathname === "/protein/selection") return 
        if (isFeatureInList) return 
        redirect(featureList.items.at(0).to)
    }, [isFeatureInList])

    const handleFeatureList = (item) => {
        if (!_.isObject(item)) return 
        if (!featureList.items.includes(item)) {
            //item not in list
            setFeatureList(prevValues => {return {...prevValues,items : _.concat([item],prevValues.items)}})
        }    
    }

    const handleFeatureRemove = (link_to) => {
        setFeatureList(prevValues => {return {...prevValues, items : prevValues.items.filter(link => !(link.to === link_to))}})
    }

    const features = _.uniqBy(featureList.items, "to")
    const canClose = features.map(link => link.to !== "/protein/selection")
    

    return (
        <div className="no-scroll div--expand">
            <Tabs tabs={_.uniqBy(featureList.items, "to")} canClose={canClose} handleClose={handleFeatureRemove} />
            <div >
                <Outlet context={{handleFeatureList,featureKey : isFeatureInList?featureKey:undefined }} />
            </div>
            
        </div>
    )
}

export default ProteinHeader