import React, { useState, useEffect } from "react";
import hooks from "@mitocube/api-hooks";
import { CopySubmissionSampleTags } from "../../../submission/samples/CopySampleTags";
import { HIGHLIGHT_COLOR } from "../../colors/colorPalette";

const CHUNK_SIZE = 1024 * 10; // 10KB per chunk (adjust as needed)

const REQUIRED_COLUMNS = [
    { key: "sample_tag", label: "Sample Name" },
    { key: "value", label: "Value" },
    { key: "tag", label: "Protein Group Tag" },
];

    // Map of keywords to column keys for auto-selection
const COLUMN_KEYWORDS = {
    sample_tag: ["sample_tag", "sample", "tag"],
    value: ["value", "intensity", "amount"],
    tag: ["protein_id", "Key", "Protein.ID", "ProteinGroup", "protein", "id"],
};

export function ProteinQuantificationUploader({ submission_tag }) {
    
    const [columnIndex, setColumnIndex] = useState({
        sample_tag: undefined,
        value: undefined,
        protein_tag: undefined,
    });
    const [file, setFile] = useState(null);
    const [headers, setHeaders] = useState([]);
    const [progress, setProgress] = useState(0);
    const [overwriteChecked, setOverwriteChecked] = useState(false);

    const { mutateAsync } = hooks.submissions.quantifications.usePostProteinQuantification();

    // Check if quantification data already exists for this submission
    const { data: quantificationExists } = hooks.submissions.quantifications.useGetSubmissionQuantificationExists( 
        { tag: submission_tag, quantification_type: "protein_groups" },
        { staleTime: 30000 }
    );


    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setProgress(0);

            // Read first line for headers
            const reader = new FileReader();
            reader.onload = (event) => {
                const firstLine = event.target.result.split(/\r?\n/)[0];
                const cols = firstLine.split(/\t|,/); // supports tab or comma
                setHeaders(cols);
            };
            // Read only the first 1KB for header
            const blob = selectedFile.slice(0, 1024);
            reader.readAsText(blob);
        }
    };

    const handleHeaderSelect = (key, idx) => {
        setColumnIndex((prev) => ({
            ...prev,
            [key]: idx,
        }));
    };


    // Auto-select columns based on keywords in headers
    useEffect(() => {
        if (headers.length === 0) return;

        setColumnIndex((prev) => {
            const updated = { ...prev };
            REQUIRED_COLUMNS.forEach((col) => {
                // if (updated[col.key] !== undefined) return;
                const keywords = COLUMN_KEYWORDS[col.key] || [];
                const foundIdx = headers.findIndex((header) =>
                    keywords.some((kw) =>
                        header.toLowerCase().includes(kw.toLowerCase())
                    )
                );
                if (foundIdx !== -1) {
                    updated[col.key] = foundIdx;
                }
            });
            return updated;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [headers]);

    const canUpload =
        file &&
        headers.length > 0 &&
        REQUIRED_COLUMNS.every((col) => columnIndex[col.key] !== undefined) &&
        (!quantificationExists || overwriteChecked); // require overwrite confirmation if data exists

    const uploadFileInChunks = async () => {
        if (!file || !canUpload) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const content = event.target.result;
            const lines = content.split(/\r?\n/);
            // Remove header
            lines.shift();

            // const totalChunks = Math.ceil(lines.length / (CHUNK_SIZE / 100)); // rough estimate: 100 chars per line

            for (let i = 0; i < lines.length; i += CHUNK_SIZE / 100) {
                const chunkLines = lines.slice(i, i + CHUNK_SIZE / 100);
                // Subset columns
                const chunk = chunkLines
                    .filter((line) => line.trim() !== "")
                    .map((line) => {
                        const cols = line.split(/\t|,/);
                        return {
                            sample_tag: cols[columnIndex.sample_tag],
                            value: cols[columnIndex.value],
                            tag: cols[columnIndex.tag],
                        };
                    });
                await mutateAsync({ tag: submission_tag, quantifications: chunk });
                setProgress(Math.round(((i + chunkLines.length) / lines.length) * 100));
            }

            alert("Upload complete!");
        };

        reader.readAsText(file);
    };

    return (
        <div
            style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                width: "100%",
                maxWidth: 420,
                margin: "40px auto",
                background: "#fff",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                padding: 32,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>
                Upload Protein Quantification File
            </h2>
            <div>
                <span>
                    Protein quantification files must be uploaded in a long format. The columns must be tab-separated. The required columns are:{" "}
                    {REQUIRED_COLUMNS.map((col) => col.label).join(", ")}
                </span>
                <div style={{ float: "right" }}>
                    <CopySubmissionSampleTags submission_tag={submission_tag} />
                </div>
            </div>
            <div style={{ width: "100%", marginBottom: 20, marginTop: 20 }}>
                <label
                    // htmlFor="modern-file-upload"
                    style={{
                        display: "block",
                        width: "100%",
                        padding: "14px 0",
                        background: "#f3f4f6",
                        border: `2px solid ${HIGHLIGHT_COLOR}`,
                        borderRadius: 8,
                        textAlign: "center",
                        color: HIGHLIGHT_COLOR,
                        fontWeight: 500,
                        fontSize: 16,
                        cursor: "pointer",
                        transition: "background 0.2s, border-color 0.2s",
                        marginBottom: 0,
                    }}
                    onMouseOver={e => (e.currentTarget.style.background = "#e0e7ef")}
                    onMouseOut={e => (e.currentTarget.style.background = "#f3f4f6")}
                >
                    {file ? (
                        <>
                            <span style={{ color: "#111827" }}>{file.name}</span>
                            <span style={{ marginLeft: 12, color: "#6b7280", fontSize: 14 }}>
                                (Change file)
                            </span>
                        </>
                    ) : (
                        <>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="28"
                                height="28"
                                fill="none"
                                viewBox="0 0 24 24"
                                style={{ verticalAlign: "middle", marginRight: 8, color: HIGHLIGHT_COLOR}}
                            >
                                <path
                                    fill="currentColor"
                                    d="M12 16a1 1 0 0 1-1-1V7.83l-2.29 2.3a1 1 0 1 1-1.42-1.42l4-4a1 1 0 0 1 1.42 0l4 4a1 1 0 1 1-1.42 1.42L13 7.83V15a1 1 0 0 1-1 1Zm-7 4a1 1 0 0 1 0-2h14a1 1 0 1 1 0 2H5Z"
                                />
                            </svg>
                            Click or drag to select a .txt file
                        </>
                    )}
                    <input
                        id="modern-file-upload"
                        type="file"
                        accept=".txt"
                        onChange={handleFileChange}
                        style={{
                            display: "none",
                        }}
                    />
                </label>
            </div>
            {headers.length > 0 && (
                <div style={{ width: "100%", marginBottom: 20 }}>
                    <h4 style={{ marginBottom: 8 }}>Map Required Columns:</h4>
                    {REQUIRED_COLUMNS.map((col) => (
                        <div key={col.key} style={{ marginBottom: 10 }}>
                            <label style={{ marginRight: 8 }}>{col.label}:</label>
                            <select
                                value={columnIndex[col.key] ?? ""}
                                onChange={(e) => handleHeaderSelect(col.key, Number(e.target.value))}
                                style={{
                                    padding: 8,
                                    borderRadius: 6,
                                    border: "1px solid #d1d5db",
                                    fontSize: 15,
                                    background: "#f9fafb",
                                    minWidth: 120,
                                }}
                            >
                                <option value="" disabled>
                                    Select column
                                </option>
                                {headers.map((header, idx) => (
                                    <option key={idx} value={idx}>
                                        {header}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            )}
            {quantificationExists && (
    <div style={{ width: "100%", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
        <input type="checkbox" id="overwrite" checked={overwriteChecked} onChange={(e) => setOverwriteChecked(e.target.checked)} />
        <label htmlFor="overwrite" style={{ fontSize: 14, color: "#111827", fontWeight: 600, cursor: "pointer" }}>
            Overwrite existing quantification data
        </label>
    </div>
)}
            <button
                onClick={uploadFileInChunks}
                disabled={!canUpload}
                style={{
                    padding: "12px 28px",
                    background: canUpload ? HIGHLIGHT_COLOR : "#d1d5db",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 17,
                    cursor: canUpload ? "pointer" : "not-allowed",
                    transition: "background 0.2s",
                    marginTop: 6,
                }}
            >
                Upload
            </button>
            {progress > 0 && (
                <div
                    style={{
                        marginTop: 20,
                        width: "100%",
                        background: "#f3f4f6",
                        height: 16,
                        borderRadius: 8,
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            background: HIGHLIGHT_COLOR,
                            height: "100%",
                            width: `${progress}%`,
                            borderRadius: 8,
                            transition: "width 0.3s",
                        }}
                    ></div>
                </div>
            )}
            {progress > 0 && (
                <p style={{ marginTop: 10, fontSize: 14, color: "#374151" }}>
                    {progress}% uploaded
                </p>
            )}
        </div>
    );
}
