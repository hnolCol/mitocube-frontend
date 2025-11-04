import _ from "lodash";
import PropTypes from "prop-types"; 
import hooks from "@mitocube/api-hooks"
import { Boxplot } from "../../core/charts/boxplot/Boxplot";
import CategoricalBoxplot from "../../core/charts/categorical/boxplot";
import ResultChart from "../../protein/charts/resultCard/chart";

FeatureDataView.propTypes = {
    features : PropTypes.arrayOf(PropTypes.string).isRequired
}
FeatureDataView.defaultProps = {
    features: []
};

export function FeatureData({ feature_tag, submission_tag }) {
    const { data, isLoading } = hooks.features.data.useGetFeatureDataForSubmission({ tag: feature_tag, submission_tag }, { enabled: !!feature_tag && !!submission_tag, staleTime: 60000 });
    console.log(data)
    return <div>{feature_tag}
    {isLoading ? <div>Loading...</div> : <ResultChart yaxisName="value" data={data.data}  sample_attribute_tags={["att_environment_treatment"]}/> }
    
    </div>
}

export function FeatureDataView({ feature_tags, submission_tag }) {


    return <div>
        <h3>Feature Plots</h3>
        <div className="flex">

            {_.isArray(feature_tags) ? feature_tags.map((feature_tag, idx) => {
                return <div key={`${feature_tag}-${idx}`} className="flex flex-column margin-right--little">
                    <div>{feature_tag}</div>
                    <FeatureData feature_tag={feature_tag} submission_tag={submission_tag} />
                </div>
            })
                : null}

        </div>
        </div>
}