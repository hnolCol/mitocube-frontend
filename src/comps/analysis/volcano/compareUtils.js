import _ from "lodash"

export function log2FCFieldName(suffix) {
    return `log2FC ${suffix}`
}

export function significantFieldName(suffix) {
    return `Significant ${suffix}`
}

export function pValueFieldName(suffix) {
    return `-log10 p-value ${suffix}`
}

export function isSignificantValue(value) {
    if (_.isBoolean(value)) return value
    if (_.isNumber(value)) return value > 0
    if (_.isString(value)) return !["", "not significant", "none", "ns", "false"].includes(value.trim().toLowerCase())
    return false
}

export function rowProteinTags(row) {
    return _.isString(row.tag) ? row.tag.split(";") : []
}

export function directionLabel(direction) {
    return direction === "up" ? "Upregulated" : direction === "down" ? "Downregulated" : "Significant"
}

export function directionBarColor(direction) {
    return direction === "up" ? "#7fbf7b" : direction === "down" ? "#af8dc3" : "#80b1d3"
}

export function directionTags(set, direction) {
    if (!_.isObject(set)) return []
    if (direction === "all") return [...(set.up || []), ...(set.down || [])]
    return _.isArray(set[direction]) ? set[direction] : []
}

export function rowDirectionInfo(row, suffixes) {
    let hasUp = false
    let hasDown = false
    suffixes.forEach(suffix => {
        if (!isSignificantValue(row[significantFieldName(suffix)])) return
        const log2fc = row[log2FCFieldName(suffix)]
        if (_.isNumber(log2fc) && log2fc > 0) hasUp = true
        if (_.isNumber(log2fc) && log2fc < 0) hasDown = true
    })
    return { hasUp, hasDown, discordant: hasUp && hasDown }
}

/**
 * @description Extracts the significant up- and downregulated proteins of a volcano from the merged volcano data.
 * @param {Object[]} data The merged volcano data rows.
 * @param {String} suffix The volcano suffix.
 * @returns {{up: Object[], down: Object[], all: Object[]}} Rows sorted by fold change. Each row has ```tag``` and the volcano field names.
 */
export function getSignificantRows(data, suffix) {
    if (!_.isArray(data) || !_.isString(suffix)) return { up: [], down: [], all: [] }
    const fcName = log2FCFieldName(suffix)
    const sigName = significantFieldName(suffix)
    const significant = data.filter(row => isSignificantValue(row[sigName]) && _.isNumber(row[fcName]))
    return {
        up: significant.filter(row => row[fcName] > 0).sort((a, b) => b[fcName] - a[fcName]),
        down: significant.filter(row => row[fcName] < 0).sort((a, b) => a[fcName] - b[fcName]),
        all: [...significant].sort((a, b) => Math.abs(b[fcName]) - Math.abs(a[fcName]))
    }
}

/**
 * @description Groups the significant protein tags of several volcanos by their membership signature
 * (which volcanos they are significant in), sorted by group size descending.
 * @returns {{key: String, suffixes: String[], tags: String[]}[]}
 */
export function getSignatureEntries(sets, suffixes, direction) {
    const membershipByTag = new Map()
    suffixes.forEach(suffix => {
        directionTags(sets[suffix], direction).forEach(tag => {
            if (!membershipByTag.has(tag)) membershipByTag.set(tag, new Set())
            membershipByTag.get(tag).add(suffix)
        })
    })
    const groups = new Map()
    membershipByTag.forEach((memberSuffixes, tag) => {
        const key = suffixes.filter(suffix => memberSuffixes.has(suffix)).join(" | ")
        if (!groups.has(key)) groups.set(key, { key, suffixes: [...memberSuffixes], tags: [] })
        groups.get(key).tags.push(tag)
    })
    return _.orderBy([...groups.values()], entry => entry.tags.length, "desc")
}
