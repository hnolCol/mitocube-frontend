

export function GenotypeContainer({tags}) {
    return (
        <div>
            <div style={{ height: "70vh", overflowY: "scroll", paddingBottom: "2rem" }}>
                {tags.map(tag => <div key={tag}>{tag}</div>)}
            </div>
        </div>
    )
}