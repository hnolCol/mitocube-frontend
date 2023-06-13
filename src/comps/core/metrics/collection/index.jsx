import Numeric from "../Numeric"
import PropTpyes from "prop-types"
import _ from "lodash"
import Categorical from "../Categorical"


MultipleMetrices.propTypes = {
    metrices : PropTpyes.arrayOf(PropTpyes.object)
}

function MultipleMetrices({ metrices = [
    { label: "Datasets", metric: 23 },
    { label: "Proteins", metric: 7808 },
    { label: "Users", metric: 27 }] }) {
    // display an animated metric (e.g. number)
    return (
        <div className="flex flex--wrap">
            {_.map(metrices, (metricProps, metricIdx) =>
                _.isNumber(metricProps.metric)?
                <Numeric
                    key={`${metricIdx}-${metricProps.label}`}
                    spanClassName={`h${metricIdx % 4}-span`}
                    {...metricProps}
                    /> :
                <Categorical
                    key={`${metricIdx}-${metricProps.label}`}
                    spanClassName={`h${metricIdx % 4}-span`}
                    {   ...metricProps}/>)}
        </div>
        )
}


export default MultipleMetrices