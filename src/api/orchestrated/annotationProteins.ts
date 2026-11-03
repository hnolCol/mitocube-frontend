import { useMemo } from "react"
import _ from "lodash"
import { useQueries } from "@tanstack/react-query"
import { apiClient } from "@/api/client"

/**
 * Fetches the protein tags of multiple annotations of a submission.
 * Returns a map of annotation tag -> Set of protein tags.
 */
export function useAnnotationProteinSets({ submission_tag, annotation_tags = [] }) {
    const uniqueTags = useMemo(() => _.uniq(annotation_tags.filter(_.isString)), [_.join(annotation_tags, ";")])

    const tagQueries = useQueries({
        queries: uniqueTags.map(tag => ({
            queryKey: ["getProteinsByAnnotation", tag, submission_tag],
            queryFn: async () => {
                const res = await apiClient.get(`/annotations/${tag}/proteins`, {
                    params: { submission_tag }
                })
                return res.data
            },
            enabled: _.isString(tag) && _.isString(submission_tag) && tag.length > 0,
            staleTime: Infinity
        }))
    })

    const proteinTagsByAnnotation = useMemo(() => {
        const map = new Map()
        uniqueTags.forEach((tag, idx) => {
            const q = tagQueries[idx]
            map.set(tag, _.isArray(q?.data) ? new Set(q.data) : undefined)
        })
        return map
    }, [tagQueries, uniqueTags])

    const isReady = tagQueries.every(q => !q.isLoading && !q.isFetching)

    return { isReady, proteinTagsByAnnotation }
}

/**
 * Fetches the annotation objects (incl. text) of multiple annotation tags.
 * Returns a map of annotation tag -> annotation text.
 */
export function useAnnotationTexts(annotation_tags = []) {
    const uniqueTags = useMemo(() => _.uniq(annotation_tags.filter(_.isString)), [_.join(annotation_tags, ";")])

    const tagQueries = useQueries({
        queries: uniqueTags.map(tag => ({
            queryKey: ["getAnnotationsByTag", tag],
            queryFn: async () => {
                const res = await apiClient.get(`/annotations/${tag}`)
                return res.data
            },
            enabled: _.isString(tag) && tag.length > 0,
            staleTime: Infinity
        }))
    })

    const textByAnnotation = useMemo(() => {
        const map = new Map()
        uniqueTags.forEach((tag, idx) => {
            const q = tagQueries[idx]
            map.set(tag, _.isObject(q?.data) && _.isString(q.data.text) ? q.data.text : tag)
        })
        return map
    }, [tagQueries, uniqueTags])

    return { textByAnnotation }
}
