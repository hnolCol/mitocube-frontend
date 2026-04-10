import React, { useState, useEffect } from "react";
import { HIGHLIGHT_COLOR } from "/src/comps/core/colors/colorPalette.js";

const REQUIRED_COLUMNS = [
  { key: "protein_id", label: "UniProt ID" },
];

const COLUMN_KEYWORDS = {
  protein_id: ["uniprot", "uniprot_id", "accession"],
};

export function AnnotationsChunkUploader({ onProteinIdsLoaded }) {
  const [columnIndex, setColumnIndex] = useState({
    protein_id: undefined,
  });
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);


  const handleFileChange = (e) => {
    if (!e.target.files?.length) return;

    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      const firstLine = event.target.result.split(/\r?\n/)[0];
      const cols = firstLine.split(/\t/);
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

      REQUIRED_COLUMNS.forEach((col) => {
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
  }, [headers]);

  const canUse =
    file &&
    headers.length > 0 &&
    REQUIRED_COLUMNS.every(
      (col) => columnIndex[col.key] !== undefined
    );


  const extractProteinIds = () => {
    if (!file || !canUse) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const lines = event.target.result.split(/\r?\n/);
      lines.shift(); // remove header

      const proteinIds = lines
        .map((line) => {
          const cols = line.split(/\t/);
          return cols[columnIndex.protein_id]?.trim();
        })
        .filter(Boolean);
      onProteinIdsLoaded(proteinIds);
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
      <h3>Upload protein IDs from file</h3>

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
        {file ? file.name : "Select .txt / .csv / .tsv file"}
        <input
          type="file"
          accept=".txt,.csv,.tsv"
          onChange={handleFileChange}
          hidden
        />
      </label>

      {headers.length > 0 && (
        <div>
          <h4>Required column</h4>
          {REQUIRED_COLUMNS.map((col) => (
            <div key={col.key}>
              <label>{col.label}</label>
              <select
                value={columnIndex[col.key] ?? ""}
                onChange={(e) =>
                  handleHeaderSelect(col.key, Number(e.target.value))
                }
              >
                <option value="" disabled>
                  Select column
                </option>
                {headers.map((h, i) => (
                  <option key={i} value={i}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={extractProteinIds}
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
        Upload Protein IDs
      </button>
    </div>
  );
}
