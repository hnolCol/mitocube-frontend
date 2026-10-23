
import { KeyFigure } from "./Keyfigures"
import _ from "lodash"
import { NewsView } from "./News"
import { LastViewed } from "./Views"

import { api } from "@/api"
import { TrendingSubmissions } from "./TrendingSubmissions"
import { WelcomeNavigationButtons } from "./WelcomeNavigation"

function Welcome() {

    const { isLoading: backendInfoLoading, data: backendInfo } = api.info.backend.useGetBackendInfo({staleTime : Infinity})
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
                <WelcomeNavigationButtons />
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