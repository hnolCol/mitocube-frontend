
import hooks from "@mitocube/api-hooks"
import {motion} from "framer-motion"
import _ from "lodash"
import { ConditionApplicationsView } from "../../core/base/condition_applications/ConditionApplicationView";
import { Attribute } from "../../core/base/attributes/Attribute";

/**
 * SampleItem component to display individual sample information. 
 * The information of the sample are retrieved from the database. 
 * @param {Object} props
 * @param {String} props.tag - The tag of the sample to be displayed.
 * @returns {JSX.Element} The SampleItem component.
 */

export function SampleItem({ tag, display_condition_applications = true }) {

    const { data: sample } = hooks.samples.useGetSample({ tag }, { enabled: !!tag });

    const { data : condition_applications} = hooks.samples.useGetSampleConditionApplications({tag, group_by_attribute : true}, {enabled : !!tag && display_condition_applications})

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

            
            {/* Display the condition application */}
            {_.isArray(condition_applications) && display_condition_applications && condition_applications.map(ca_prop => {

                return <div key={ca_prop.attribute_tag} style={{ marginTop: "8px" }}>

                    <Attribute attribute_tag={ca_prop.attribute_tag} />
                {
                    ca_prop.condition_application_tags.map(ca_tag => {
                        return <ConditionApplicationsView tag={ca_tag} />
                    })
                }
                </div>
            })
            }
        </div>
    )
}