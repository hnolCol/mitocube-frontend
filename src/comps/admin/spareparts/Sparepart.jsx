import { SparepartSearch } from "./SparepartSearch"

export function AdminSparepart({ userRole }) {

    return (
        <div className="div--expand padding--medium">
            <SparepartSearch userRole={userRole} />
        </div>
    )
}
