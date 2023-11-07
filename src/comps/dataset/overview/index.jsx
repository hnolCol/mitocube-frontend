import { useOutletContext, useParams } from "react-router";
import MultipleMetrices from "../../core/metrics/collection";
import { useEffect, useMemo, useRef, useState } from "react";
import { Header } from "../../core/base/Header";
import _ from "lodash"
import GroupingTable from "../../core/base/attribute_groupings/table";
import { motion } from "framer-motion";
import { Button } from "@blueprintjs/core";
import APIError from "../../core/error/APIerror";
import { copyTextToClipboard } from "../../../services/clipboard";
import HelpOverlay from "../../core/overlay/Helpoverlay";
import {useOnScreen} from "../../../hooks/useOnScreen";
import { readDateFromString, readDateFromStringAndReturnDateAndDistToNow } from "../../../services/date/read";

function AuthorList({
    authors = [{ name: "Hendrik Nolte", email: "h.nolte@age.mpg.de", owner: true }, { name: "Andreas Lindner", email: "a.l@uni-bonn.de", owner: false }],
    emailSubject = "" }) {
    
    return (
        <div className="flex">
            {authors.map((authorProps, idx) => {
                return (
                    <div className="flex intent-margin-right--little div--round" key={`${authorProps.email}-${idx}`}>
                            <a
                                href={`mailto:${authorProps.email}?cc=${_.join(authors.filter(author => author.email !== authorProps.email).map(author => author.email), ", ")}&subject=${emailSubject}`}
                                className="router-link">
                            <div className={authorProps.owner ? "h2-span" : "h0-span"}>
                                {authorProps.name}
                            </div>
                        </a>
                        {authors.length > 1?
                            idx === authors.length - 2 ? <div>, and</div> : idx !== authors.length - 1?<div>,</div> : null : null}
                        </div>
                )
            })}
        </div>
    )
}



  

function ExperimentalInfo({ title = "", details = "" }) {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <motion.div className="flex flex-column margin-top-bottom--medium div--round " transition={{ duration: 0.8, delay: 0.0 }}
        animate={ isOpen ? { maxHeight: "25vw" } : { maxHeight: "5vw" }} style={{ maxHeight: "5vw"}}>
            <div className="flex">
                <Button icon={isOpen ? "chevron-down" : "chevron-right"} small={true} minimal={true} onClick={() => setIsOpen(!isOpen)}/>
                <Header text={title} letterSpacing="0.05rem" />
                {isOpen ? <Button icon={"clipboard"} small={true} minimal={true} onClick={() => copyTextToClipboard({text : details})}/> : null}
            </div>
            <motion.div className={`flex ${isOpen ? "container--scroll-y-hide-x" : "no-scroll"}`} animate={isOpen ? { opacity: 1 } : { opacity: 0.2 }} transition={{ duration: 1.4, delay: 0.2 }} opacity={0.2}>
                <div className="padding--medium intent-margin-left--little">
                    {details}
                </div>
            </motion.div>
        </motion.div>
    )
}



function DatasetInfoContainer({datasetInfo,dataID, isFetched, setTabHeader}) {

    const experimentInfoName = "Experimental Info"
    const headerRef = useRef(null)
    const isVisible = useOnScreen(headerRef)

    const keyfigureMetrices = useMemo(() => {
        if (!_.isObject(datasetInfo)) return []
        return datasetInfo.keyFigureNames.map(figureName => {return {label : figureName, metric : datasetInfo.info[figureName]}})
    }, [dataID,isFetched])


    useEffect(() => {
        if (_.isObject(datasetInfo) && _.has(datasetInfo, ["info","Title"]) && !isVisible) {
            setTabHeader(datasetInfo.info.Title)
        }
        else {
            setTabHeader("")
    }}, [isVisible])
    return (
        <div className="container--scroll-y-hide-x div--expand intent-margin-top">
            
            <div id="top" className="flex flex-column center-items">
                <div ref={headerRef} className="intent-margin-top">
                <Header text={datasetInfo.info.Title} fontSize="2.5rem" hexColor={"#000000"} fontWeight={300}/>
                </div>
                <AuthorList emailSubject={`Related to dataset '${datasetInfo.info.Title}'`} />
                <div className="font-size--small intent-margin-top--little">
                    {readDateFromStringAndReturnDateAndDistToNow({dateString : datasetInfo.info["Creation Date"]} )}
                </div>
           
                <div id="keyfigures" className="intent-margin-top">
                <MultipleMetrices metrices={keyfigureMetrices}/>
                </div >
                
            <div id = "groupings" className="flex justify-space-around intent-margin-top">
                <GroupingTable grouping={datasetInfo.info.groupings} />
            </div>
            
            </div>
            
            <div id="expinfo" className="intent-margin-left intent-margin-right--little">
            <div> Experimental Information</div>
            {_.has(datasetInfo.info, experimentInfoName) ?
                datasetInfo.info[experimentInfoName].map((expInfoProps, expInfoIdx) => {
                    if (!(_.has(expInfoProps,"title") && _.has(expInfoProps,"details"))) return null 
                    return (
                        <ExperimentalInfo key={`${expInfoIdx}-${expInfoProps.title}`} {...expInfoProps}/>
                    )
                })
            : null}
            </div>

            <div id="rawfiles" className="intent-margin-left intent-margin-right--little">
                
            </div>

            <HelpOverlay header="Content">
                <div className="flex flex-column">
                <a href="#top">Top</a>
                <a href="#expinfo">Experimental Information</a>
                <a href="#rawfiles">Raw files</a>
                </div>
                
            </HelpOverlay>
           
        </div>
    )
}


function DatasetOverview({ }) {

    const { datasetInfo, dataID, isLoading, isFetched, isError, error, setTabHeader } = useOutletContext()    
    

    if (isError) return <APIError error={error} />
    if (isLoading) return <div>Loading...</div>
    return (
        <DatasetInfoContainer {...{datasetInfo,setTabHeader,dataID, isFetched}} />
        // <div className="container--scroll-y-hide-x div--expand intent-margin-top">
            
        //     <div id="top" className="flex flex-column center-items">
        //         <div ref={headerRef} className="intent-margin-top">
        //         <Header text={datasetInfo.info.Title} fontSize="1.8rem" />
        //         </div>
        //         <AuthorList emailSubject={`Related to dataset '${datasetInfo.info.Title}'`} />
                
           
        //         <div id="keyfigures" className="intent-margin-top">
        //         <MultipleMetrices metrices={keyfigureMetrices}/>
        //         </div >
                
        //     <div id = "groupings" className="flex justify-space-around intent-margin-top">
        //         <GroupingTable grouping={datasetInfo.info.groupings} />
        //     </div>
            
        //     </div>
            
        //     <div id="expinfo" className="intent-margin-left intent-margin-right--little">
        //     <div> Experimental Information</div>
        //     {_.has(datasetInfo.info, experimentInfoName) ?
        //         datasetInfo.info[experimentInfoName].map((expInfoProps, expInfoIdx) => {
        //             if (!(_.has(expInfoProps,"title") && _.has(expInfoProps,"details"))) return null 
        //             return (
        //                 <ExperimentalInfo key={`${expInfoIdx}-${expInfoProps.title}`} {...expInfoProps}/>
        //             )
        //         })
        //     : null}
        //     </div>

        //     <div id="rawfiles" className="intent-margin-left intent-margin-right--little">
        //         <div>Raw files</div>
        //         {_.range(100).map(i => <p>{i}</p>)}
        //     </div>

        //     <HelpOverlay header="Content">
        //         <div className="flex flex-column">
        //         <a href="#top">Top</a>
        //         <a href="#expinfo">Experimental Information</a>
        //         <a href="#rawfiles">Raw files</a>
        //         </div>
                
        //     </HelpOverlay>
           
        // </div>
    )
}


export default DatasetOverview