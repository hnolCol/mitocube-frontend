import { HTMLSelect } from "@blueprintjs/core";
import _ from "lodash";
import { useMemo, useState } from "react";
import { api } from "@/api";
import InteractiveChart from "../../core/charts/interactive";
import { ScatterPlot } from "../../core/charts/scatter";
import { Loading } from "@/comps/core/base/states/Loading";
import { OptionButton } from "@/comps/core/base/buttons/OptionButton";
import { Protein } from "@/comps/core/base/protein/Protein";

const COLOR_OPTIONS = [{ tag: "condition", text: "Condition Application" }, { tag: "submission", text: "Submission" }]

function ProteomeSelection({ proteome_tag, setProteomeTag }) {
    const { data: proteomes, isLoading } = api.proteomes.queryProteomes.useGetProteomeBySearchString({ search_string: "", limit: 100 })

    if (isLoading) return <Loading />
    if (!_.isArray(proteomes) || proteomes.length === 0) {
        return <div>No proteomes found.</div>
    }

    return (
        <div className="flex align-center" style={{ gap: "0.5rem" }}>
            <span>Proteome</span>
            <HTMLSelect
                value={proteome_tag ?? ""}
                onChange={e => setProteomeTag(e.target.value)}
            >
                <option key="empty" value="">Select a proteome...</option>
                {proteomes.map(tag => <option key={tag} value={tag}>{tag}</option>)}
            </HTMLSelect>
        </div>
    )
}

function PooledProjectionPlot({ projection, colorOption }) {
    const colorName = colorOption === "condition" ? "Condition Application" : "Submission"

    const projectionData = useMemo(() => {
        const points = _.isArray(projection?.points) ? projection.points : []
        return points.map(d => ({
            tag: d.sample_tag,
            "Submission": d.submission_tag,
            PC1: d.components?.[0],
            PC2: d.components?.[1],
            "Condition Application": _.isArray(d.condition_applications) && d.condition_applications.length > 0
                ? d.condition_applications[0]
                : "None",
            "Condition Applications": _.isArray(d.condition_applications) ? d.condition_applications : []
        }))
    }, [projection])

    if (projectionData.length === 0) return null

    return (
        <InteractiveChart
            data={projectionData}
            keyNames={[{ xaxisName: "PC1", yaxisName: "PC2" }]}
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
                        colorName={colorName}
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
    const [colorOption, setColorOption] = useState(COLOR_OPTIONS[0].tag)

    const { data: projection, isLoading, isError, error } = api.stats.proteomeProjection.useGetProteomeProjection(
        { proteome_tag, n_components: 2 },
        { enabled: _.isString(proteome_tag) && proteome_tag.length > 0, staleTime: 50000 }
    )

    return (
        <div className="div--expand" style={{ overflowY: "scroll", height: "90vh" }}>
            <h2>Cross-Submission Analysis</h2>
            <div className="flex align-center" style={{ gap: "2rem", marginBottom: "1rem" }}>
                <ProteomeSelection proteome_tag={proteome_tag} setProteomeTag={setProteomeTag} />
                <div className="flex" style={{ gap: "0.25rem" }}>
                    {COLOR_OPTIONS.map(option =>
                        <OptionButton key={option.tag} isSelected={colorOption === option.tag} onClick={() => setColorOption(option.tag)}>
                            <span>{option.text}</span>
                        </OptionButton>
                    )}
                </div>
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
                                        ? ` PC1/PC2 explain ${_.round(_.sum(_.take(projection.variance_explained, 2)) * 100, 1)}% of the variance.`
                                        : null}
                                </div>
                                <div className="flex flex--wrap align-start" style={{ gap: "2rem" }}>
                                    <PooledProjectionPlot projection={projection} colorOption={colorOption} />
                                    <TopDrivers drivers={projection.drivers} />
                                </div>
                            </div>
                        ) : null}
        </div>
    )
}
