/**
 * Peptides Analysis Module
 * 
 * This module provides interactive visualization and analysis of peptide data
 * mapped to protein sequences.
 * 
 * @module peptides
 */

import DatasetPeptides from "./DatasetPeptides";

export default DatasetPeptides;

/**
 * Re-exports for direct imports
 */
export { default as SequenceViewer } from "./SequenceViewer";
export { default as PeptideIntensityPlot } from "./PeptideIntensityPlot";
export { default as PeptideCorrelationMatrix } from "./PeptideCorrelationMatrix";
export { default as PositionCorrelationProfile } from "./PositionCorrelationProfile";
export { default as PeptidesLoad } from "./PeptidesLoad";
export { default as DatasetPeptides } from "./DatasetPeptides";
export { ProteinSelector } from "./ProteinSelector";
