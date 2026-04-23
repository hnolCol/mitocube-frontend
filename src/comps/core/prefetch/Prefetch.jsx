import React, { useMemo } from 'react'
import { usePrefetchConditionApplicationTexts } from "@/api/orchestrated/conditionApplications";
import { usePrefetchAttributes } from "@/api/orchestrated/attributes";
import _ from "lodash"; 

export function WithTagMaps({
    Component,
    ca_tags,
    attribute_tags,
    ...rest
}) {

    console.log(ca_tags, attribute_tags, Component)
    const { isReady, tagQueries } =
        usePrefetchConditionApplicationTexts(ca_tags)

    const {
        isReady: attributeIsReady,
        tagQueries: attributeTagQueries,
    } = usePrefetchAttributes(attribute_tags)

    const caTagMap = useMemo(() => {
        if (!isReady) return null
        const map = new Map()
        tagQueries.forEach((q, idx) => {
            if (q.data) {
                map.set(ca_tags[idx], q.data)
            }
        })
        return map
    }, [_.join(ca_tags)])

    const attributeTagMap = useMemo(() => {
        if (!attributeIsReady) return null 
        const map = new Map()
        attributeTagQueries.forEach((q, idx) => {
            if (q.data) {
                map.set(attribute_tags[idx], q.data)
            }
        })
        return map
    }, [_.join(attribute_tags)])

    const ready = isReady && attributeIsReady

    if (!ready) {
        return null
    }

    return (
        <Component
            {...rest}
            ca_tags={ca_tags}
            attribute_tags={attribute_tags}
            caTagMap={caTagMap}
            attributeTagMap={attributeTagMap}
            isReady={ready}
        />
    )
}
