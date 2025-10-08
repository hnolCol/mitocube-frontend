
import { useGetBackendInfo } from "../../hooks/queries/welcome.hooks"
import { KeyFigure } from "./Keyfigures"

import _ from "lodash"
import { NewsView } from "./News"
import { ProteinQuantificationUploader } from "../core/base/files/ChunkProteinUploader"
import { PrecursorQuantificationUploader } from "../core/base/files/ChunkPrecursorUploader"
import { OpenAIChat } from "../core/openai/OpenAIChat"
import { LastViewed } from "./Views"



function Welcome() {
    const { isLoading: backendInfoLoading, data : backendInfo } = useGetBackendInfo()
    return (
        <div className="flex flex-column center-items div--expand">
            <div className="main-header">
                {backendInfoLoading || !_.isObject(backendInfo) ? null : `Welcome to ${backendInfo.app_name}`}
            </div>
            <div>
                <p>{backendInfoLoading || !_.isObject(backendInfo) && _.isString(backendInfo.app_description)? null : `${backendInfo.app_description}`}</p>
            </div>
            <KeyFigure />
            <div className="flex flex-wrap justify-flex-start" style={{width : "100%"}}>
                <NewsView />
            </div>
            {/* <ProteinQuantificationUploader />
            <PrecursorQuantificationUploader /> */}
            <LastViewed user_tag={null} type="submissions" />
            <OpenAIChat />
        </div>
    )
}



export default Welcome