import _ from "lodash"
import { useEffect, useState } from "react";
import { Checkbox, Button, TextArea, Tag } from "@blueprintjs/core";
import { useQueryClient } from "@tanstack/react-query";
import { ConditionApplicationsView } from "../../core/base/condition_applications/ConditionApplicationView";
import { Attribute } from "../../core/base/attributes/Attribute";
import { SampleGenotype } from "./SampleGenotype";
import { api } from "@/api";
import { Comment } from "../../submission/comments/Comment";

/**
 * SampleItem component to display individual sample information. 
 * The information of the sample are retrieved from the database. 
 * @param {Object} props
 * @param {String} props.tag - The tag of the sample to be displayed.
 * @param {String} props.submission_tag - The tag of the submission to check for genotype.
 * @param {Boolean} props.display_condition_applications - Whether to display condition applications.
 * @returns {JSX.Element} The SampleItem component.
 */

export function SampleItem({ tag, submission_tag, display_condition_applications = true, updateTrigger = undefined }) {
    const queryClient = useQueryClient();
    const [showComments, setShowComments] = useState(false);
    const [commentContent, setCommentContent] = useState("");
    const { data: sample, refetch : getSample } = api.samples.core.useGetSample({ tag }, { enabled: _.isString(tag), staleTime: 600000 });
    const { data: hasGenotype, refetch : getHasGenotype } = api.submissions.core.useGetSubmissionHasGenotype({tag : submission_tag}, { enabled: _.isString(submission_tag), defaultValue : false, staleTime: 600000})
    const { data : condition_applications, refetch : getConditionApplications} = api.samples.core.useGetSampleConditionApplications({tag, group_by_attribute : true}, {enabled : _.isString(tag) && display_condition_applications, staleTime: 600000})
    const { data: comments } = api.samples.core.useGetSampleComments(
        { tag }, 
        { enabled: _.isString(tag) && showComments, staleTime: 0 }
    );

    const { mutate: setSampleExcluded } = api.samples.core.useSetSampleExcluded({
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["getSampleInfo", tag] })
    });

    const { mutate: setSampleLost } = api.samples.core.useSetSampleLost({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getSampleInfo", tag] });
            queryClient.invalidateQueries({ queryKey: ["getSubmissionSamplesFull", submission_tag] });
        }
    });

    const { mutate: postComment, isLoading: isPosting } = api.samples.core.usePostSampleComment({
        onSuccess: () => {
            setCommentContent("");
            queryClient.invalidateQueries({ queryKey: ["getSampleComments", tag] });
        }
    });

    const excluded = _.isObject(sample) ? !!sample.excluded : false;
    const lost = _.isObject(sample) ? !!sample.lost : false;

    useEffect(() => { 
        if (_.isString(tag) && _.isString(submission_tag) && _.isNumber(updateTrigger)) {
            getSample();
            getHasGenotype();
            getConditionApplications();
        }
    }, [updateTrigger]);

    const handlePostComment = () => {
        if (!commentContent.trim()) return;
        postComment({ tag, content: commentContent.trim() });
    };

    const buildCommentTree = (commentList) => {
        const map = {};
        const roots = [];
        commentList.forEach((c) => { map[c.tag] = { ...c, responses: [] }; });
        commentList.forEach((c) => {
            if (c.response_to && map[c.response_to]) {
                map[c.response_to].responses.push(map[c.tag]);
            } else {
                roots.push(map[c.tag]);
            }
        });
        return roots;
    };

    return (
        <div
            style={{
                position: 'relative',
                background: '#f5f5f5',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                opacity: excluded || lost ? 0.5 : 1,
            }}>
            <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <Checkbox
                    checked={excluded}
                    label="Exclude from statistical analysis"
                    onChange={(e) => setSampleExcluded({ tag, excluded: e.target.checked })}
                />
                <Checkbox
                    checked={lost}
                    label="Sample lost"
                    onChange={(e) => setSampleLost({ tag, lost: e.target.checked })}
                />
            </div>
            {tag}
            {_.isObject(sample) && sample.text ? <div>{sample.text}</div> : null}

            {lost ? (
                <div style={{ marginTop: '8px' }}>
                    <Tag intent="danger" icon="warning-sign" minimal={false}>
                        Sample lost
                    </Tag>
                </div>
            ) : null}

            {hasGenotype ? <div style={{ marginTop: "8px", alignItems: "flex-start", display: "flex", flexDirection: "column" }}>
                <h4><Attribute attribute_tag={'att_genotype'} /></h4>
                <SampleGenotype tag={tag} />
            </div> : null}
            
            {/* Display the condition application */} 
            {_.isArray(condition_applications) && display_condition_applications && condition_applications.map(ca_prop => {

                return <div key={ca_prop.attribute_tag} style={{ marginTop: "8px", alignItems: "flex-start", display: "flex", flexDirection: "column" }}>

                    <h4><Attribute attribute_tag={ca_prop.attribute_tag} /></h4>
                    <div className="flex">
                    {
                    ca_prop.condition_application_tags.map(ca_tag => {
                        return <ConditionApplicationsView key={ca_tag} tag={ca_tag} />
                    })
                    
                        }
                    </div>
                </div>
            })
            }

            <div style={{ marginTop: "8px" }}>
                <Button
                    minimal
                    small
                    icon="comment"
                    text={`Comments${_.isArray(comments) ? ` (${comments.length})` : ""}`}
                    onClick={() => setShowComments(!showComments)}
                />
            </div>

            {showComments ? (
                <div style={{ textAlign: "left", marginTop: "8px", borderTop: "1px solid #e0e0e0", paddingTop: "8px" }}>
                    {_.isArray(comments) && buildCommentTree(comments).map((comment) => (
                        <Comment
                            key={comment.tag}
                            comment={comment}
                            onReply={(replyContent, parentTag) => postComment({ tag, content: replyContent, response_to: parentTag })}
                        />
                    ))}
                    <div style={{ display: "flex", gap: "6px", alignItems: "flex-end", marginTop: "8px" }}>
                        <TextArea
                            fill
                            placeholder="Write a comment..."
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            rows={1}
                            style={{ resize: "none", fontSize: 13 }}
                        />
                        <Button
                            intent="primary"
                            icon="send-message"
                            onClick={handlePostComment}
                            disabled={!commentContent.trim() || isPosting}
                            loading={isPosting}
                        />
                    </div>
                </div>
            ) : null}
        </div>
    )
}
