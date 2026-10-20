import React, { useState, useCallback, useRef, useMemo } from "react";
import _ from "lodash";
import { api } from "@/api";
import { CopySubmissionSampleTags } from "../../../submission/samples/CopySampleTags";
import { HIGHLIGHT_COLOR } from "../../colors/colorPalette";

// Configuration constants
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB limit
const CHUNK_SIZE = 1024 * 1024 * 5; // 5MB per chunk (balanced for memory and network)
const MAX_PARALLEL_UPLOADS = 4; // Number of concurrent uploads
const MAX_RETRIES = 3; // Maximum retries per chunk
const RETRY_DELAY_BASE = 1000; // Base delay in ms for exponential backoff

/**
 * Quantification type configurations.
 * Each type defines its required columns, column auto-mapping keywords,
 * line parser and the api hook used to upload a chunk.
 */
const QUANTIFICATION_TYPES = {
    protein: {
        title: "Upload Protein Quantification File",
        uploadHook: () => api.submissions.quantifications.usePostProteinQuantification(),
        existsType: "protein_groups",
        showSampleTagCopy: true,
        updateStatsAfterUpload: true,
        requiredColumns: [
            { key: "sample_tag", label: "Sample Name" },
            { key: "value", label: "Value" },
            { key: "tag", label: "Protein Group Tag" },
        ],
        columnKeywords: {
            sample_tag: ["sample_tag", "sample", "tag"],
            value: ["value", "intensity", "amount"],
            tag: ["protein_id", "key", "protein.id", "proteingroup", "protein", "id"],
        },
        parseLine: (cols, columnIndex) => ({
            sample_tag: cols[columnIndex.sample_tag],
            value: cols[columnIndex.value],
            tag: cols[columnIndex.tag],
        }),
    },
    precursor: {
        title: "Upload Precursor Quantification File",
        uploadHook: () => api.submissions.quantifications.usePostPrecursorQuantification(),
        existsType: null,
        showSampleTagCopy: true,
        updateStatsAfterUpload: true,
        requiredColumns: [
            { key: "sample_tag", label: "Sample Tag" },
            { key: "peptide_tag", label: "Stripped Sequence" },
            { key: "value", label: "Value" },
            { key: "score", label: "Score" },
            { key: "rt", label: "Retention Time (min)" },
            { key: "charge", label: "Charge" },
            { key: "protein_group_tag", label: "Protein Group Tag" },
        ],
        columnKeywords: {
            sample_tag: ["sample_tag", "sample", "sample id", "sample name", "sample_tag_id"],
            peptide_tag: ["peptide", "stripped sequence", "peptide_tag", "sequence", "strippedsequence", "stripped.sequence"],
            value: ["value", "intensity", "amount", "abundance", "quant", "quantity"],
            score: ["score", "cscore", "confidence", "probability", "pep score", "psm score"],
            rt: ["rt", "retention time", "retention_time", "retentiontime", "elution time", "elution_time", "elutiontime"],
            charge: ["charge", "z", "precursor charge", "precursor_charge"],
            protein_group_tag: ["protein group", "protein_group", "protein group tag", "protein_group_tag", "protein group id", "protein_group_id"],
        },
        parseLine: (cols, columnIndex) => ({
            sample_tag: cols[columnIndex.sample_tag],
            value: parseFloat(cols[columnIndex.value]) || 0,
            score: parseFloat(cols[columnIndex.score]) || 0,
            tag: cols[columnIndex.peptide_tag],
            rt: parseFloat(cols[columnIndex.rt]) || null,
            charge: parseInt(cols[columnIndex.charge]) || null,
            protein_group_tag: cols[columnIndex.protein_group_tag],
        }),
    },
};

/**
 * Format file size in human-readable format
 */
const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Format time in human-readable format
 */
const formatTime = (seconds) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`;
};

/**
 * Unified chunked quantification uploader for protein and precursor data:
 * - File size validation
 * - Streaming chunk processing (memory-safe, works for very large files)
 * - Parallel chunk uploads with retry logic and exponential backoff
 * - Pause/cancel capability
 * - Comprehensive progress reporting with ETA and upload speed
 *
 * @param {Object} props
 * @param {string} props.submission_tag - The submission tag to upload to
 * @param {string} props.quantification_type - "protein" or "precursor"
 * @returns {JSX.Element}
 */
export function QuantificationUploader({ submission_tag, quantification_type = "protein", onUploadStatusChange }) {
    const type = QUANTIFICATION_TYPES[quantification_type] || QUANTIFICATION_TYPES.protein;

    // State for file and headers
    const [file, setFile] = useState(null);
    const [headers, setHeaders] = useState([]);
    const [columnIndex, setColumnIndex] = useState({});

    // State for upload progress and control
    const [progress, setProgress] = useState(0);
    const [uploadStatus, setUploadStatusState] = useState("idle"); // idle, uploading, paused, completed, error
    const setUploadStatus = useCallback(
        (status) => {
            setUploadStatusState(status);
            if (onUploadStatusChange) onUploadStatusChange(status);
        },
        [onUploadStatusChange]
    );
    const [totalChunks, setTotalChunks] = useState(0);
    const [uploadedChunks, setUploadedChunks] = useState(0);
    const [failedChunks, setFailedChunks] = useState([]);
    const [eta, setEta] = useState(null);
    const [uploadSpeed, setUploadSpeed] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [overwriteChecked, setOverwriteChecked] = useState(false);

    // Refs for tracking upload state
    const uploadStartTimeRef = useRef(null);
    const cancelledRef = useRef(false);
    const activeUploadsRef = useRef(0);

    const { mutateAsync } = type.uploadHook();
    const { mutate: updateStats, isLoading: isUpdatingStats, isSuccess: isUpdatingStatsSuccess } =
        api.submissions.ranking.useUpdateSubmissionStats();

    // Check if quantification data already exists for this submission
    const { data: quantificationExists } = api.submissions.quantifications.useGetSubmissionQuantificationExists(
        type.existsType ? { tag: submission_tag, quantification_type: type.existsType } : { tag: submission_tag },
        { staleTime: 30000, enabled: _.isString(submission_tag) && type.existsType !== null }
    );

    /**
     * Validate file before processing
     */
    const validateFile = useCallback((selectedFile) => {
        if (!selectedFile.name.endsWith(".txt") && !selectedFile.name.endsWith(".csv")) {
            setErrorMessage("Please upload a .txt or .csv file");
            return false;
        }
        if (selectedFile.size > MAX_FILE_SIZE) {
            setErrorMessage(`File is too large (${formatFileSize(selectedFile.size)}). Maximum size is ${formatFileSize(MAX_FILE_SIZE)}`);
            return false;
        }
        if (selectedFile.size === 0) {
            setErrorMessage("File is empty");
            return false;
        }
        setErrorMessage(null);
        return true;
    }, []);

    /**
     * Reset column mapping state for a (new) file
     */
    const resetColumnIndex = useCallback(() => {
        const initial = {};
        type.requiredColumns.forEach((col) => {
            initial[col.key] = undefined;
        });
        setColumnIndex(initial);
    }, [type]);

    /**
     * Handle file selection
     */
    const handleFileChange = useCallback(
        (e) => {
            if (e.target.files.length > 0) {
                const selectedFile = e.target.files[0];

                if (!validateFile(selectedFile)) {
                    setFile(null);
                    setHeaders([]);
                    return;
                }

                setFile(selectedFile);
                setProgress(0);
                setUploadStatus("idle");
                setTotalChunks(0);
                setUploadedChunks(0);
                setFailedChunks([]);
                setEta(null);
                setUploadSpeed(null);
                cancelledRef.current = false;
                resetColumnIndex();

                // Read first line for headers (only first 10KB for safety)
                const reader = new FileReader();
                reader.onload = (event) => {
                    const firstLine = event.target.result.split(/\r?\n/)[0];
                    const cols = firstLine.split(/\t|,/);
                    setHeaders(cols);
                };
                reader.onerror = () => {
                    setErrorMessage("Failed to read file headers");
                    setFile(null);
                };
                const blob = selectedFile.slice(0, 10240);
                reader.readAsText(blob);
            }
        },
        [validateFile, resetColumnIndex]
    );

    /**
     * Auto-select columns based on keywords in headers
     */
    React.useEffect(() => {
        if (headers.length === 0) return;

        setColumnIndex((prev) => {
            const updated = { ...prev };
            type.requiredColumns.forEach((col) => {
                const keywords = type.columnKeywords[col.key] || [];
                const foundIdx = headers.findIndex((header) =>
                    keywords.some((kw) => header.toLowerCase().includes(kw.toLowerCase()))
                );
                if (foundIdx !== -1) {
                    updated[col.key] = foundIdx;
                }
            });
            return updated;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [headers]);

    /**
     * Handle manual column selection
     */
    const handleHeaderSelect = useCallback((key, idx) => {
        setColumnIndex((prev) => ({
            ...prev,
            [key]: idx,
        }));
    }, []);

    /**
     * Check if the upload can be started
     */
    const canUpload = useMemo(() => {
        return (
            file &&
            headers.length > 0 &&
            type.requiredColumns.every((col) => columnIndex[col.key] !== undefined) &&
            uploadStatus === "idle" &&
            (!quantificationExists || overwriteChecked)
        );
    }, [file, headers, columnIndex, uploadStatus, type, quantificationExists, overwriteChecked]);

    /**
     * Process file in chunks using a streaming approach.
     * Reads the file in small slices to avoid memory issues.
     */
    const processFileInChunks = useCallback(
        (selectedFile, colIndex, onProgress) => {
            const fileSize = selectedFile.size;
            let position = 0;
            let chunkIndex = 0;
            let buffer = "";
            let totalLines = 0;

            const chunks = [];

            const readChunk = async () => {
                while (position < fileSize && !cancelledRef.current) {
                    const remaining = fileSize - position;
                    const readSize = Math.min(CHUNK_SIZE, remaining);

                    const blob = selectedFile.slice(position, position + readSize);
                    const reader = new FileReader();

                    const chunkText = await new Promise((resolve, reject) => {
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = () => reject(new Error("Failed to read chunk"));
                        reader.readAsText(blob);
                    });

                    position += readSize;
                    buffer += chunkText;

                    const lines = buffer.split(/\r?\n/);
                    buffer = lines.pop() || "";

                    // Skip header line (only for first chunk)
                    if (chunkIndex === 0 && lines.length > 0) {
                        lines.shift();
                    }

                    if (lines.length > 0) {
                        const chunkData = lines
                            .filter((line) => line.trim() !== "")
                            .map((line) => type.parseLine(line.split(/\t|,/), colIndex));

                        chunks.push({ index: chunkIndex, data: chunkData });
                        totalLines += chunkData.length;
                        chunkIndex++;

                        onProgress(position, fileSize);
                    }

                    // Yield to event loop to prevent UI freeze
                    await new Promise((resolve) => setTimeout(resolve, 0));
                }

                // Process any remaining buffer
                if (buffer.trim() !== "" && !cancelledRef.current) {
                    chunks.push({ index: chunkIndex, data: [type.parseLine(buffer.split(/\t|,/), colIndex)] });
                    totalLines += 1;
                }

                return { chunks, totalLines };
            };

            return readChunk();
        },
        [type]
    );

    /**
     * Upload a single chunk with retry logic
     */
    const uploadChunkWithRetry = useCallback(
        async (chunk, retryCount = 0) => {
            if (cancelledRef.current) {
                activeUploadsRef.current--;
                return { success: false, chunkIndex: chunk.index, error: "Upload cancelled" };
            }

            try {
                await mutateAsync({ tag: submission_tag, quantifications: chunk.data });
                activeUploadsRef.current--;
                return { success: true, chunkIndex: chunk.index };
            } catch (error) {
                activeUploadsRef.current--;

                if (retryCount >= MAX_RETRIES) {
                    return {
                        success: false,
                        chunkIndex: chunk.index,
                        error: `Failed after ${MAX_RETRIES} retries: ${error.message}`,
                    };
                }

                const delay = RETRY_DELAY_BASE * Math.pow(2, retryCount);
                await new Promise((resolve) => setTimeout(resolve, delay));

                return uploadChunkWithRetry(chunk, retryCount + 1);
            }
        },
        [submission_tag, mutateAsync]
    );

    /**
     * Upload chunks in parallel batches
     */
    const uploadChunksInParallel = useCallback(
        async (chunks) => {
            const totalCount = chunks.length;
            const uploaded = [];
            const failed = [];

            for (let i = 0; i < chunks.length && !cancelledRef.current; i += MAX_PARALLEL_UPLOADS) {
                const batch = chunks.slice(i, i + MAX_PARALLEL_UPLOADS);

                const batchPromises = batch.map((chunk) => {
                    activeUploadsRef.current++;
                    return uploadChunkWithRetry(chunk);
                });

                const batchResults = await Promise.all(batchPromises);

                batchResults.forEach((result) => {
                    if (result.success) {
                        uploaded.push(result);
                    } else {
                        failed.push(result);
                    }
                });

                const completedChunks = uploaded.length + failed.length;
                setUploadedChunks(completedChunks);
                setProgress(50 + Math.round((completedChunks / totalCount) * 50));

                const elapsed = (Date.now() - uploadStartTimeRef.current) / 1000;
                if (elapsed > 0 && completedChunks > 0) {
                    const chunksPerSecond = completedChunks / elapsed;
                    setEta((totalCount - completedChunks) / chunksPerSecond);
                    setUploadSpeed(chunksPerSecond);
                }

                await new Promise((resolve) => setTimeout(resolve, 0));
            }

            return { uploaded, failed };
        },
        [uploadChunkWithRetry]
    );

    /**
     * Main upload function
     */
    const uploadFile = useCallback(async () => {
        if (!file || !canUpload || uploadStatus !== "idle") return;

        setUploadStatus("uploading");
        setErrorMessage(null);
        setUploadedChunks(0);
        setFailedChunks([]);
        cancelledRef.current = false;
        uploadStartTimeRef.current = Date.now();
        activeUploadsRef.current = 0;

        try {
            const { chunks, totalLines } = await processFileInChunks(file, columnIndex, (position, fileSize) => {
                setProgress(Math.round((position / fileSize) * 50)); // first 50% for processing
            });

            if (cancelledRef.current) {
                setUploadStatus("idle");
                return;
            }

            setTotalChunks(chunks.length);
            setProgress(50);

            const { uploaded, failed } = await uploadChunksInParallel(chunks);

            if (cancelledRef.current) {
                setUploadStatus("idle");
                return;
            }

            if (failed.length > 0) {
                setUploadStatus("error");
                setFailedChunks(failed);
                setErrorMessage(`${failed.length} chunks failed to upload. Check your connection and try again.`);
            } else {
                setUploadStatus("completed");
                setProgress(100);
                if (type.updateStatsAfterUpload) {
                    updateStats({ tag: submission_tag });
                }
                alert(`Upload complete! ${totalLines} ${quantification_type} quantifications uploaded.`);
            }
        } catch (error) {
            setUploadStatus("error");
            setErrorMessage(`Upload failed: ${error.message}`);
        }
    }, [file, canUpload, uploadStatus, columnIndex, processFileInChunks, uploadChunksInParallel, updateStats, submission_tag, type, quantification_type]);

    /**
     * Pause upload
     */
    const pauseUpload = useCallback(() => {
        if (uploadStatus === "uploading") {
            cancelledRef.current = true;
            setUploadStatus("paused");
        }
    }, [uploadStatus]);

    /**
     * Retry after pause or failed chunks (restarts from the file)
     */
    const retryUpload = useCallback(() => {
        setUploadStatus("idle");
        cancelledRef.current = false;
        setFailedChunks([]);
        setErrorMessage(null);
        setProgress(0);
        setUploadedChunks(0);
    }, []);

    /**
     * Cancel upload completely and reset state
     */
    const cancelUpload = useCallback(() => {
        cancelledRef.current = true;
        setUploadStatus("idle");
        setProgress(0);
        setUploadedChunks(0);
        setFailedChunks([]);
        setEta(null);
        setUploadSpeed(null);
        setErrorMessage(null);
    }, []);

    /**
     * Reset everything including the selected file
     */
    const resetUpload = useCallback(() => {
        cancelUpload();
        setFile(null);
        setHeaders([]);
        resetColumnIndex();
        setTotalChunks(0);
    }, [cancelUpload, resetColumnIndex]);

    return (
        <div
            style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                width: "100%",
                maxWidth: 500,
                margin: "24px auto",
                background: "#fff",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 16,
            }}
        >
            <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0, textAlign: "center" }}>{type.title}</h2>

            <div>
                <span>
                    Quantification files must be uploaded in a long format. The columns must be tab-separated. The
                    required columns are: {type.requiredColumns.map((col) => col.label).join(", ")}
                </span>
                {type.showSampleTagCopy && (
                    <div style={{ float: "right" }}>
                        <CopySubmissionSampleTags submission_tag={submission_tag} />
                    </div>
                )}
            </div>

            {/* File info display */}
            {file && (
                <div
                    style={{
                        padding: 12,
                        background: "#f0f9ff",
                        borderRadius: 8,
                        border: "1px solid #bae6fd",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: 14,
                    }}
                >
                    <div>
                        <strong>File:</strong> {file.name}
                        <br />
                        <strong>Size:</strong> {formatFileSize(file.size)}
                        {file.size > MAX_FILE_SIZE / 2 && (
                            <span style={{ color: "#f59e0b", marginLeft: 8 }}>(Large file - may take time)</span>
                        )}
                    </div>
                    <button
                        onClick={resetUpload}
                        style={{
                            background: "none",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontSize: 18,
                            padding: "4px 8px",
                        }}
                        title="Reset"
                        disabled={uploadStatus === "uploading"}
                    >
                        &#10005;
                    </button>
                </div>
            )}

            {/* File input */}
            <label
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
                    cursor: uploadStatus === "uploading" ? "not-allowed" : "pointer",
                    transition: "background 0.2s, border-color 0.2s",
                    marginBottom: 0,
                    opacity: uploadStatus === "uploading" ? 0.6 : 1,
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#e0e7ef")}
                onMouseOut={(e) => (e.currentTarget.style.background = "#f3f4f6")}
            >
                {file ? (
                    <>
                        <span style={{ color: "#111827" }}>{file.name}</span>
                        <span style={{ marginLeft: 12, color: "#6b7280", fontSize: 14 }}>(Change file)</span>
                    </>
                ) : (
                    "Click or drag to select a .txt or .csv file"
                )}
                <input
                    type="file"
                    accept=".txt,.csv"
                    onChange={handleFileChange}
                    disabled={uploadStatus === "uploading"}
                    style={{ display: "none" }}
                />
            </label>

            {/* File size limit hint */}
            <div style={{ fontSize: 12, color: "#6b7280", textAlign: "center" }}>
                Maximum file size: {formatFileSize(MAX_FILE_SIZE)}
            </div>

            {/* Column mapping */}
            {headers.length > 0 && (
                <div
                    style={{
                        width: "100%",
                        padding: 12,
                        background: "#f9fafb",
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                    }}
                >
                    <h4 style={{ margin: 0, marginBottom: 12, fontSize: 14, fontWeight: 600 }}>Map Required Columns:</h4>
                    {type.requiredColumns.map((col) => {
                        const isMapped = columnIndex[col.key] !== undefined;
                        return (
                            <div key={col.key} style={{ marginBottom: 8, display: "flex", alignItems: "center" }}>
                                <label
                                    style={{
                                        marginRight: 8,
                                        fontSize: 13,
                                        display: "inline-block",
                                        width: 140,
                                    }}
                                >
                                    {col.label}:
                                </label>
                                <select
                                    value={columnIndex[col.key] ?? ""}
                                    onChange={(e) => handleHeaderSelect(col.key, Number(e.target.value))}
                                    disabled={uploadStatus === "uploading"}
                                    style={{
                                        padding: 6,
                                        borderRadius: 4,
                                        border: `1px solid ${isMapped ? "#10b981" : "#d1d5db"}`,
                                        fontSize: 13,
                                        background: "#fff",
                                        flex: 1,
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
                        );
                    })}
                </div>
            )}

            {/* Overwrite confirmation when data already exists */}
            {quantificationExists && (
                <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                        type="checkbox"
                        id="overwrite"
                        checked={overwriteChecked}
                        onChange={(e) => setOverwriteChecked(e.target.checked)}
                        disabled={uploadStatus === "uploading"}
                    />
                    <label htmlFor="overwrite" style={{ fontSize: 14, color: "#111827", fontWeight: 600, cursor: "pointer" }}>
                        Overwrite existing {quantification_type} quantification data
                    </label>
                </div>
            )}

            {/* Error message */}
            {errorMessage && (
                <div
                    style={{
                        padding: 12,
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        borderRadius: 8,
                        color: "#dc2626",
                        fontSize: 13,
                        textAlign: "center",
                    }}
                >
                    {errorMessage}
                </div>
            )}

            {/* Upload controls */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                {uploadStatus === "uploading" && (
                    <button
                        onClick={pauseUpload}
                        style={{
                            padding: "10px 20px",
                            background: "#fbbf24",
                            color: "#000",
                            border: "none",
                            borderRadius: 6,
                            fontWeight: 500,
                            fontSize: 14,
                            cursor: "pointer",
                        }}
                    >
                        Pause
                    </button>
                )}

                {(uploadStatus === "paused" || uploadStatus === "error") && (
                    <button
                        onClick={retryUpload}
                        style={{
                            padding: "10px 20px",
                            background: "#10b981",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            fontWeight: 500,
                            fontSize: 14,
                            cursor: "pointer",
                        }}
                    >
                        {uploadStatus === "error" ? "Retry Upload" : "Resume"}
                    </button>
                )}

                {uploadStatus === "idle" && (
                    <button
                        onClick={uploadFile}
                        disabled={!canUpload}
                        style={{
                            padding: "10px 24px",
                            background: canUpload ? HIGHLIGHT_COLOR : "#d1d5db",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            fontWeight: 600,
                            fontSize: 15,
                            cursor: canUpload ? "pointer" : "not-allowed",
                            transition: "background 0.2s",
                        }}
                    >
                        Start Upload
                    </button>
                )}

                {(uploadStatus === "uploading" || uploadStatus === "paused") && (
                    <button
                        onClick={cancelUpload}
                        style={{
                            padding: "10px 20px",
                            background: "#ef4444",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            fontWeight: 500,
                            fontSize: 14,
                            cursor: "pointer",
                        }}
                    >
                        Cancel
                    </button>
                )}
            </div>

            {/* Progress display */}
            {(uploadStatus === "uploading" || uploadStatus === "paused" || uploadStatus === "completed" || uploadStatus === "error") && (
                <div
                    style={{
                        width: "100%",
                        padding: 12,
                        background: "#f9fafb",
                        borderRadius: 8,
                    }}
                >
                    <div
                        style={{
                            marginBottom: 8,
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 12,
                            color: "#6b7280",
                        }}
                    >
                        <span>Progress</span>
                        <span>{progress}%</span>
                    </div>
                    <div
                        style={{
                            background: "#e5e7eb",
                            height: 20,
                            borderRadius: 10,
                            overflow: "hidden",
                            marginBottom: 8,
                        }}
                    >
                        <div
                            style={{
                                background:
                                    uploadStatus === "uploading"
                                        ? HIGHLIGHT_COLOR
                                        : uploadStatus === "paused"
                                        ? "#fbbf24"
                                        : uploadStatus === "completed"
                                        ? "#10b981"
                                        : "#6b7280",
                                height: "100%",
                                width: `${progress}%`,
                                borderRadius: 10,
                                transition: "width 0.3s ease",
                            }}
                        />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
                        <div>
                            <strong>Status:</strong> {uploadStatus.toUpperCase()}
                        </div>
                        <div>
                            <strong>Chunks:</strong> {uploadedChunks}/{totalChunks || "?"}
                        </div>
                        {eta !== null && (
                            <div>
                                <strong>ETA:</strong> {formatTime(eta)}
                            </div>
                        )}
                        {uploadSpeed !== null && (
                            <div>
                                <strong>Speed:</strong> {uploadSpeed.toFixed(2)} chunks/sec
                            </div>
                        )}
                    </div>

                    {failedChunks.length > 0 && (
                        <div
                            style={{
                                marginTop: 8,
                                padding: 8,
                                background: "#fef2f2",
                                borderRadius: 4,
                                fontSize: 12,
                                color: "#dc2626",
                                textAlign: "center",
                            }}
                        >
                            {failedChunks.length} chunks failed. Check connection and retry.
                        </div>
                    )}
                </div>
            )}

            {/* Completion indicator */}
            {uploadStatus === "completed" && (
                <div
                    style={{
                        padding: 12,
                        background: "#d1fae5",
                        border: "1px solid #a7f3d0",
                        borderRadius: 8,
                        textAlign: "center",
                        fontSize: 14,
                        color: "#065f46",
                    }}
                >
                    {isUpdatingStats ? "Updating statistics..." : "\u2713 Upload completed successfully!"}
                    {isUpdatingStatsSuccess ? " - Statistics updated!" : null}
                </div>
            )}
        </div>
    );
}

/**
 * Backwards-compatible wrappers
 */
export function ProteinQuantificationUploader({ submission_tag }) {
    return <QuantificationUploader submission_tag={submission_tag} quantification_type="protein" />;
}

export function PrecursorQuantificationUploader({ submission_tag }) {
    return <QuantificationUploader submission_tag={submission_tag} quantification_type="precursor" />;
}
