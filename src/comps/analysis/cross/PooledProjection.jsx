import _ from "lodash";
import { useMemo, useState } from "react";
import { api } from "@/api";
import InteractiveChart from "../../core/charts/interactive";
import { ScatterPlot } from "../../core/charts/scatter";
import { ScatterDataSelection } from "../../core/charts/selections/ScatterDataSelection";
import { Loading } from "@/comps/core/base/states/Loading";
import { Protein } from "@/comps/core/base/protein/Protein";
import { ProteomeSelection } from "./ProteomeSelection";

const N_COMPONENTS = 4
const NUMERIC_KEY_NAMES = _.range(N_COMPONENTS).map(idx => `PC${idx + 1}`)
const COLOR_AND_SIZE_KEY_NAMES = ["Condition Application", "Submission"]

function PooledProjectionPlot({ projection, selection, setSelection }) {
    const projectionData = useMemo(() => {
        const points = _.isArray(projection?.points) ? projection.points : []
        return points.map(d => ({
            tag: d.sample_tag,
            "Submission": d.submission_tag,
            ...Object.fromEntries(NUMERIC_KEY_NAMES.map((keyName, idx) => [keyName, d.components?.[idx]])),
            "Condition Application": _.isArray(d.condition_applications) && d.condition_applications.length > 0
                ? d.condition_applications[0]
                : "None",
            "Condition Applications": _.isArray(d.condition_applications) ? d.condition_applications : []
        }))
    }, [projection])

    if (projectionData.length === 0) return null

    return (
        <div>
            <ScatterDataSelection
                keyNames={_.keys(projectionData[0])}
                title="Pooled Projection"
                idx={0}
                numericKeyNames={NUMERIC_KEY_NAMES}
                selection={selection}
                setSelection={setSelection}
                itemIsAttribute={false}
                colorAndSizeAreAttributes={false}
                colorAndSizeKeyNames={COLOR_AND_SIZE_KEY_NAMES}
                downloadElements={["scatter_plot-pooled-pca-projection", projectionData]}
                elementNames={["SVG", `Projected Data (${projectionData.length} x ${_.keys(projectionData[0]).length})`]}
                elementTypes={["svg", "data"]}
                fileNames={["pooled-PCA.svg", "pooled-PCA-Projection.txt"]}
            />
            <InteractiveChart
                data={projectionData}
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
                    <div key={`${chartIdx}-pooled-projection`}>
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
                            tooltipNames={["tag", "Submission", "Condition Applications"]}
                            tooltipNameIsConditionApplication={{ "Condition Applications": true }}
                            tooltipNameIsProtein={{}}
                            {...hoverProps}
                            {...filterProps}
                            legend={true}
                            handleSearchByDataIndex={handleSearchByDataIndex}
                            filterDataInKeyByValue={filterDataInKeyByValue}
                            svgID="scatter_plot-pooled-pca-projection"
                        />
                    </div>
                ))}
            </InteractiveChart>
        </div>
    )
}

function TopDrivers({ drivers }) {
    const topDrivers = useMemo(() => {
        const items = _.isArray(drivers) ? drivers : []
        return _.orderBy(items, [d => Math.abs(_.isArray(d.components) ? d.components[0] : 0)], ["desc"]).slice(0, 10)
    }, [drivers])

    if (topDrivers.length === 0) return null

    return (
        <div className="container--shadow padding--little" style={{ minWidth: "22rem", alignSelf: "flex-start" }}>
            <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Top PC1 drivers</div>
            <div className="flex flex-column" style={{ gap: "0.25rem" }}>
                {topDrivers.map((driver, idx) =>
                    <div key={driver.tag ?? idx} className="flex align-center" style={{ gap: "0.5rem" }}>
                        <span style={{ fontSize: 12, color: "var(--gray3)", minWidth: "1.2rem" }}>{idx + 1}.</span>
                        <Protein minimal tag={driver.tag} />
                        <span style={{ fontFamily: "monospace" }}>
                            {_.isArray(driver.components) && _.isNumber(driver.components[0])
                                ? (driver.components[0] > 0 ? "+" : "") + driver.components[0].toFixed(3)
                                : null}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}

/**
 * Pooled PCA projection of all submissions of a proteome inside the user's
 * submission scope (backend: GET /api/stats/proteomes/{proteome_tag}/projection).
 */
export function PooledProjection() {
    const [proteome_tag, setProteomeTag] = useState(null)
    const [userSelection, setUserSelection] = useState(null)

    const defaultSelection = useMemo(() => ({
        xaxisName: NUMERIC_KEY_NAMES[0],
        yaxisName: NUMERIC_KEY_NAMES[1],
        colorName: COLOR_AND_SIZE_KEY_NAMES[0],
        sizeName: undefined,
        filterTag: undefined
    }), [])
    const selection = userSelection ?? defaultSelection

    const handleScatterSelection = (idx, selectionKey, keyName) => {
        setUserSelection(prevValues => ({ ...(prevValues ?? defaultSelection), [selectionKey]: keyName }))
    }

    const { data: projection, isLoading, isError, error } = api.stats.proteomeProjection.useGetProteomeProjection(
        { proteome_tag, n_components: N_COMPONENTS },
        { enabled: _.isString(proteome_tag) && proteome_tag.length > 0, staleTime: 50000 }
    )

    return (
        <div className="div--expand" style={{ overflowY: "scroll", height: "90vh" }}>
            <h2>Pooled PCA</h2>
            <div style={{ marginBottom: "1rem" }}>
                <ProteomeSelection proteome_tag={proteome_tag} setProteomeTag={setProteomeTag} />
            </div>
            {!_.isString(proteome_tag) ? <div>Select a proteome to compute the pooled projection of your accessible submissions.</div> :
                isLoading ? <Loading /> :
                    isError ? <div style={{ color: "var(--gray3)" }}>
                        {error?.response?.status === 404
                            ? "No accessible submissions with quantification data found for this proteome."
                            : "Failed to load the pooled projection."}
                    </div> :
                        _.isObject(projection) ? (
                            <div className="flex flex-column" style={{ gap: "0.75rem" }}>
                                <div>
                                    {projection.n_submissions} submission{projection.n_submissions === 1 ? "" : "s"} pooled, {projection.n_proteins} protein groups.
                                    {_.isArray(projection.variance_explained) && projection.variance_explained.length > 0
                                        ? ` PCs explain ${_.round(_.sum(projection.variance_explained) * 100, 1)}% of the variance.`
                                        : null}
                                </div>
                                <div className="flex flex--wrap align-start" style={{ gap: "2rem" }}>
                                    <PooledProjectionPlot projection={projection} selection={selection} setSelection={handleScatterSelection} />
                                    <TopDrivers drivers={projection.drivers} />
                                </div>
                            </div>
                        ) : null}
        </div>
    )
}
