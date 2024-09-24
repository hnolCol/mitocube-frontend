import { Dialog } from "@blueprintjs/core";
import { useGetAttributes } from "../../../../hooks/queries/attribute.hooks";
import { AttributesInput } from "../../../core/input/api/DatasetAttributeInput";



export function AddQCRunDialog({ isOpen }) {

    const {isLoading, isFetching, data : qcAttributes} = useGetAttributes({param_name : "allow_for_qc"})
    return <Dialog isOpen={isOpen} canEscapeKeyClose canOutsideClickClose title = "Add QC Run">
        <p>Add attributes to describe the qc run which can afterwards be used to compare the qc runs and to obtain longitudinal information about the performance. </p>
        <AttributesInput param_name={"allow_for_qc"} matchTargetWidth={false} min_state={5} min_search_string_length={0} placeHolderText="Search quality control attributes."/>
    </Dialog>
}