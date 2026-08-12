import { api } from "@/api"
import _ from "lodash"
import { useEffect } from "react"


/**
 * React component to display procedure description
 * @param {Object} props  
 * @param {String} props.tag The tag of the procedure to display the description
 */
export function ProcedureDescription({ procedure_tag, update }) {

    const { data: procedureDescription, isError, isSuccess, error, refetch } =
        api.maintenance.procedures.queryMaintenanceProcedures.useGetMaintenanceProcedureDescription({ procedure_tag }, { enabled: _.isString(procedure_tag) && procedure_tag.length > 0, staleTime: Infinity });

    useEffect(() => {
        if (update) refetch();
    }, [update]);

    if (isError) console.log(error);

    return <span>{isSuccess ? procedureDescription : null}</span>;
}
