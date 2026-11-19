import { ExternalServiceSearch } from "./ExternalServiceSearch"

export function AdminExternalService({ userRole }) {

    return (
        <div className="div--expand padding--medium">
            <ExternalServiceSearch userRole={userRole} />
        </div>
    )
}
