import { Button } from "@blueprintjs/core";
import hooks from "@mitocube/api-hooks" 
import { Tooltip } from "@visx/tooltip";
import _ from "lodash"
import { copyTextToClipboard } from "../../../services/clipboard";
import { useState } from "react";

export function CopySubmissionSampleTags({ submission_tag }) {
    const [copied, setCopied] = useState(false);

    function handleCopy() {
        copyTextToClipboard(_.join(sample_tags, "\n"));
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }
    const { data: sample_tags, isLoading, refetch } = hooks.submissions.samples.useGetSubmissionSampleTags({ tag: submission_tag }, { enabled: _.isString(submission_tag), staleTime: 60 });
    if (isLoading) return null

    return (
        <div className="flex flex-column" style={{ alignItems: "flex-end" }}>
            {/* <Tooltip content="Copy all sample tags to clipboard"> */}
            <Button small minimal intent="primary" icon="clipboard" text="" onClick={handleCopy} disabled={isLoading || !_.isArray(sample_tags) || sample_tags.length === 0} />
            <div className="font-size--smallest" style={{ marginTop: "0.2rem" }}>{copied ? "Copied!" : "(Copy sample names)"}</div>
        </div>
    );
}   
