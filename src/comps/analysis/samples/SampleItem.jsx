
import _ from "lodash"
import { Checkbox } from "@blueprintjs/core";
import { useQueryClient } from "@tanstack/react-query";
import { ConditionApplicationsView } from "../../core/base/condition_applications/ConditionApplicationView";
import { Attribute } from "../../core/base/attributes/Attribute";
import { SampleGenotype } from "./SampleGenotype";
import { api } from "@/api";
/**
 * SampleItem component to display individual sample information. 
 * The information of the sample are retrieved from the database. 
 * @param {Object} props
 * @param {String} props.tag - The tag of the sample to be displayed.
 * @param {String} props.submission_tag - The tag of the submission to check for genotype.
 * @param {Boolean} props.display_condition_applications - Whether to display condition applications.
 * @returns {JSX.Element} The SampleItem component.
 */

export function SampleItem({ tag, submission_tag, display_condition_applications = true }) {
    const queryClient = useQueryClient();
    const { data: sample } = api.samples.core.useGetSample({ tag }, { enabled: _.isString(tag), staleTime: 0 });
    const { data: hasGenotype } = api.submissions.core.useGetSubmissionHasGenotype({tag : submission_tag}, { enabled: _.isString(submission_tag), defaultValue : false, staleTime: 0})
    const { data : condition_applications} = api.samples.core.useGetSampleConditionApplications({tag, group_by_attribute : true}, {enabled : _.isString(tag) && display_condition_applications, staleTime: 0})

    const { mutate: setSampleExcluded } = api.samples.core.useSetSampleExcluded({
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["getSampleInfo", tag] })
    });

    const excluded = _.isObject(sample) ? !!sample.excluded : false;

    return (
        <div
            style={{
                position: 'relative',
                background: '#f5f5f5',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                opacity: excluded ? 0.5 : 1,
            }}>
            <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                <Checkbox
                    checked={excluded}
                    label="Exclude from statistical analysis"
                    onChange={(e) => setSampleExcluded({ tag, excluded: e.target.checked })}
                />
            </div>
            {tag}
            {_.isObject(sample) && sample.text ? <div>{sample.text}</div> : null}

            {hasGenotype ? <div>
                <Attribute attribute_tag={'att_genotype'} />
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
        </div>
    )
}