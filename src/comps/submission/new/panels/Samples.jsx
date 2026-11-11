import NumericValueInput from "../../../core/input/Numeric"
import _ from "lodash"
import { SampleAttributeTableWrapper } from "../sample_attributes/select/SamplesAttributeWrapper"
import { useMemo } from "react"


export function SamplesTab({ submission, setSubmission, setComponentKey, componentKey,  }) {
    
    // const {data : genotypes, isLoading : genotypeIsLoading, error : genotypeError, isError : genotypeIsError, refetch : refetchGenotypes } = useGetGenotypes({proteome_tags},{enabled : proteome_tags.length > 0})
    

    const onInputChange = (inputTag, inputValue) => {
        // handles the change of an attribute / attributeValue combination 

        setSubmission(prevValues => {
            {
                return { ...prevValues, [inputTag]: inputValue }
            }
        })
    }

    const selected_proteome_tags = useMemo(() => {
        if (!_.isArray(submission.selected_traits)) return []
        const proteome_attribute = submission.selected_traits.filter(a => a.type === "attribute" && a.tag === "att_proteome") 
        if (proteome_attribute.length === 0) return []
        const proteome_traits = _.get(proteome_attribute[0], "children", [])
        return proteome_traits.map(t => t.tag)
    }, [_.join(submission.selected_traits.map(t => t.tag), ",")])

    return (
        <div>
                <h3>Samples</h3>
                    <p>Sample attributes describe each sample, for example its <span className="h1-span">Genotype</span>, <span className="h2-span">Treatment</span>, or <span className="h0-span">Timepoint</span>.
                        They are used for statistics and visualization, so please define them carefully. If an attribute you need is missing, contact the administrator.</p>
                    <p>To get started, create a sample attribute in the table header and assign an attribute such as <span className="h1-span">Genotype</span> or <span className="h2-span">Treatment</span> to it.
                        Then assign values to your samples by right-clicking the table cells and choosing a value from the drop-down menu. To assign the same value to several samples, select the rows first and then pick the value.</p>
                    <p>Each attribute can be used only once, and its values must include at least <span className="h0-span">two unique values</span>.
                                Attributes that do not meet this requirement belong in the dataset attributes above.</p>
                    <NumericValueInput
                            hint="Number of replicates"
                            placeholder="Number of replicates"
                            callbackKey={"numberReplicates"}
                            value={submission.numberReplicates===0?"":_.toString(submission.numberReplicates)} onChange={(callbackKey, value) => onInputChange(callbackKey, value)} />
                    <NumericValueInput
                            disabled={submission.sampleNamesFixed}
                            hint={"Number of samples"}
                            placeholder="Number of samples"
                            callbackKey={"sampleNumber"}
                            value={submission.sampleNumber===0?"":_.toString(submission.sampleNumber)} onChange={(callbackKey, value) => onInputChange(callbackKey, value)} />
                    <SampleAttributeTableWrapper {...{
                            submission,
                            updateSubmission: setSubmission,
                            numberReplicates: submission.numberReplicates,
                            selected_proteome_tags
                        }} />
                </div>
    )
}