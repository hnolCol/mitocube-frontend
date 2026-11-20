import { Outlet, useLocation, useParams } from "react-router";
import { NonIdealState } from "@blueprintjs/core";
import GroupedTabs from "../core/navigation/tabs/GroupedTabs";
import Loading from "../core/base/loading";
import _ from "lodash"
import { useEffect } from "react";

import { api } from "@/api";

const NOT_AVAILABLE_NOTE = "no data"
const NOT_AVAILABLE_HINT = "This analysis is not available without quantification data."
const FEATURES_NOT_AVAILABLE_HINT = "This view is not available without protein group or precursor quantification data."
const PRECURSORS_NOT_AVAILABLE_HINT = "This view is not available without precursor quantification data."


/**
 * @description The header for the dataset view. Loads the metadata as well as the attributes. 
 */
function SubmissionAnalysisHeader({ authenticationStatus }) {
    const params = useParams()
    const submission_tag = params.tag
    const urlStart = `/submissions/${submission_tag}`

    const { data: submissionExists, isLoading: isSubmissionExistsLoading } = api.submissions.core.useGetSubmissionExists(
        { tag: submission_tag },
        { enabled: _.isString(submission_tag) }
    )
    const { data: permissions, isLoading: isPermissionsLoading } = api.submissions.permissions.useGetSubmissionPermissionsByTag(
        { tag: submission_tag },
        { enabled: _.isString(submission_tag), staleTime: 60000 }
    )
    const { mutate: insertSubmissionView } = api.submissions.views.usePostSubmissionView()

    const { data: quantificationExists } = api.submissions.quantifications.useGetSubmissionQuantificationExists(
        { tag: submission_tag, quantification_type: "any" },
        { staleTime: 60000, enabled: _.isString(submission_tag) }
    )
    const { data: proteinGroupQuantificationExists } = api.submissions.quantifications.useGetSubmissionQuantificationExists(
        { tag: submission_tag, quantification_type: "protein_groups" },
        { staleTime: 60000, enabled: _.isString(submission_tag) }
    )
    const { data: precursorQuantificationExists } = api.submissions.quantifications.useGetSubmissionQuantificationExists(
        { tag: submission_tag, quantification_type: "precursors" },
        { staleTime: 60000, enabled: _.isString(submission_tag) }
    )
    const analysisDisabled = quantificationExists === false
    const featuresDisabled = proteinGroupQuantificationExists === false && precursorQuantificationExists === false
    const precursorsDisabled = precursorQuantificationExists === false

    const location = useLocation()
    const { data: submissionTitle } = api.submissions.title.useGetSubmissionTitle(
        { tag: submission_tag },
        { enabled: _.isString(submission_tag), staleTime: 300000 }
    )
    const isOnOverview = location.pathname === urlStart || location.pathname === urlStart + "/"

    const canView = permissions?.view === true

    useEffect(() => {
        let timeoutId;
        if (_.isString(submission_tag) && submission_tag.length > 0 && submissionExists && canView) {
            insertSubmissionView({ tag: submission_tag });
            timeoutId = setTimeout(() => {
                insertSubmissionView({ tag: submission_tag });
            }, 24 * 60 * 60 * 1000); // 1 day in milliseconds
        }
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [submission_tag, submissionExists, canView]);

    if (isSubmissionExistsLoading || isPermissionsLoading) {
        return <Loading />
    }

    if (!submissionExists) {
        return (
            <NonIdealState
                icon="search"
                title="Submission not found"
                description={<>Submission with tag <strong>{submission_tag}</strong> does not exist.</>}
            />
        )
    }

    if (!canView) {
        return (
            <NonIdealState
                icon="lock"
                title="No access"
                description="You do not have permission to view this submission."
            />
        )
    }

    const withAnalysisAvailability = (tabs) => tabs.map(tab => analysisDisabled
        ? { ...tab, disabled: true, note: NOT_AVAILABLE_NOTE, disabledHint: NOT_AVAILABLE_HINT }
        : tab)

    const tabGroups = [
        {
            text: "Overview & Info",
            tabs: [
                { text: "Overview", to: urlStart, exact: true },
                { text: "Metatext", to: `${urlStart}/metatext` },
                { text: "Timeline", to: `${urlStart}/timeline` },
                { text: "Help", to: `${urlStart}/help` },
                { text: "Comments", to: `${urlStart}/comments` },
            ]
        },
        {
            text: "Samples & Setup",
            tabs: [
                { text: "Samples", to: `${urlStart}/samples` },
                { text: "Runlist", to: `${urlStart}/runlist` },
            ]
        },
        {
            text: "Data",
            tabs: [
                { text: "Features", to: `${urlStart}/features`, disabled: featuresDisabled, note: featuresDisabled ? NOT_AVAILABLE_NOTE : undefined, disabledHint: featuresDisabled ? FEATURES_NOT_AVAILABLE_HINT : undefined },
                { text: "Precursors", to: `${urlStart}/precursors`, disabled: precursorsDisabled, note: precursorsDisabled ? NOT_AVAILABLE_NOTE : undefined, disabledHint: precursorsDisabled ? PRECURSORS_NOT_AVAILABLE_HINT : undefined },
            ]
        },
        {
            text: "Analysis",
            tabs: withAnalysisAvailability([
                { text: "QC", to: `${urlStart}/qc` },
                { text: "Volcano", to: `${urlStart}/volcano` },
                { text: "Exclusively", to: `${urlStart}/exclusively` },
                { text: "Compare", to: `${urlStart}/compare` },
                { text: "Heatmap", to: `${urlStart}/heatmap` },
                { text: "PCA", to: `${urlStart}/pca` },
                { text: "Annotation Map", to: `${urlStart}/annotationmap` },
            ])
        },
    ]

    return (
        <div className="no-scroll div--expand" style={{ display: "flex", flexDirection: "column" }}>
            <div className="flex center-items justify-space-between">
                <GroupedTabs groups={tabGroups} storageScope={submission_tag} />
                {!isOnOverview && _.isString(submissionTitle) ? <span className="font-size--small font-weight--bold" style={{ padding: "0.3rem 1rem", overflowWrap: "anywhere" }}>{submissionTitle}</span> : null}
            </div>
            <div className="no-scroll div--expand" style={{ flex: 1, minHeight: 0 }}>
                <Outlet context={{ submission_tag, authenticationStatus }} />
            </div>
        </div>
    )
}

export default SubmissionAnalysisHeader