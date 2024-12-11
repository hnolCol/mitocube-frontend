import { useGetSampleAttributes } from "../../../../hooks/queries/submission.hooks";
import _ from "lodash"
import { Attribute } from "./Attribute";
import PropTypes from 'prop-types'
import { Button, Collapse } from "@blueprintjs/core";
import { useState } from "react";
import { addStringToArrayOrRemove } from "../../../../services/arrays/transforms";
import { StaticTrait } from "../traits/StaticTrait";


SampleAttributesView.propTypes = {
    submission_tag: PropTypes.string.isRequired,
    minimal: PropTypes.bool
}

SampleAttributesView.defaultProps = {
    minimal: true
}
/**
 * @description Representation of the sample attributes 
 * @param {Object} props 
 * @param {String} props.submission_tag The submission tag.
 * @param {Boolean} props.minimal If true, a summary of the sample attributes is given, but no
 * information about each sample is given. 
 * @returns 
 */
export function SampleAttributesView({ submission_tag, minimal }) {
    
    const [showSamplesFor, setShowSamples] = useState([])
    const { data, isSuccess } = useGetSampleAttributes({ submission_tag }, {enabled : _.isString(submission_tag)})
    const attributes = isSuccess && _.isObject(data) && _.isObject(data.sample_attributes) &&
        _.isObject(data.sample_map) ? _.keys(data.sample_attributes) : []
    
    return (
        <div>
            <div>
                {attributes.map(attribute_tag => {
                    if (!_.has(data.sample_attributes, attribute_tag)) return null
                    const sample_attrs = data.sample_map[attribute_tag]
                    const unique_traits = _.uniq(_.values(sample_attrs))
                    return (
                        <div className={`flex ${minimal?"":"flex-column"}`}>
                            <Attribute attribute_tag={attribute_tag} />
                            <div className={`flex ${minimal?"":"flex-column"}`}>
                                {unique_traits.map(trait_tag => <div>
                                    <div className="flex" key = {trait_tag}>
                                    <StaticTrait
                                        attribute_tag={attribute_tag}
                                        trait_tag={trait_tag}
                                        suffix={`(${_.isArray(data.sample_attributes[attribute_tag][trait_tag]) ? data.sample_attributes[attribute_tag][trait_tag].length : ""})`} //add number of samples
                                        submission_tag={submission_tag}
                                        showDescription={false} />
                                        {!minimal ? <Button icon="chevron-down" minimal small
                                            onClick={() => setShowSamples(addStringToArrayOrRemove({ array: showSamplesFor, string: `${attribute_tag}${trait_tag}` }))} /> : null}
                                    </div>
                                    {!minimal ?
                                        <Collapse isOpen={showSamplesFor.indexOf(`${attribute_tag}${trait_tag}`) !== -1}>
                                        <div className="flex flex-column flex-wrap">
                                            
                                            {data.sample_attributes[attribute_tag][trait_tag].map(sampleIndex => {

                                                return (<div key={sampleIndex+"sample_text"}  className="font-size--smallest">{data.sample_map["sample_text"][sampleIndex]}
                                                </div>)
                                            })}
                                        </div>
                                        </Collapse>   
                                    
                                : null}
                                
                                </div>)}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}