import { useState, useEffect } from "react";
import { HIGHLIGHT_COLOR } from "@mitocube/viz/src/colors/palette";

const REQUIRED_COLUMNS = [
    { key: "protein_tag_a", label: "Protein Tag A" },
    { key: "protein_tag_b", label: "Protein Tag B" },
    { key: "pos_a", label: "Position A" },
    { key: "pos_b", label: "Position B" },
    { key: "score", label: "Score" },
];

const ALL_COLUMNS = [...REQUIRED_COLUMNS];

const COLUMN_KEYWORDS = {
    protein_tag_a: ["protein_tag_a", "protein_a", "prot_a"],
    protein_tag_b: ["protein_tag_b", "protein_b", "prot_b"],
    pos_a: ["pos_a", "position_a"],
    pos_b: ["pos_b", "position_b"],
    score: ["score"],
};

export function CrosslinkFileParser({ onCrosslinksLoaded }) {
    const [columnIndex, setColumnIndex] = useState({});
    const [file, setFile] = useState(null);
    const [headers, setHeaders] = useState([]);
    const [fileError, setFileError] = useState(null);

    const handleFileChange = (e) => {
        if (!e.target.files?.length) return;

        const selectedFile = e.target.files[0];
        if (!selectedFile.name.toLowerCase().endsWith(".txt")) {
            setFileError("Only .txt files are allowed.");
            setFile(null);
            setHeaders([]);
            e.target.value = "";
            return;
        }

        setFileError(null);
        setFile(selectedFile);

        const reader = new FileReader();
        reader.onload = (event) => {
            const firstLine = event.target.result.split(/\r?\n/)[0];
            const cols = firstLine.split(/\t|,/);
            setHeaders(cols);
        };

        reader.readAsText(selectedFile.slice(0, 1024));
    };

    const handleHeaderSelect = (key, idx) => {
        setColumnIndex((prev) => ({
            ...prev,
            [key]: idx,
        }));
    };

    useEffect(() => {
        if (!headers.length) return;

        setColumnIndex((prev) => {
            const updated = { ...prev };
            ALL_COLUMNS.forEach((col) => {
                const keywords = COLUMN_KEYWORDS[col.key] || [];
                const foundIdx = headers.findIndex((header) =>
                    keywords.some((kw) => header.toLowerCase().includes(kw.toLowerCase()))
                );
                if (foundIdx !== -1) {
                    updated[col.key] = foundIdx;
                }
            });
            return updated;
        });
    }, [headers]);

    const canUse =
        file &&
        headers.length > 0 &&
        REQUIRED_COLUMNS.every((col) => columnIndex[col.key] !== undefined);

    const extractCrosslinks = () => {
        if (!file || !canUse) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const lines = event.target.result.split(/\r?\n/);
            lines.shift();

            const crosslinks = lines
                .filter((line) => line.trim() !== "")
                .map((line) => {
                    const cols = line.split(/\t|,/);
                    return {
                        protein_tag_a: cols[columnIndex.protein_tag_a]?.trim(),
                        protein_tag_b: cols[columnIndex.protein_tag_b]?.trim(),
                        pos_a: Number(cols[columnIndex.pos_a]),
                        pos_b: Number(cols[columnIndex.pos_b]),
                        score: columnIndex.score !== undefined ? Number(cols[columnIndex.score]) : null,
                    };
                });

            onCrosslinksLoaded(crosslinks);
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
                margin: "20px auto",
                background: "#fff",
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 16,
            }}
        >
            <h3>Upload crosslinks from file</h3>

            <div
                style={{
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 13,
                    color: "#374151",
                    lineHeight: 1.5,
                }}
            >
                <span style={{ color: "#c0392b", fontWeight: 600 }}>Required columns:</span>{" "}
                {REQUIRED_COLUMNS.map((col) => col.label).join(", ")}
            </div>

            <label
                style={{
                    padding: "12px",
                    border: `2px dashed ${HIGHLIGHT_COLOR}`,
                    borderRadius: 8,
                    textAlign: "center",
                    cursor: "pointer",
                    color: HIGHLIGHT_COLOR,
                }}
            >
                {file ? file.name : "Select .txt file"}
                <input type="file" accept=".txt" onChange={handleFileChange} hidden />
            </label>

            {fileError && (
                <span style={{ color: "#c0392b", fontSize: "0.85rem" }}>{fileError}</span>
            )}

            {headers.length > 0 && (
                <div>
                    <h4>Required columns</h4>
                    {REQUIRED_COLUMNS.map((col) => (
                        <div key={col.key} style={{ marginBottom: 8 }}>
                            <label style={{ marginRight: 8 }}>{col.label}</label>
                            <select
                                value={columnIndex[col.key] ?? ""}
                                onChange={(e) => handleHeaderSelect(col.key, Number(e.target.value))}
                            >
                                <option value="" disabled>Select column</option>
                                {headers.map((h, i) => (
                                    <option key={i} value={i}>{h}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={extractCrosslinks}
                disabled={!canUse}
                style={{
                    padding: "10px",
                    background: canUse ? HIGHLIGHT_COLOR : "#d1d5db",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    cursor: canUse ? "pointer" : "not-allowed",
                }}
            >
                Load Crosslinks
            </button>
        </div>
    );
}