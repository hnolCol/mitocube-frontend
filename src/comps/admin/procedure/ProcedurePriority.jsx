import hooks from "@mitocube/api-hooks"
import _ from "lodash"
import { useEffect } from "react"

/**
 * React component to display procedure priority
 * @param {Object} props  
 * @param {String} props.tag The tag of the procedure to display the priority
 */
export function ProcedurePriority({ procedure_tag, update }) {

    const { data: procedurePriority, isError, isSuccess, error, refetch } =
        hooks.maintenance.procedures.useGetMaintenanceProcedurePriority({ procedure_tag });

    useEffect(() => {
        if (update) refetch();
    }, [update]);

    if (isError) console.log(error);

    return <span>{isSuccess ? procedurePriority : null}</span>;
}
