import { SymptomsSearch } from "./SymptomsSearch"

export function AdminSymptoms({ userRole }) {
    return (
        <div className="div--expand padding--medium">
            <SymptomsSearch userRole={userRole} />
        </div>
    )
}