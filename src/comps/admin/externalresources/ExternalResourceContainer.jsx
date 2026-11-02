import { ExternalResourceItem } from "./ExternalResourceItem"

export function ExternalResourceContainer({ tags }) {
    return (
        <div style={{ height: "70vh", overflowY: "scroll", paddingBottom: "5rem", paddingRight: "0.5rem" }} className="flex flex-column">
            {tags.map((tag, idx) => (
                <div key={`${tag}-${idx}`} className="flex margin-bottom--little">
                    <ExternalResourceItem tag={tag} />
                </div>
            ))}
        </div>
    )
}