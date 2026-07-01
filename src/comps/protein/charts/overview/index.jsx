
import _ from "lodash"

import { useOutletContext } from "react-router"
import { ProteinAbundance } from "../FeatureAbundance"

import { OptionButton } from "../../../core/base/buttons/OptionButton"
import { useSearchParams } from "react-router-dom"
import { OpenAiPublicationSummary } from "../../../core/openai/OpenAiPublicationSummary"
import { ProteinOverview } from "./ProteinOverview"


import { ProteinCorrelation, ProteinCorrelationWrapper } from "../../correlation"
import { ProteinSubmissionRanking } from "../../data/ProteinSubmissionRanking"
import { ProteinHelp } from "./ProteinHelp"


import { ProteinCrosslinks } from "../../crosslinks/ProteinCrosslinks"



export function ProteinPage() {
    
    const { feature_tag } = useOutletContext()
    const [searchParams, setSearchParams] = useSearchParams();

    const viewOptions = [{ tag: "overview", text: "Overview" },
        { tag: "data", text: "Data" },
        { tag: "correlation", text: "Correlation" },
        { tag: "abundance", text: "Abundance" },
        { tag: "crosslinks", text: "Crosslinks" },
        { tag: "literature", text: "Literature (AI)" },
        { tag: "publications", text: "Publications" },
        {tag : "documentation", text : "Documentation"}];
    
    const viewParam = searchParams.get("view");
    const selectedView = viewParam && viewOptions.some(o => o.tag === viewParam) ? viewParam : viewOptions[0].tag;
    

    const handleClick = (option_tag) => {
        const newParams = new URLSearchParams(searchParams);
        if (option_tag === viewOptions[0].tag) {
            newParams.delete("view");
        } else {
            newParams.set("view", option_tag);
        }
        setSearchParams(newParams);
    }
    

    return (
        <div className="div-expand" style={{ height: "100%", }}>
            <div className="bg--lightgrey padding--little margin--little">
            {viewOptions.map(option =>
                <OptionButton key={option.tag} isSelected={selectedView === option.tag} onClick={() => handleClick(option.tag)}>
                    <span>{option.text}</span>
                </OptionButton>
                )}
                </div>
            {/* <ProteinFilter tag={feature_tag} /> */}
            <div className="flex flex-column div--expand padding--little" style={{overflowY:"scroll", height : "88vh"}}>

            {selectedView === "overview" ? <ProteinOverview feature_tag={feature_tag} /> : null }

                {selectedView === "data" ? <ProteinSubmissionRanking tag={feature_tag} /> : null     }

            {selectedView === "correlation" ? <  ProteinCorrelationWrapper tag={feature_tag} /> : null }

            {selectedView == "literature" ? <div style={{paddingLeft : "3rem", paddingRight : "3rem"}}><OpenAiPublicationSummary feature_tag={feature_tag} /></div> : null }
                {selectedView === "abundance" ? <ProteinAbundance tag={feature_tag} /> : null}
                {selectedView === "documentation" ? <ProteinHelp /> : null  }
                {selectedView === "crosslinks" ? <ProteinCrosslinks protein_tag={feature_tag} /> : null}
            </div>
            {/* <BoxplotWithValue/>
            <div> Color : </div>
                <Combobox
                    items={keyNames}
                    placeholder={columnSelection.colorName}
                    callback={(colorName) => setColumnSelection(prevValues => { return { ...prevValues, colorName } })} />
            <div> Size : </div>
                <Combobox
                    items={numericKeys}
                    placeholder={columnSelection.sizeName}
                    callback={(sizeName) => setColumnSelection(prevValues => { return { ...prevValues, sizeName } })} />
            <div> Subplot : </div>
                <Combobox items={categoricalKeys} placeholder={columnSelection.subplotName} callback={(subplotName) => setColumnSelection(prevValues => { return { ...prevValues, subplotName} })}/>
            <div> Filter : </div>
                <InputGroup placeholder="Search ..." leftIcon="search" />
            </div>
            <SVGHeader svgID={Object.keys(svgIDs)} svgFileName={Object.values(svgIDs)} chartData={data} txtFileName="ChartData.txt" />
            <CollapsableAxes
                data={orderedData}
                colorName={columnSelection.colorName}
                sizeName={columnSelection.sizeName}
                subplotName = {columnSelection.subplotName}
                rowHeight={250}
                subplotBasicWidth={subplotBasicWidth}
            >
                  {(subplots) => subplots.map(({
                      width,
                      height,
                      divIsCollapsed,
                      toggleCollapse,
                      subplotIdx,
                      subplotName,
                      subplotCategory,
                      subplotCategories,
                      subplotCategoriesCounts,
                      subplotData, colorScale, sizeScale}, idx) => {
                        return (
                            <div className="flex bg--grey" key={subplotIdx} style={{ backgroundColor: "#efefef", width, height, minWidth: width, maxWidth: width, margin: "1rem" }}>
                                {!divIsCollapsed ?
                                    <CategoricalScatter
                                        data={subplotData}
                                        svgID={subplotCategory}
                                        title = {`${subplotCategory} (${subplotCategoriesCounts[subplotCategory]})`}
                                        defaultColor={defaultColors[idx]}
                                        sizeName={columnSelection.sizeName}
                                        colorName={columnSelection.colorName}
                                        {...{ yAxisDomain, width, height, subplotName, colorscale : colorScale, sizescale : sizeScale}} /> : 
                                    <div>
                                    <SVG {...{ width, height }}>

                                        <Text x={width / 2} y={height / 2} verticalAnchor="middle" textAnchor="middle">{subplotCategory}</Text>
                                    
                                    </SVG></div>}
                                {idx === subplots.length - 1 ? <div>
                                    <LegendOrdinal scale={colorScale}>
                                    {(labels) => (
                                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                                        {labels.map((label, i) => (
                                            <LegendItem
                                            key={`legend-quantile-${i}`}
                                            margin="0 5px">
                                            
                                            <svg width={15} height={15}>
                                                <rect fill={label.value} width={15} height={15} />
                                            </svg>
                                            <LegendLabel align="left" margin="0 0 0 4px">
                                                {label.text}
                                            </LegendLabel>
                                            </LegendItem>
                                        ))}
                                            </div>)}
                                    </LegendOrdinal>
                                    <LegendSize scale={sizeScale} steps={3} >
                                        {(labels) =>
                                            labels.map((label) => {
                                            const size = sizeScale(label.datum) ?? 0;
                                            return (
                                                <LegendItem
                                                key={`legend-${label.text}-${label.index}`}
                                                >
                                                <svg width={size} height={size} style={{ margin: '4px 0' }}>
                                                    <circle fill={"grey"} r={size / 2} cx={size / 2} cy={size / 2} />
                                                </svg>
                                                <LegendLabel align="left" margin="0 8px">
                                                    {label.text}
                                                </LegendLabel>
                                                </LegendItem>
                                            );
                                            })
                                        }
                                        </LegendSize>
                                </div>

                                
         
                                 : null}
                          </div>
                        )
                    })
                  }
                
                </CollapsableAxes>
            
            <div style={{ maxWidth: "400px", height: "500px"}}>
                    <ParentSize>{(parent) => 
                        <div>
                            <SVGHeader svgID={"volc"} />
                            <ChartLegend width={parent.width} height={80}/>
                            <LineChart width={parent.width} height={parent.height} svgID={"volc"} />
                        </div>}
                    </ParentSize>
                
                </div> */}
        </div>

    )
}
