import _ from "lodash";

/**
 * Utilities to work with precursor data.
 *
 * A precursor tag is the peptide sequence followed by the charge state
 * (e.g. "PEPTIDEK.2"). Precursor abundance rows come from the API as
 * [{ precursor_tag, sample_tag, submission_tag, value }].
 */

/**
 * Maps a list of precursor abundance rows to a per-precursor intensity object:
 * { precursor_tag: { tag, sequence, intensities: { sample_tag: value } } }
 * Rows not belonging to the given submission are ignored.
 */
export function mapAbundanceRowsToIntensities(rows, submission_tag) {
    const intensitiesByTag = {};
    if (!_.isArray(rows)) return intensitiesByTag;
    rows.forEach(row => {
        if (!_.isString(row?.precursor_tag) || !_.isString(row?.sample_tag)) return;
        if (_.isString(submission_tag) && row.submission_tag !== submission_tag) return;
        if (!intensitiesByTag[row.precursor_tag]) {
            intensitiesByTag[row.precursor_tag] = {
                tag: row.precursor_tag,
                sequence: row.precursor_tag.split(".")[0],
                intensities: {}
            };
        }
        intensitiesByTag[row.precursor_tag].intensities[row.sample_tag] = row.value;
    });
    return intensitiesByTag;
}

/**
 * Computes a Pearson correlation matrix for the given precursors from
 * per-precursor intensity objects (see mapAbundanceRowsToIntensities).
 * Precursors with fewer than 2 shared samples per pair are excluded pairwise
 * (correlation set to null).
 *
 * @returns {{ precursor_tags: string[], correlation_matrix: number[][], samples: string[] } | null}
 */
export function computeCorrelationMatrix(precursor_tags, intensityData) {
    const validTags = precursor_tags.filter(tag => intensityData[tag] && intensityData[tag].intensities);
    if (validTags.length < 2) return null;

    const samples = _.uniq(
        validTags.flatMap(tag => Object.keys(intensityData[tag].intensities))
    ).sort();

    const vectors = validTags.map(tag => samples.map(s => intensityData[tag].intensities[s]));

    const correlation_matrix = vectors.map(vecA =>
        vectors.map(vecB => pearsonWithNulls(vecA, vecB))
    );

    return { precursor_tags: validTags, correlation_matrix, samples };
}

function pearsonWithNulls(a, b) {
    const pairs = [];
    for (let i = 0; i < a.length; i++) {
        if (_.isFinite(a[i]) && _.isFinite(b[i])) pairs.push([a[i], b[i]]);
    }
    if (pairs.length < 3) return null;
    const xs = pairs.map(p => p[0]);
    const ys = pairs.map(p => p[1]);
    const meanX = _.mean(xs);
    const meanY = _.mean(ys);
    let num = 0, dx = 0, dy = 0;
    pairs.forEach(([x, y]) => {
        num += (x - meanX) * (y - meanY);
        dx += (x - meanX) ** 2;
        dy += (y - meanY) ** 2;
    });
    const denom = Math.sqrt(dx * dy);
    return denom === 0 ? null : num / denom;
}

/**
 * Maps precursor tags to positions on a protein sequence.
 * Each precursor's sequence is searched in the protein sequence; all matches
 * are returned as { tag, sequence, charge, start, end } (1-indexed, inclusive).
 * Precursors whose sequence is not found in the protein are skipped.
 */
export function mapPrecursorsToSequence(precursors, sequence) {
    if (!_.isString(sequence) || !_.isArray(precursors)) return [];
    const mapped = [];
    precursors.forEach(precursor => {
        const precursorSequence = _.isString(precursor?.sequence) ? precursor.sequence : _.isString(precursor?.tag) ? precursor.tag.split(".")[0] : null;
        if (!precursorSequence) return;
        let startIndex = sequence.indexOf(precursorSequence);
        while (startIndex !== -1) {
            mapped.push({
                tag: precursor.tag,
                sequence: precursorSequence,
                charge: precursor.charge,
                start: startIndex + 1,
                end: startIndex + precursorSequence.length
            });
            startIndex = sequence.indexOf(precursorSequence, startIndex + 1);
        }
    });
    return mapped;
}
