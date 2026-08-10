import { useMemo } from "react";
import { ProfileChart } from "./ProfileChart";
import _ from "lodash";
import { getUniqueValuesInArrayOfObjects } from "../../../../services/arrays/unique";
import { scaleOrdinal } from "@visx/scale";
import { getColorPalette } from "@mitocube/viz/src/colors/palette";

export function MultiProfiles({
    chartIdx,
    width = 220,
    height = 180,
    margins = {
        left: 25,
        top: 5,
        right: 5,
        bottom: 5
    },
    data,
    valid,
    yaxisName = [],
    xaxisName,
    labelNames = [],
    yaxisLabel,
    xaxisLabel,
    limits,
    svgID,
    rerenderHover,
    rerenderBackground,
    colorName,
    profileAsLine = true,
    profileAsBar = false,
    subsetIndices = {},
    searchIndices = new Set(),
    hoverIndices = new Set(),
    mergeHoverWithSearch = true,
    proteinTagMap
}) {


    const uniqueColorValues = useMemo(
        () =>
            getUniqueValuesInArrayOfObjects({
                data,
                keyName: colorName
            }).filter(v => v !== undefined),
        [data, colorName]
    );

    const colorScale = useMemo(() => {

        if (uniqueColorValues.length === 0)
            return () => "#000";

        return scaleOrdinal({
            domain: uniqueColorValues,
            range: getColorPalette(uniqueColorValues.length)
        });

    }, [uniqueColorValues]);



    const chartSubsets = useMemo(() => {
        const subsets = {};
        for (const [index, item] of data.entries()) {
            const key = item[colorName];
            if (!subsets[key]) subsets[key] = new Set();
            subsets[key].add(index);
        }
        return subsets;
    }, [data, colorName]);
    

    const EMPTY_SET = useMemo(() => new Set(), []);
    const EMPTY_ARRAY = useMemo(() => [], []);
    const chartInteractions = useMemo(() => { 

        const interactions = {};
        for (const key of Object.keys(chartSubsets)) {
            interactions[key] = {
                hoverIndices: new Set(),
                searchIndices: new Set(),
                hoverDataInSubset : []
            };
        }

        if (hoverIndices.size > 0) {
            for (const idx of hoverIndices) {
                const key = data[idx][colorName];
                if (interactions[key] && chartSubsets[key].has(idx)) {
                    interactions[key].hoverIndices.add(idx);
                    interactions[key].hoverDataInSubset.push(data[idx]);
                }
            }
        }

        if (searchIndices.size > 0) {
            for (const idx of searchIndices) {
                const key = data[idx][colorName];
                if (interactions[key] && chartSubsets[key].has(idx)) {
                    interactions[key].searchIndices.add(idx);
                    if (mergeHoverWithSearch) {
                        interactions[key].hoverDataInSubset.push(data[idx]);
                        // }
                    }
                }
            }
        }

        return interactions;
    }, [chartSubsets,
        searchIndices,
        hoverIndices,
        rerenderHover,
        rerenderBackground,
        mergeHoverWithSearch,
        data,
        colorName]);
    

    

    return (
        <div
            style={{
                display:"grid",
                gridAutoColumns:"min-content",
                gridTemplateColumns:"1fr 1fr"
            }}
        >

            {Object.keys(chartSubsets).map(subsetKey => {
                return (
                    <ProfileChart
                        key={`${subsetKey}-profile-chart`}
                        chartIdx={subsetKey}
                        width={width}
                        height={height}
                        margins={margins}
                        data={data}
                        valid={valid}
                        stroke={colorScale(subsetKey)}
                        yaxisName={yaxisName}
                        xaxisName={xaxisName}
                        labelNames={labelNames}
                        yaxisLabel={yaxisLabel}
                        xaxisLabel={xaxisLabel}

                        proteinTagMap={proteinTagMap}
                        limits={limits}

                        svgID={svgID}
                        rerenderHover={rerenderHover}
                        rerenderBackground={rerenderBackground}

                        profileAsLine={profileAsLine}
                        profileAsBar={profileAsBar}
                        hoverDataInSubset={chartInteractions[subsetKey].hoverDataInSubset}
                        hoverIndices={chartInteractions[subsetKey].hoverIndices}
                        searchIndices={chartInteractions[subsetKey].searchIndices}
                
                        subsetIndices={chartSubsets[subsetKey]}

                        mergeHoverWithSearch={mergeHoverWithSearch}

                    />
                );
            })}

        </div>
    );
}