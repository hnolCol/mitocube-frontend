
import { KeyFigure } from "./Keyfigures"
import _ from "lodash"
import { NewsView } from "./News"
import { LastViewed } from "./Views"

import { api } from "@/api"
import {  useNavigate } from "react-router"
import { TrendingSubmissions } from "./TrendingSubmissions"
import { getDashBoardIcon } from "../core/navigation/dashboard/Icons"
import { BaseDashboardIcon } from "../core/svg/icons/dashboard/IconBase"

function Welcome() {

    const { isLoading: backendInfoLoading, data: backendInfo } = api.info.backend.useGetBackendInfo({staleTime : Infinity})
    const navigate = useNavigate()
    return (
        <div className="flex flex-column center-items div--expand">
            <div className="main-header">
                {backendInfoLoading || !_.isObject(backendInfo) ? null : `Welcome to ${backendInfo.app_name}`}
            </div>
            <div>
                <p>{backendInfoLoading || !_.isObject(backendInfo) || !_.isString(backendInfo.app_description)? null : `${backendInfo.app_description}`}</p>
            </div>
            <KeyFigure />
            <div>

                <div className="flex flex-column center-items" style={{gap : "1rem", marginTop : "2rem"}}>
                    <h3>Where would you like to go?</h3>
                <div className="flex justify-space-around" style={{width : "max(90vw, 90%)"}}>
                    
                    <button className="basic-button" onClick={() => navigate("/submissions/new")}>
                        <div className="flex center-items flex-column">
                            <BaseDashboardIcon width={100} height={100}>
                                {getDashBoardIcon("SampleSubmission", { fillColor: "#466688" })}
                            </BaseDashboardIcon>
                            <span style={{fontSize: "1.5rem"}}>New Submission</span>
                        </div>
                    </button>
                    <button className="basic-button" onClick={() => navigate("/datasets")}>
                        <div className="flex center-items flex-column">
                            <BaseDashboardIcon width={100} height={100}>
                                {getDashBoardIcon("Dataset", { fillColor: "#466688" })}
                            </BaseDashboardIcon>
                            <span style={{fontSize: "1.5rem"}}>Explore Datasets</span>
                        </div>
                    </button>
                    <button className="basic-button" onClick={() => navigate("/protein/selection")}>
                        <div className="flex center-items flex-column">
                            <BaseDashboardIcon width={100} height={100}>
                                {getDashBoardIcon("Protein", { fillColor: "#466688" })}
                            </BaseDashboardIcon>
                            <span style={{fontSize: "1.5rem"}}>Explore Proteins</span>
                        </div>
                    </button>
                    

                    </div>
                </div>
            <div className="flex flex-wrap justify-flex-start" style={{width : "93vw", gap : "2rem",marginTop: "3rem", height: "max(50vh,300px)",}}>
                    <NewsView />
                    
                    <LastViewed user_tag={null} type="submissions" />
                    <TrendingSubmissions />
                </div>
     
            </div>

        </div>
    )
}


export default Welcome