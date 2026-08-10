import { useState, useRef } from "react"
import { api } from "@/api"
import { FilterNode } from "./FilterNode"
import { APIAxiosError } from "@/comps/core/base/states/APIError"
import { Loading } from "@/comps/core/base/states/Loading"

import _ from "lodash"
import { useMemo } from "react"
import { WithTagMaps } from "@/comps/core/prefetch/Prefetch"
import InteractiveChart from "../../core/charts/interactive";
import viz from "@mitocube/viz"
import { downloadTxtFile, arrayOfObjectsToTabDel } from "@/services/downloads/txt"
import ComparisonTree from "./TreeCount"
import { HIGHLIGHT_COLOR } from "@mitocube/viz/src/colors/palette"

// const mergeAndDownload = (svgID1, svgID2, viewBox = "0 0 500 1500") => {
//     console.log(svgID1, svgID2)
//   const svg1 = document.getElementById(svgID1);
//   const svg2 = document.getElementById(svgID2);

//   if (!svg1 || !svg2) return;

//   const mergedSvg = document.createElementNS(
//     "http://www.w3.org/2000/svg",
//     "svg"
//   );

//   mergedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
//   mergedSvg.setAttribute("viewBox", viewBox);

//   // Create groups so you can position each SVG independently
//   const group1 = document.createElementNS(
//     "http://www.w3.org/2000/svg",
//     "g"
//   );

//   const group2 = document.createElementNS(
//     "http://www.w3.org/2000/svg",
//     "g"
//   );

//   group1.setAttribute("transform", "translate(0,0)");
//   group2.setAttribute("transform", "translate(0,200)");

//   Array.from(svg1.childNodes).forEach((node) => {
//     group1.appendChild(node.cloneNode(true));
//   });

//   Array.from(svg2.childNodes).forEach((node) => {
//     group2.appendChild(node.cloneNode(true));
//   });

//   mergedSvg.appendChild(group1);
//   mergedSvg.appendChild(group2);
//   console.log(mergedSvg,"here?")
//   const serializer = new XMLSerializer();
//   const svgString = serializer.serializeToString(mergedSvg);

//   const blob = new Blob([svgString], {
//     type: "image/svg+xml;charset=utf-8",
//   });

//   const url = URL.createObjectURL(blob);

//   const link = document.createElement("a");
//   link.href = url;
//   link.download = "merged.svg";
//   link.click();

//   URL.revokeObjectURL(url);
// };


function WithTagHeatmap( {data, isSuccess, isPending, isError, error, maxHeight = "65vh", svgID} ) {
    const [requiredProteinTags, setRequiredProteinTags] = useState([])

    if (isError) return <APIAxiosError error={error} />
    
    return <div>{isSuccess ? <WithTagMaps
        Component={ResultContainer}
        // attribute_tags={sample_ca_attribute_tags}
        protein_tags={requiredProteinTags}
        {...{
            data,
            isSuccess,
            isPending,
            setRequiredProteinTags,
            showProteinSearch: false,
            maxHeight,
            svgID
        }} /> : null}</div>
}


export function ResultContainer({ setRequiredProteinTags, requiredProteinTags, data, isSuccess, isPending, refetchTrigger, proteinTagMap, proteinIsLoading, maxHeight, svgID }) {
 
    const scrollContainerRef = useRef(null); 
    const keyNames = useMemo(() => [
            {
                xaxisName: undefined,
                yaxisName: data.heatmap.value_names,
            }
    ], [_.join(data.heatmap.value_names)])
    const passOnProps = useMemo(() => ({
        refetchTrigger,
        setRequiredProteinTags,
        proteinTagMap,
        proteinIsLoading,
        value_names: data.heatmap.value_names,
        label_names: data.heatmap.label_names,
        scrollContainerRef
    }), [
        refetchTrigger,
        setRequiredProteinTags,
        proteinTagMap,
        proteinIsLoading,
        scrollContainerRef
    ])

    return (
        <div>
            <div className="flex flex-column"
                style={{ gap: "0.5rem", width: "100%" }}>
                <h2>Results</h2>
                <span>{data.tags.length} proteins found.</span>
                <InteractiveChart
                                data={data.heatmap.data}
                                // externalSearchResult={proteinSearchResults}
                                keyNames={keyNames}
                                passOnProps={passOnProps}
                                isPointChart={[false]}>
                                {
                                    /**
                                     * 
                                     * @param {import("../../../types/charts").InteractiveChartResponse[]} chartData 
                                     * @returns 
                                     */
                                    (chartData) => chartData.map(({
                                        data,
                                        yaxisName,
                                        handleSearchByDataIndex,
                                        setHoverDataByDataIndex,
                                        hoverProps,
                                        filterProps,
                                        refetchTrigger, 
                                        setRequiredProteinTags,
                                        proteinTagMap,
                                        proteinIsLoading,
                                        value_names,
                                        label_names,
                                        scrollContainerRef
                                    }, didx) => {
                                        return (
                                            <div>
                                                <div className="flex flex-column" style={{ display: "flex", height: "80vh" }}>
                                                    <viz.charts.HeatmapColumnNames
                                                            columnNames={value_names}
                                                            binHeight={20}
                                                            binWidth={20}
                                                            startX={15 + 15 / 4}
                                                            startY={14}
                                                            stroke={"#000000"}
                                                        marginBetweenValues={15}
                                                        svgID={`heatmap-column-names-svg-${svgID}`}
                                                        /> 
                                                    <div style={{ overflowY: "scroll", flex: 1, height: "100%"}}>
                                                        <viz.charts.Heatmap
                                                            {...{
                                                                data,
                                                                binHeight: 20,
                                                                setRequiredProteinTags,
                                                                proteinTagMap,
                                                                refetchedTrigger: refetchTrigger,
                                                                clusterName : undefined,
                                                                valueNames: yaxisName,
                                                                colorNames: [],
                                                                labelNames: label_names,
                                                                handleSearchByDataIndex,
                                                                setHoverDataByDataIndex,
                                                                ...filterProps,
                                                                ...hoverProps,
                                                                isLabelFeatureTag: true,
                                                                proteinIsLoading, 
                                                                scrollContainerRef,
                                                                showColumnNames: true,
                                                                maxHeight,
                                                                marginBetweenValues: 15,
                                                               
                                                            }} />
                                                    </div>
                                                </div>
                                            </div>)
                                    })}
                
                </InteractiveChart> 
                


            </div>
        </div>
    )
}


export function FilterBuilder({ submission_tag }) {
    const { data, mutate, isError, isSuccess, isPending, error } = api.submissions.analysis.usePostSubmissionCompare()
    const [tree, setTree] = useState({ children: [], type: "and", id: "root" })

   

    const isAnyFieldEditing = (data) => {
        return _.some(data.children, (child) => {
            if (child.type === "pairwise" || child.type === "trend" || child.type === "annotation") {
                return child.editing === true;
            } else if (child.children && child.children.length > 0) {
                return isAnyFieldEditing(child);
            }
            return false;
        });
    }
    const isAtLeastOneNonAnnotationCondition = (data) => {
        return _.some(data.children, (child) => {
            if (child.type === "pairwise" || child.type === "trend") {
                return true;
            } else if (child.children && child.children.length > 0) {
                return isAtLeastOneNonAnnotationCondition(child);
            }
            return false;
        });
    }
    const editing = isAnyFieldEditing(tree)
    const hasNonAnnotationCondition = isAtLeastOneNonAnnotationCondition(tree)
    return <div className="div--expand">
        <div className="flex" style={{ gap: "2rem", width: "100%"}}>
            <div style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#efefef",
                // gridTemplateRows: "minmax(min-content, 40vh) 50px minmax(0, 1fr) 175px",
                gap: "0.5rem",
                width: "max(23vw, 500px)",
                height: "95vh",
                alignContent: "start",
            }}>
            
            <div style={{ width: "100%",  display: "flex", flexDirection: "column", overflowY: "scroll", gap: "0.5rem", maxHeight : "40vh", paddingRight : "0.5rem", paddingTop : "0.75rem"}}>
                <FilterNode node={tree} onChange={setTree} init_submission_tag={submission_tag} />
            </div>

            <div className="flex flex-column center-items justify-space-around" style={{width: "max(23vw, 500px)",  backgroundColor :"#efefef"}}>
                    <button
                        className="basic-button"
                        disabled={editing || !hasNonAnnotationCondition || _.isEmpty(tree.children)}
                        style={{ width: "100%", backgroundColor: (editing || !hasNonAnnotationCondition) ? "darkgrey" : HIGHLIGHT_COLOR, color: "#ffffff" }}
                onClick={() => mutate({ comparisons: tree })}>
                Compare
                    </button>
                    {editing ? <span className="font-size--smallest">Finish editing the conditions before comparing</span> : null}
                    {!hasNonAnnotationCondition ? <span className="font-size--smallest">At least one non-annotation condition is required to compare.</span> : null}
            </div>

            {isPending ? <Loading /> : isSuccess || isError ? <div style={{overflowY : "scroll", width: "100%", marginTop : "1rem", borderTop : "1px solid #000000", paddingTop : "0.5rem", maxHeight : "40vh"}}>
                    {isSuccess ?
                        <div className="flex flex-column" style={{ marginTop: "1rem" }}>
                            <h3>Comparison Results</h3>
                            {/* <StepCounts steps={data.step_counts} /> */}
                            <ComparisonTree tree={data.tree} />
                        </div> : null}
            </div> : null}
                <div>{isSuccess ?
                    <div style={{marginTop : "1rem", borderTop : "1px solid #000000", paddingTop : "0.5rem", height : "200px"}}>
                        <h3>Download Results</h3>
                    <div className="flex center-items justify-space-around" style={{ width: "100%", backgroundColor: "#efefef" }}>
                            <button style={{ width: "100%" }} className="basic-button" onClick={() => downloadTxtFile(arrayOfObjectsToTabDel(data.heatmap.data, _.keys(data.heatmap.data[0])), `submission_compare.txt`)} >Heatmap Data</button>
                            {/* <button style={{ width: "100%" }} className="basic-button" onClick={() => downloadSVG(document.getElementById(`compare-svg-${submission_tag}`), "heatmap_compare_results.svg")} >Heatmap</button>
                            <button style={{ width: "100%" }} className="basic-button" onClick={() => mergeAndDownload(`heatmap-column-names-svg-compare-svg-${submission_tag}`, `compare-svg-${submission_tag}`, `0 0 ${data.heatmap.value_names.length * 25 + 200} ${data.heatmap.data.length * 25}`)} >Heatmap Merge</button> */}
                        <button style={{ width: "100%" }} className="basic-button" onClick={() => downloadTxtFile(JSON.stringify(data.tree, null, 4), `compare_tree.txt`)} >Counts</button>
                    </div> </div> : null}
                </div>
        </div>
                    
            <div>
            
                <WithTagHeatmap data={data} isSuccess={isSuccess} isPending={isPending} isError={isError} error={error} maxHeight={"68vh"} svgID={`compare-svg-${submission_tag}`} />
            </div>
        </div>
        </div>
}

