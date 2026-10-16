import _ from "lodash"
import { OptionButton } from "@/comps/core/base/buttons/OptionButton"
import { api } from "@/api"


function ConsortiumOption({ tag, isSelected, onClick }) {
    const { data } = api.consortiums.useGetConsortiumByTag({ tag })
    return (
        <OptionButton isSelected={isSelected} onClick={onClick}>
            {data?.text ?? tag}
        </OptionButton>
    )
}

export function ConsortiumFilter({ submissionFilter, setSubmissionFilter }) {
    const { data: consortiumTags = [], isSuccess } = api.consortiums.useGetUserConsortiums()
    const selected = submissionFilter.consortium_tags ?? []

    const toggle = (tag) => {
        setSubmissionFilter(prev => {
            const current = prev.consortium_tags ?? []
            const next = current.includes(tag) ? _.without(current, tag) : [...current, tag]
            if (next.length === 0) {
                const { consortium_tags, ...rest } = prev
                return rest
            }
            return { ...prev, consortium_tags: next }
        })
    }

    if (!isSuccess || consortiumTags.length === 0) return null

    return consortiumTags.map(tag => (
        <ConsortiumOption
            key={tag}
            tag={tag}
            isSelected={selected.includes(tag)}
            onClick={() => toggle(tag)}
        />
    ))
}