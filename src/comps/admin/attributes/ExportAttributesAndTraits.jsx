import { useState } from "react"
import PropTypes from "prop-types"
import { api } from "@/api"
import { downloadJSONFile } from "@/services/downloads/json"

export function ExportAttributesButton() {
    const [isExporting, setIsExporting] = useState(false)
    const [isError, setIsError] = useState(false)

    const { refetch } = api.attributes.queryAttributes.useExportAttributes({
        enabled: false,
    })

    const handleExport = async () => {
        setIsExporting(true)
        setIsError(false)
        const { data, isError: fetchError } = await refetch()
        if (fetchError || !data) {
            setIsError(true)
        } else {
            downloadJSONFile(data, "mitocube_attributes_export.json")
        }
        setIsExporting(false)
    }

    return (
        <button
            className={`basic-button--small ${isError ? "basic-button--danger" : ""}`}
            disabled={isExporting}
            onClick={handleExport}
        >
            {isError ? "Export failed" : isExporting ? "Exporting..." : "Export Attributes"}
        </button>
    )
}

ExportTraitsButton.propTypes = {
    tag: PropTypes.string.isRequired,
}
export function ExportTraitsButton({ tag }) {
    const [isExporting, setIsExporting] = useState(false)
    const [isError, setIsError] = useState(false)

    const { refetch } = api.traits.queryTraits.useExportAttributeTraits(
        { tag },
        { enabled: false }
    )

    const handleExport = async () => {
        setIsExporting(true)
        setIsError(false)
        const { data, isError: fetchError } = await refetch()
        if (fetchError || !data) {
            setIsError(true)
        } else {
            downloadJSONFile(data, `${tag}_traits_export.json`)
        }
        setIsExporting(false)
    }

    return (
        <button
            className={`basic-button--small ${isError ? "basic-button--danger" : ""}`}
            disabled={isExporting}
            onClick={handleExport}
        >
            {isError ? "Export failed" : isExporting ? "Exporting..." : "Export traits"}
        </button>
    )
}