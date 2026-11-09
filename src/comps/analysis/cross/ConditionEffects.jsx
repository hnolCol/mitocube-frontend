import _ from "lodash";
import { useMemo, useState } from "react";
import { api } from "@/api";
import InteractiveChart from "../../core/charts/interactive";
import { ScatterPlot } from "../../core/charts/scatter";
import { ScatterDataSelection } from "../../core/charts/selections/ScatterDataSelection";
import { Loading } from "@/comps/core/base/states/Loading";
import { ConditionApplicationInput } from "@/comps/core/input/api/ConditionApplicationInput";
import { ProteomeSelection } from "./ProteomeSelection";

const NUMERIC_KEY_NAMES = ["effect", "mean_z_in", "mean_z_out", "n_in", "n_out", "cohens_d"]
const COLOR_AND_SIZE_KEY_NAMES = ["Direction"]

function ConditionApplicationSelection({ ca_tag, setCaTag }) {
    const { data: ca_text } = api.condition_applications.useGetConditionApplicationText(
        { tag: ca_tag }, { enabled: _.isString(ca_tag) && ca_tag.length > 0, staleTime: 300000 })

    return (
        <div className="flex align-center" style={{ gap: "0.5rem" }}>
            <span>Condition Application</span>
            <ConditionApplicationInput
                selected_ca_tags={_.isString(ca_tag) ? [ca_tag] : []}
                onSelect={tag => setCaTag(tag)}
                samples_only={true}
                placeholder={_.isString(ca_text) ? ca_text : "Select a condition application..."} />
        </div>
    )
}

function ConditionEffectsPlot({ effects, selection, setSelection }) {
    const effectData = useMemo(() => {
        const items = _.isArray(effects) ? effects : []
        return items.map(effect => ({
            ...effect,
            "Direction": _.isNumber(effect.effect) ? (effect.effect >= 0 ? "increased" : "decreased") : "n/a"
        }))
    }, [effects])

    if (effectData.length === 0) return null

    return (
        <div>
            <ScatterDataSelection
                keyNames={_.keys(effectData[0])}
                title="Protein Effects"
                idx={0}
                numericKeyNames={NUMERIC_KEY_NAMES}
                selection={selection}
                setSelection={setSelection}
                itemIsAttribute={false}
                colorAndSizeAreAttributes={false}
                colorAndSizeKeyNames={COLOR_AND_SIZE_KEY_NAMES}
                downloadElements={["scatter_plot-condition-effects", effectData]}
                elementNames={["SVG", `Protein Effects (${effectData.length} x ${_.keys(effectData[0]).length})`]}
                elementTypes={["svg", "data"]}
                fileNames={["condition-effects.svg", "condition-effects.txt"]}
            />
            <InteractiveChart
                data={effectData}
                extraLimitNames={NUMERIC_KEY_NAMES}
                keyNames={[{ xaxisName: selection.xaxisName, yaxisName: selection.yaxisName }]}
                isPointChart={[true]}
            >
                {(chartData) => chartData.map(({
                    data,
                    chartIdx,
                    xaxisName,
                    yaxisName,
                    valid,
                    limits,
                    findDataInRectangle,
                    setHoverDataInRectangle,
                    handleSearchByDataIndex,
                    filterDataInKeyByValue,
                    hoverProps,
                    filterProps
                }) => (
                    <div key={`${chartIdx}-condition-effects`}>
                        <ScatterPlot
                            chartIdx={chartIdx}
                            colorName={selection.colorName}
                            sizeName={selection.sizeName}
                            data={data}
                            valid={valid}
                            findDataInRectangle={findDataInRectangle}
                            setHoverDataInRectangle={setHoverDataInRectangle}
                            xaxisName={xaxisName}
                            yaxisName={yaxisName}
                            limits={limits}
                            tooltipSmall={false}
                            tooltipNames={["tag", "effect", "mean_z_in", "mean_z_out", "n_in", "n_out"]}
                            tooltipNameIsProtein={{}}
                            tooltipNameIsNumeric={{ effect: 2, mean_z_in: 2, mean_z_out: 2 }}
                            {...hoverProps}
                            {...filterProps}
                            legend={true}
                            handleSearchByDataIndex={handleSearchByDataIndex}
                            filterDataInKeyByValue={filterDataInKeyByValue}
                            svgID="scatter_plot-condition-effects"
                        />
                    </div>
                ))}
            </InteractiveChart>
        </div>
    )
}

/**
 * Quantitative effect of a condition application across the proteome
 * (backend: GET /api/stats/proteomes/{proteome_tag}/projection/effects/{ca_tag}).
 */
export function ConditionEffects() {
    const [proteome_tag, setProteomeTag] = useState(null)
    const [ca_tag, setCaTag] = useState(null)
    const [userSelection, setUserSelection] = useState(null)

    const defaultSelection = useMemo(() => ({
        xaxisName: "effect",
        yaxisName: "mean_z_in",
        colorName: COLOR_AND_SIZE_KEY_NAMES[0],
        sizeName: undefined,
        filterTag: undefined
    }), [])
    const selection = userSelection ?? defaultSelection

    const handleScatterSelection = (idx, selectionKey, keyName) => {
        setUserSelection(prevValues => ({ ...(prevValues ?? defaultSelection), [selectionKey]: keyName }))
    }

    const { data, isLoading, isError, error } = api.stats.proteomeProjection.useGetProteomeProjectionConditionEffects(
        { proteome_tag, ca_tag, limit: 200 },
        { enabled: _.isString(proteome_tag) && proteome_tag.length > 0 && _.isString(ca_tag) && ca_tag.length > 0, staleTime: 50000 }
    )

    return (
        <div className="div--expand" style={{ overflowY: "scroll", height: "90vh" }}>
            <h2>Condition Effects</h2>
            <div className="flex flex--wrap" style={{ gap: "2rem", marginBottom: "1rem" }}>
                <ProteomeSelection proteome_tag={proteome_tag} setProteomeTag={setProteomeTag} />
                <ConditionApplicationSelection ca_tag={ca_tag} setCaTag={setCaTag} />
            </div>
            {!_.isString(proteome_tag) || !_.isString(ca_tag) ?
                <div>Select a proteome and a condition application to rank the proteins by their response to the condition.</div> :
                isLoading ? <Loading /> :
                    isError ? <div style={{ color: "var(--gray3)" }}>
                        {error?.response?.status === 404
                            ? "The condition application was not found among the samples of your accessible submissions of this proteome."
                            : "Failed to load the condition effects."}
                    </div> :
                        _.isObject(data) ? (
                            <div className="flex flex-column" style={{ gap: "0.75rem" }}>
                                <div>
                                    {data.n_proteins} protein groups across {data.n_submissions} submission{data.n_submissions === 1 ? "" : "s"}.
                                    Effect = mean z-score in samples with the condition minus mean z-score in all other samples.
                                </div>
                                <ConditionEffectsPlot effects={data.effects} selection={selection} setSelection={handleScatterSelection} />
                            </div>
                        ) : null}
        </div>
    )
}
