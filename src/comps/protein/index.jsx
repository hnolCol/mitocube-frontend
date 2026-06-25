import { Outlet, useLocation, useNavigate, useParams } from "react-router";
import Tabs from "../core/navigation/tabs";
import { useEffect, useState } from "react";
import _ from "lodash"
import { filterArrayBySearchStringBySingleKey } from "../../services/arrays/filter";
import { usePrefetchProteins } from "@/api/orchestrated/proteins";

function ProteinHeader({ }) {
    const redirect = useNavigate()
    const location = useLocation()
    const [featureTextMap, setFeatureTextMap] = useState(undefined)
    const [featureList, setFeatureList] = useState({ items: [{ text: "+", to: "/protein/selection" }] })
    const features = _.uniqBy(featureList.items, "to")
    const canClose = features.map(link => link.to !== "/protein/selection")
    const params = useParams()
    const feature_tag = params.ID
    const isFeatureInList = filterArrayBySearchStringBySingleKey({ array : featureList.items, keyName : "to", searchString : `/protein/${feature_tag}`}).idcs.size > 0

    
    const feature_tags = _.isArray(features) ? features.map(f => f.feature_tag).filter(f => f !== undefined && _.isString(f) && f !== "+") : [] 
    const { isReady, tagQueries } = usePrefetchProteins(feature_tags)

    
    useEffect(() => {
        if (isReady) {
            const mapper = new Map()
            tagQueries.forEach(q => {
                if (_.isString(q.data.gene_name)) {
                    mapper.set(q.data.tag, q.data.gene_name)
                }
            })
            setFeatureTextMap(mapper)
        }
            },[_.join(feature_tags), isReady])
    useEffect(() => {
        //handle the case if someone sends a link around to another person
        const itemFromUrl = { text: feature_tag, to: `/protein/${feature_tag}`, feature_tag : feature_tag }
        if (_.isString(feature_tag) && _.every(featureList.items, item => item.to != itemFromUrl.to)) {
            handleFeatureList(itemFromUrl)
        }
    }, [feature_tag])
    

    useEffect(() => {

        if (location.pathname === "/protein/selection") return 
        if (isFeatureInList) return 
        redirect(featureList.items.at(0).to)
    }, [isFeatureInList])

    const handleFeatureList = (item, redirect_to_feature_page = true) => {
        if (!_.isObject(item)) return 
        if (!featureList.items.includes(item)) {
            //item not in list
            setFeatureList(prevValues => {return {...prevValues,items : _.concat([item],prevValues.items)}})
        }    
        if (redirect_to_feature_page) redirect(item.to)
        
    }

    const handleFeatureRemove = (link_to) => {
        setFeatureList(prevValues => {return {...prevValues, items : prevValues.items.filter(link => !(link.to === link_to))}})
    }

    
    

    return (
        <div className="no-scroll div--expand">
            <Tabs tabs={_.uniqBy(featureList.items, "to")} canClose={canClose} handleClose={handleFeatureRemove} textMap={featureTextMap} />
            <div >
                <Outlet context={{handleFeatureList,feature_tag : isFeatureInList?feature_tag:undefined }} />
            </div>
            
        </div>
    )
}

export default ProteinHeader