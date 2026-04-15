import { api } from "@/api"
import _ from "lodash"
import { useEffect } from "react"

/**
 * React component to display procedure text
 * @param {Object} props  
 * @param {String} props.tag The tag of the procedure to display the text
 */
export function ProcedureText({ procedure_tag, update }) {

    const { data: procedureText, isError, error, isSuccess, refetch } =
        api.maintenance.procedures.queryMaintenanceProcedures.useGetMaintenanceProcedureText({ procedure_tag });

    useEffect(() => {
        if (update) refetch();
    }, [update]);

    if (isError) console.log(error);

    return <span>{isSuccess && _.isString(procedureText) ? procedureText : null}</span>;
}
