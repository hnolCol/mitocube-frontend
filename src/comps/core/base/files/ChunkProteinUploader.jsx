import React, { useState } from "react";
import hooks from "@mitocube/api-hooks";

const CHUNK_SIZE = 1024 * 10; // 10KB per chunk (adjust as needed)

const REQUIRED_COLUMNS = [
    { key: "sample_tag", label: "Sample Tag" },
    { key: "value", label: "Value" },
    { key: "tag", label: "Protein Tag" },
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

    const { mutateAsync } = hooks.submissions.quantifications.usePostProteinQuantification();

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
    React.useEffect(() => {
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
        REQUIRED_COLUMNS.every((col) => columnIndex[col.key] !== undefined);

    const uploadFileInChunks = async () => {
        if (!file || !canUpload) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const content = event.target.result;
            const lines = content.split(/\r?\n/);
            // Remove header
            lines.shift();

            const totalChunks = Math.ceil(lines.length / (CHUNK_SIZE / 100)); // rough estimate: 100 chars per line

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
                console.log(chunk)
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
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 20 }}>
                Upload Protein Quantification File
            </h2>
            <input
                type="file"
                accept=".txt"
                onChange={handleFileChange}
                style={{
                    marginBottom: 20,
                    fontSize: 16,
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    padding: 8,
                    width: "100%",
                }}
            />
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
                                    padding: 6,
                                    borderRadius: 4,
                                    border: "1px solid #d1d5db",
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
            <button
                onClick={uploadFileInChunks}
                disabled={!canUpload}
                style={{
                    padding: "10px 24px",
                    background: canUpload ? "#2563eb" : "#d1d5db",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    fontWeight: 500,
                    fontSize: 16,
                    cursor: canUpload ? "pointer" : "not-allowed",
                    transition: "background 0.2s",
                }}
            >
                Upload
            </button>
            {progress > 0 && (
                <div
                    style={{
                        marginTop: 24,
                        width: "100%",
                        background: "#f3f4f6",
                        height: 16,
                        borderRadius: 8,
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            background: "#22c55e",
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
