import _ from "lodash"

export const NOT_SPECIFIED_LABEL = "Not specified"

const NOT_SPECIFIED_KEY = "__not_specified__"

/**
 * @description Utilities to build the condition application explore tree on the
 * client. The tree is not built from a fixed attribute hierarchy but computed
 * lazily per node: for the submissions of one node, the condition application
 * attribute with the highest dividing power (entropy of the induced grouping)
 * is selected as the next split. Submissions without the attribute fall into an
 * explicit 'Not specified' group so every split remains a complete partition.
 */

/**
 * Human readable label of one condition application of a submission.
 * Prefers the trait text, falls back to the attribute value and finally to
 * the trait or condition application tag.
 * @param {Object} ca Condition application aggregate item.
 * @returns {String} The label of the condition application.
 */
function caItemLabel(ca) {
    if (_.isString(ca.trait_text) && ca.trait_text.length > 0) return ca.trait_text
    if (_.isString(ca.value) && ca.value.length > 0) {
        const prefix = ca.attribute_text || ca.attribute_tag || ""
        return prefix.length > 0 ? `${prefix}=${ca.value}` : ca.value
    }
    return ca.trait_tag || ca.condition_application_tag || ""
}

/**
 * @description Indexes condition application aggregates by submission and
 * attribute. Each entry contains the attribute text and the grouping key, the
 * combination of all labels a submission has for the attribute (sorted, joined).
 * This way submissions with multiple values for the same attribute (e.g. two
 * cell lines across samples) form their own group and the split stays a complete
 * partition of the submissions.
 * @param {Object[]} aggregates Condition application aggregates per submission
 * ({ submission_tag, condition_applications: [...] }).
 * @returns {Map} submission_tag -> Map(attribute_tag -> { attribute_tag, attribute_text, key })
 */
export function buildSubmissionCAIndex(aggregates) {
    const index = new Map()
    if (!_.isArray(aggregates)) return index
    for (const aggregate of aggregates) {
        if (!_.isObject(aggregate) || !_.isString(aggregate.submission_tag)) continue
        const attributes = new Map()
        for (const ca of (_.isArray(aggregate.condition_applications) ? aggregate.condition_applications : [])) {
            if (!_.isObject(ca) || !_.isString(ca.attribute_tag) || ca.attribute_tag.length === 0) continue
            const label = caItemLabel(ca)
            if (!attributes.has(ca.attribute_tag)) {
                attributes.set(ca.attribute_tag, { attribute_tag: ca.attribute_tag, attribute_text: ca.attribute_text, labels: [] })
            }
            const entry = attributes.get(ca.attribute_tag)
            if (!entry.labels.includes(label)) entry.labels.push(label)
            if (_.isString(ca.attribute_text)) entry.attribute_text = ca.attribute_text
        }
        for (const entry of attributes.values()) entry.key = entry.labels.slice().sort().join(" + ")
        index.set(aggregate.submission_tag, attributes)
    }
    return index
}

function entropy(fractions) {
    return fractions.reduce((h, p) => p > 0 ? h - p * Math.log2(p) : h, 0)
}

/**
 * @description Finds the best split of the given submissions by condition
 * application attribute. For every attribute the submissions are grouped by
 * their attribute values ('not specified' if the attribute is absent) and the
 * entropy of the group size distribution is used as dividing power. Ties are
 * broken by fewer groups first (so broad attributes surface near the root)
 * and then by attribute tag for a stable layout.
 * @param {String[]} submission_tags Tags of the submissions in the node.
 * @param {Map} index The submission condition application index.
 * @returns {Object|null} { attribute_tag, attribute_text, groups: [{ key, label, submission_tags }] } or null if no attribute divides the submissions.
 */
export function computeCASplit(submission_tags, index) {
    if (!_.isArray(submission_tags) || submission_tags.length < 2) return null
    const candidates = []
    const attributes = new Set()
    for (const tag of submission_tags) {
        const attributesOfSubmission = index.get(tag)
        if (attributesOfSubmission === undefined) continue
        for (const attribute_tag of attributesOfSubmission.keys()) attributes.add(attribute_tag)
    }
    for (const attribute_tag of attributes) {
        const groups = new Map()
        let attribute_text = null
        for (const tag of submission_tags) {
            const attributesOfSubmission = index.get(tag)
            const entry = attributesOfSubmission === undefined ? undefined : attributesOfSubmission.get(attribute_tag)
            if (entry !== undefined && _.isString(entry.attribute_text)) attribute_text = entry.attribute_text
            const key = entry === undefined ? NOT_SPECIFIED_KEY : entry.key
            if (!groups.has(key)) {
                groups.set(key, { key, label: entry === undefined ? NOT_SPECIFIED_LABEL : entry.key, submission_tags: [] })
            }
            groups.get(key).submission_tags.push(tag)
        }
        if (groups.size < 2) continue
        const fractions = [...groups.values()].map(group => group.submission_tags.length / submission_tags.length)
        candidates.push({
            attribute_tag,
            attribute_text,
            score: entropy(fractions),
            groups: [...groups.values()].sort((a, b) => b.submission_tags.length - a.submission_tags.length || a.label.localeCompare(b.label))
        })
    }
    if (candidates.length === 0) return null
    candidates.sort((a, b) => b.score - a.score || a.groups.length - b.groups.length || a.attribute_tag.localeCompare(b.attribute_tag))
    return { attribute_tag: candidates[0].attribute_tag, attribute_text: candidates[0].attribute_text, groups: candidates[0].groups }
}
