import { ExternalResourceItem } from "./ExternalResourceItem"

export function ExternalResourceContainer({ tags }) {
    return (
        <div className="flex flex-column container--scroll-y-large">
            {tags.map((tag, idx) => (
                <div key={`${tag}-${idx}`} className="flex margin-bottom--little">
                    <ExternalResourceItem tag={tag} />
                </div>
            ))}
        </div>
    )
}