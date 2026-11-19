import { ProcedureSearch } from "./ProcedureSearch"

export function AdminProcedure({ userRole }) {

    return (
        <div className="div--expand padding--medium">
            <ProcedureSearch userRole={userRole} />
        </div>
    )
}
