import { Button, Dialog, DialogBody, DialogFooter, InputGroup } from "@blueprintjs/core";
import { useGetAttributes } from "../../../../hooks/queries/attribute.hooks";
import { AttributesInput } from "../../../core/input/api/DatasetAttributeInput";
import { DateInput3, DatePicker3 } from "@blueprintjs/datetime2";
import { useGetPerformancePeptides } from "../../../../hooks/queries/performance.hooks";
import Loading from "../../../core/base/loading";

import _ from "lodash"
import { useState } from "react";
import { TraitWithValueInput} from "../../../core/base/tags/TraitWithValueInput";
import { aggregateAttributeValues } from "../../../../services/arrays/groupby";

export function AddQCRunDialog({ isOpen }) {


    const [qcProps, setQCProps] = useState({ attributes: [] })


    const { isLoading, isFetching, data: qcAttributes } = useGetAttributes({ param_name: "allow_for_qc" })
    const { data : qcpeptides, isLoading : qcPeptidesIsLoading, isFetching : qcPeptidesIsFetching} = useGetPerformancePeptides()

    /**
     * 
     * @param {import("../../../../types/attributes").Attribute} attribute 
     * @param {import("../../../../types/attributes").AttributeValue} attributeValue 
     */
    const handleAttributeSelection = (attribute, attributeValue) => {
        
        const selectedAttributes = qcProps.attributes.slice()
        const filteredAttributes = qcProps.attributes.filter(attrValue => attrValue[0].tag === attribute.tag && attrValue[1].tag === attributeValue.tag)
        
        if (filteredAttributes.length > 0)
            setQCProps(prevValues => {
                return {
                    ...prevValues,
                    attributes: selectedAttributes.filter(attrValue => attrValue[0].tag !== attribute.tag && attrValue[1].tag !== attributeValue.tag)
                }
            })
        else {
            setQCProps(prevValues => {
                return {
                    ...prevValues,
                    attributes: _.concat(prevValues.attributes, [[attribute, attributeValue]])
                }
            })
        }
    }


    const handleAttributeValueRemove = (attributeValue) => {

        setQCProps(prevValues => {return{...prevValues, attributes : _.filter(prevValues.attributes, attrValue => attrValue[1].tag !== attributeValue.tag)}})
    }
    console.log(qcProps.attributes)
    console.log(aggregateAttributeValues({attributeValuePair : qcProps.attributes}))
    return <Dialog isOpen={isOpen} canEscapeKeyClose canOutsideClickClose title="Add QC Run">

        <DialogBody>
            <div className="flex justify-end"><Button icon="import" minimal small intent="danger" text="from file" /></div>
            
            <h4>Date</h4>
            <DateInput3 disableTimezoneSelect dateFnsFormat="yyyy-MM-dd" onChange={console.log}/>
            <h4>Attributes</h4>
            <p>Add attributes to describe the qc run which can afterwards be used to compare the qc runs and to obtain longitudinal information about the performance. </p>

            <AttributesInput
                showSelection={false}
               // selectedAttributes={}
                selectedItems={qcProps.attributes.map(attrValue => attrValue[1])}
                param_name={"allow_for_qc"}
                matchTargetWidth={false}
                min_state={5}
                min_search_string_length={0}
                placeHolderText="Search quality control attributes."
                handleAttributeSelection={handleAttributeSelection} />
            
            <div className="font-size--smallest">Define mass spectrometer settings, lc-system and column properties.</div>
            <div className="flex">
                {_.isArray(qcProps.attributes) ?
                    qcProps.attributes.map(attribute => <TraitWithValueInput attribute={attribute[0]} attributeValue={attribute[1]} onRemove={handleAttributeValueRemove} />)
                    : null}
            </div>
            <h4>Metrices</h4>


            <h4>Peptides</h4>
            {qcPeptidesIsFetching || qcPeptidesIsLoading ?
                <Loading /> :
                _.isArray(qcpeptides) ?
                qcpeptides.map(peptide => <p>{peptide.sequence}</p>) : null}
                
        </DialogBody>
        
        <DialogFooter minimal>
            <div className="flex">
                
                <Button text="Submit" intent="primary" />
                <Button text="Cancel" />
            </div>
        </DialogFooter>
    </Dialog>
}