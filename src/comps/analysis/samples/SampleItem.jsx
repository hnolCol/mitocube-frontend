
import _ from "lodash"
import { ConditionApplicationsView } from "../../core/base/condition_applications/ConditionApplicationView";
import { Attribute } from "../../core/base/attributes/Attribute";
import { SampleGenotype } from "./SampleGenotype";
import { api } from "@/api";
/**
 * SampleItem component to display individual sample information. 
 * The information of the sample are retrieved from the database. 
 * @param {Object} props
 * @param {String} props.tag - The tag of the sample to be displayed.
 * @returns {JSX.Element} The SampleItem component.
 */

export function SampleItem({ tag, display_condition_applications = true }) {

    const { data: sample } = api.samples.core.useGetSample({ tag }, { enabled: _.isString(tag), staleTime: 0 });
    const { data: hasGenotype } = api.submissions.core.useGetSubmissionHasGenotype({tag}, { enabled: _.isString(tag), defaultValue : false, staleTime: 0})
    const { data : condition_applications} = api.samples.core.useGetSampleConditionApplications({tag, group_by_attribute : true}, {enabled : _.isString(tag) && display_condition_applications, staleTime: 0})

    return (
        <div
            style={{
                background: '#f5f5f5',
                borderRadius: '8px',
                padding: '16px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
            {tag}
            {_.isObject(sample) && sample.text ? <div>{sample.text}</div> : null}

            {hasGenotype ? <div>
                <Attribute attribute_tag={'att_genotype'} />
                <SampleGenotype tag={tag} />
            </div> : null}
            
            {/* Display the condition application */}
            {_.isArray(condition_applications) && display_condition_applications && condition_applications.map(ca_prop => {

                return <div key={ca_prop.attribute_tag} style={{ marginTop: "8px" }}>

                    <Attribute attribute_tag={ca_prop.attribute_tag} />
                {
                    ca_prop.condition_application_tags.map(ca_tag => {
                        return <ConditionApplicationsView key={ca_tag} tag={ca_tag} />
                    })
                }
                </div>
            })
            }
        </div>
    )
}