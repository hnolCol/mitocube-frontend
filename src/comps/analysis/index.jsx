import { Outlet, useParams } from "react-router";
import Tabs from "../core/navigation/tabs";
import Loading from "../core/base/loading";
import _ from "lodash"
import { useEffect } from "react";

import { api } from "@/api";
    


/**
 * @description The header for the dataset view. Loads the metadata as well as the attributes. 
 * @param {*} param0 
 * @returns 
 */
function SubmissionAnalysisHeader({ }) {
    
    const params = useParams()
    const submission_tag = params.tag
    const urlStart = `/submissions/${submission_tag}`
    const { data: submissionExists, isLoading: submissionExistsLoading } = api.submissions.core.useGetSubmissionExists({ tag: submission_tag }, { enabled: _.isString(submission_tag) })
    const { mutate: insertSubmissionView } = api.submissions.views.usePostSubmissionView()


    useEffect(() => {
        let timeoutId;
        if (_.isString(submission_tag) && submission_tag.length > 0 && submissionExists) {
            insertSubmissionView({ tag: submission_tag });
            timeoutId = setTimeout(() => {
                insertSubmissionView({ tag: submission_tag });
            }, 24 * 60 * 60 * 1000); // 1 day in milliseconds
        }
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [submission_tag, submissionExists]);

    return (
        <div className="no-scroll div--expand">
            <Tabs
                tabs={[
                    { text: "Overview", to: urlStart },
                    { text: "Features", to: `${urlStart}/features` },
                    { text: "Samples", to: `${urlStart}/samples` },
                    { text: "Volcano", to: `${urlStart}/volcano` },
                    { text: "Exclusively", to: `${urlStart}/exclusively`},
                    { text: "Heatmap", to: `${urlStart}/heatmap` },
                    { text: "PCA", to: `${urlStart}/pca` }, 
                    { text: "Annotation Map", to: `${urlStart}/annotationmap` }, 
                    { text: "QC", to: `${urlStart}/qc` },
                    { text: "Timeline", to: `${urlStart}/timeline` },
                    { text: "Correlation", to: `${urlStart}/correlation` },
                    { text: "Runlist", to: `${urlStart}/runlist` },
                    { text: "Help", to : `${urlStart}/help`},
                    { text: "Comments", to: `${urlStart}/comments`}]} />   
            <div className="no-scroll div--expand">
            {submissionExistsLoading ?  <Loading /> : null}
                {(!submissionExists) ? <div className="margin--medium">Submission with tag <strong>{submission_tag}</strong> does not exist.</div> :
                    
                    <Outlet context={{ submission_tag }} />}
            
            </div>
            
        </div>
    )
}

export default SubmissionAnalysisHeader