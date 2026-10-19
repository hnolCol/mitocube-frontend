import { useState } from "react"
import PropTypes from "prop-types"
import _ from "lodash"
import { Button, Callout, HTMLSelect, Tag } from "@blueprintjs/core"
import { api } from "@/api"
import Loading from "../../core/base/loading"
import APIError from "../../core/error/APIerror"

const CURATOR_ROLE = 2

AdminReports.propTypes = {
    authenticationStatus: PropTypes.shape({ role: PropTypes.oneOfType([PropTypes.number, PropTypes.string]) })
}

/**
 * @description Admin page with the aggregated MitoCube year report for the whole
 * platform: community growth, submissions, data volume, instrument performance
 * and highlights. Only visible to curators and admins (role >= 2); the backend
 * enforces curator rights on all report endpoints as well. The report can be
 * downloaded as an Excel workbook or a Markdown file.
 * @param {Object} props
 * @param {Object} props.authenticationStatus Authentication status of the current user
 * @returns {JSX.Element|null} The year report admin view.
 */
export function AdminReports({ authenticationStatus }) {
    const [error, setError] = useState(null)
    const userRole = _.get(authenticationStatus, "role", 0)
    const isCurator = _.isFinite(_.toNumber(userRole)) && _.toNumber(userRole) >= CURATOR_ROLE
    const { data: years, isLoading: yearsIsLoading, isError: yearsIsError, error: yearsError } =
        api.reports.year.useGetReportYears({ staleTime: Infinity, retry: false })
    const availableYears = _.isArray(years) ? _.sortBy(_.map(years, _.toNumber)) : []
    const [selectedYear, setSelectedYear] = useState(null)
    const year = selectedYear != null && _.isFinite(_.toNumber(selectedYear))
        ? _.toNumber(selectedYear)
        : (_.isEmpty(availableYears) ? null : _.last(availableYears))
    const { data: report, isLoading: reportIsLoading, isError: reportIsError, error: reportError } =
        api.reports.year.useGetYearReport(
            { year }, { enabled: isCurator && year != null && _.isFinite(year), staleTime: 50000, retry: false })
    const download = api.reports.year.useDownloadYearReport()

    if (!isCurator) {
        return <Callout intent="warning" title="Restricted area">
            The year report is only available to curators and admins.
        </Callout>
    }
    if (yearsIsLoading || reportIsLoading) return <Loading />
    if (yearsIsError) return <APIError error={yearsError} />
    if (reportIsError) return <APIError error={reportError} />
    if (_.isEmpty(availableYears)) {
        return <Callout intent="none" title="No report data">
            No calendar year with reportable data was found.
        </Callout>
    }

    const downloadReport = (format) => {
        setError(null)
        download.mutate({ year, format }, {
            onSuccess: (blob) => {
                const url = URL.createObjectURL(blob instanceof Blob ? blob : new Blob([blob]))
                const link = document.createElement("a")
                link.href = url
                link.download = `mitocube_year_report_${year}.${format}`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)
            },
            onError: (err) => setError(err?.response?.data?.detail || err?.message || "Downloading the year report failed.")
        })
    }
    return (
        <div className="div--expand padding--medium" style={{ overflowY: "auto" }}>
            <div className="flex margin--medium" style={{ alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                <h3>MitoCube Year Report</h3>
                <div className="flex" style={{ alignItems: "center", gap: "0.6rem" }}>
                    <HTMLSelect
                        value={year}
                        onChange={e => setSelectedYear(_.toNumber(e.target.value))}>
                        {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </HTMLSelect>
                    <Button
                        icon="download"
                        text="Excel"
                        loading={download.isPending}
                        onClick={() => downloadReport("xlsx")} />
                    <Button
                        icon="download"
                        text="Markdown"
                        loading={download.isPending}
                        onClick={() => downloadReport("md")} />
                </div>
            </div>
            {_.isString(error) ?
                <Callout intent="danger" title="Download failed" className="margin--medium">{error}</Callout> : null}
            {report ? <YearReportSummary report={report} /> : null}
        </div>
    )
}

YearReportSummary.propTypes = {
    report: PropTypes.object.isRequired
}

/**
 * @description Renders the sections of the aggregated yearly report
 * (community, submissions, data volume, instrument performance, highlights).
 * @param {Object} props
 * @param {Object} props.report The yearly report returned by the API
 * @returns {JSX.Element} The report summary.
 */
function YearReportSummary({ report }) {
    const community = report.community || {}
    const submissions = report.submissions || {}
    const dataVolume = report.data_volume || {}
    const instruments = _.isArray(report.instrument_performance) ? report.instrument_performance : []
    const highlights = report.highlights || {}
    return (
        <div className="flex flex-column margin--medium" style={{ gap: "1rem" }}>
            <div className="container--shadow padding--medium" style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                <ReportStat label="New users" value={community.new_users} />
                <ReportStat label="Total users" value={community.total_users} />
                <ReportStat label="New submissions" value={submissions.new_submissions} />
                <ReportStat label="New samples" value={submissions.new_samples} />
                <ReportStat label="Quantified protein groups" value={dataVolume.quantified_protein_groups} />
            </div>
            {_.isArray(submissions.per_research_group) && !_.isEmpty(submissions.per_research_group) ?
                <ReportTable title="Submissions per research group" rows={submissions.per_research_group} /> : null}
            {_.isArray(submissions.per_user) && !_.isEmpty(submissions.per_user) ?
                <ReportTable title="Submissions per user" rows={submissions.per_user} /> : null}
            {!_.isEmpty(instruments) ?
                <div className="container--shadow padding--medium">
                    <h4>Instrument performance</h4>
                    <div className="flex" style={{ gap: "0.6rem", flexWrap: "wrap" }}>
                        {instruments.map(instrument => (
                            <Tag key={instrument.instrument_tag} minimal={true}>
                                {instrument.instrument_tag}: {_.isFinite(instrument.qc_runs) ? `${instrument.qc_runs} QC runs` : "no QC runs"}
                                {_.isFinite(_.toNumber(instrument.median_quant_proteins)) ?
                                    ` · median ${_.toNumber(instrument.median_quant_proteins)} proteins` : ""}
                            </Tag>
                        ))}
                    </div>
                </div> : null}
            {_.isArray(highlights.trending_submissions) && !_.isEmpty(highlights.trending_submissions) ?
                <div className="container--shadow padding--medium">
                    <h4>Highlights</h4>
                    <div className="flex" style={{ gap: "0.6rem", flexWrap: "wrap" }}>
                        {highlights.trending_submissions.map(tag => <Tag key={tag} intent="primary" minimal={true}>{tag}</Tag>)}
                    </div>
                </div> : null}
        </div>
    )
}

ReportStat.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
}

function ReportStat({ label, value }) {
    return (
        <div>
            <div className="bp5-text-muted" style={{ fontSize: "0.85rem" }}>{label}</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 600 }}>{_.isFinite(_.toNumber(value)) ? _.toNumber(value) : "–"}</div>
        </div>
    )
}

ReportTable.propTypes = {
    title: PropTypes.string.isRequired,
    rows: PropTypes.array.isRequired
}

function ReportTable({ title, rows }) {
    const headers = _.keys(rows[0])
    return (
        <div className="container--shadow padding--medium">
            <h4>{title}</h4>
            <table className="bp5-html-table bp5-html-table-striped" style={{ width: "100%" }}>
                <thead>
                    <tr>{headers.map(header => <th key={header}>{_.startCase(header)}</th>)}</tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i}>
                            {headers.map(header => <td key={header}>{_.isFinite(_.toNumber(row[header])) ? _.toNumber(row[header]) : (row[header] ?? "–")}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default AdminReports
