import PropType from 'prop-types'
import { Divider } from "@blueprintjs/core"
import { useGetSpecificSubmissionMetatextByTag } from "../../../hooks/queries/submission.hooks"
import { Loading } from "../../core/base/states/Loading"
import _ from "lodash"
import { Content, TitleText } from "../../core/metrics/ItemBasics"


ResearchAim.propTypes = {
    submission_tag : PropType.string.isRequired
}
/**
 * @description Display the research aim of a submission
 * @param {Object} props 
 * @param {String} props.submission_tag The submission tag. 
 * @returns 
 */
export function ResearchAim({ submission_tag }) {
    
    const { data : research_aim, isSuccess, isLoading, isFetching } = useGetSpecificSubmissionMetatextByTag({tag : submission_tag, metatext_tag : "metatext:research_aim"})
    return <div style={{ maxWidth: "min(45vw,800px)", textAlign: "justify" }} className="intent-margin-top--little">
            <div className="intent-margin-left--little"><TitleText title={"Abstract"} /></div>
            <Divider />
            <div className="margin--little padding--little">
                
            {isLoading || isFetching ? <Loading /> : isSuccess && _.isObject(research_aim) ? <Content text={research_aim.content} />: null  }
                {/* {metadata.metatext["metatext:research_aim"]} */}
            </div>
        <Divider />
        
        </div>
}

