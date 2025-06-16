import NumericValueInput from "../../../core/input/Numeric"
import _ from "lodash"
import { SampleAttributeTableWrapper } from "../attribute/select/SamplesAttributeWrapper"
import { useGetGenotypes } from "../../../../hooks/queries/genotype.hooks"
import { get_proteome_id } from "../InitialSubmission"


export function SamplesTab({ submission, setSubmission, setComponentKey, componentKey,  }) {
    
    const proteome_tags = get_proteome_id(submission.datasetAttributeValues)
    console.log(proteome_tags)
    const {data : genotypes, isLoading : genotypeIsLoading, error : genotypeError, isError : genotypeIsError, refetch : refetchGenotypes } = useGetGenotypes({proteome_tags},{enabled : proteome_tags.length > 0})
    

    const onInputChange = (inputTag, inputValue) => {
        // handles the change of an attribute / attributeValue combination 

        setSubmission(prevValues => {
            {
                return { ...prevValues, [inputTag]: inputValue }
            }
        })
    }

    return (
        <div>
                <h3>Samples</h3>
                    <p>A sample attribute defines unique attributes such as <span className="h1-span">Genotype</span>, <span className="h2-span">Treatment</span>, and <span className="h0-span">Timepoint</span> for each sample.
                        The samplesAttributes are used to calculated statistics on the dataset as well as for visualization. Therefore it is crucical that the groupings are defined in a meticulous way. If you cannot find a specific attribute please contact the administrator.
                    </p>
                    <p>First, create a sample attribute and name it in the table header. Then specify an attribute such as <span className="h1-span">Genotype</span> or <span className="h2-span">Treatment</span>.
                        After attribute selection you will be able to select from a defined set of attribute values from the drop-down menu (right click on the table cells).
                        If you want to assign an attribute value to multiple rows, select the rows and then choose the attribute value from the drop-down menu.</p>
                    <p>An attribute can only be assigned to a <span className="h0-span">single sample attribute</span> and the attribute values must have at least <span className="h0-span">two unique values</span>.
                                Otherwise they should be specified as dataset attributes above.</p>
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
                            genotypes,
                            updateSubmission: setSubmission,
                            numberReplicates: submission.numberReplicates
                        }} />
                </div>
    )
}