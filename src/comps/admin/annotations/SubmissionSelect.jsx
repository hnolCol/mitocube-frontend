import { useState } from "react"
import useDebounce from "@/hooks/useDebounce"
import { api } from "@/api"
import { SubmissionTitle } from "@/comps/submission/view/SubmissionTitle"

export function SubmissionSelect({ selectedTags = [], onChange }) {
  const [search, setSearch] = useState("")
  const debounced = useDebounce(search, 250)

  const { data: raw = {} } = api.submissions.query.useGetSubmissionByQuery(
    { search_string: debounced, limit: 10, group_by_state: true },
    { enabled: debounced.length > 0 }
  )

  const results = Object.values(raw).flat()

  const remove = (tag) => onChange(selectedTags.filter(t => t !== tag))
  const add = (tag) => {
    if (!selectedTags.includes(tag)) onChange([...selectedTags, tag])
    setSearch("")
  }

  return (
    <div className="flex flex-column gap--small">
      <input
        className="text-input"
        placeholder="Link submissions..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {debounced && results.length > 0 && (
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 4, background: "#fff", maxHeight: 160, overflowY: "auto" }}>
          {results.map(tag => (
            <div
              key={tag}
              onClick={() => add(tag)}
              style={{ padding: "6px 10px", cursor: "pointer", fontSize: "0.8rem" }}
              onMouseEnter={e => e.currentTarget.style.background = "#f3f4f6"}
              onMouseLeave={e => e.currentTarget.style.background = "#fff"}
            >
              <SubmissionTitle tag={tag} showEdit={false} showCopyToClipboard={false} />
            </div>
          ))}
        </div>
      )}
      <div className="flex" style={{ flexWrap: "wrap", gap: 4 }}>
        {selectedTags.map(tag => (
          <span key={tag} style={{ background: "#e5e7eb", borderRadius: 4, padding: "2px 8px", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 4 }}>
            <SubmissionTitle tag={tag} showEdit={false} showCopyToClipboard={false} />
            <button onClick={() => remove(tag)} style={{ background: "none", border: "none", cursor: "pointer" }}>×</button>
          </span>
        ))}
      </div>
    </div>
  )
}