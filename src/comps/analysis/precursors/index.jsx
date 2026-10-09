/**
 * Precursors Analysis Module
 *
 * This module provides interactive visualization and analysis of precursor data
 * mapped to protein sequences.
 *
 * @module precursors
 */
import DatasetPrecursors from "./DatasetPrecursors";
export default DatasetPrecursors;

/**
 * Re-exports for direct imports
 */
export { default as SequenceViewer } from "./SequenceViewer";
export { default as PrecursorIntensityPlot } from "./PrecursorIntensityPlot";
export { default as PrecursorCorrelationMatrix } from "./PrecursorCorrelationMatrix";
export { default as PositionCorrelationProfile } from "./PositionCorrelationProfile";
export { default as PrecursorsLoad } from "./PrecursorsLoad";
export { default as DatasetPrecursors } from "./DatasetPrecursors";
export { ProteinSelector } from "./ProteinSelector";
