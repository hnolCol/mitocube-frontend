import _ from "lodash";

const RED_BLUE_SCALE_ANCHORS = ["#466688", "#ffffff", "#a82331"];
const NAN_FILL_COLOR = "#fafafa";
const STROKE_COLOR = "#000000";
const STROKE_WIDTH = 0.5;
const STD_CHART_COLOR_PALETTE = [
    "#466688",
    "#79c29e",
    "#e7ad00",
    "#b62444",
    "#c5959d",
    "#297d37",
    "#b2b2b2",
    "#d97a4b"
];

function hexToRgb(hex) {
    const value = _.toLower(hex).replace("#", "");
    return [
        parseInt(value.slice(0, 2), 16),
        parseInt(value.slice(2, 4), 16),
        parseInt(value.slice(4, 6), 16)
    ];
}

function rgbToHex([r, g, b]) {
    return "#" + [r, g, b]
        .map(channel => _.clamp(_.round(channel), 0, 255).toString(16).padStart(2, "0"))
        .join("");
}

/**
 * Piecewise linear color scale mirroring @mitocube/viz
 * scaleLinear({ domain: [min, 0, max], range: getRedBlueColorScale() }).
 */
function getValueColorScale([min, max]) {
    const segments = [
        { from: min, to: 0, fromColor: hexToRgb(RED_BLUE_SCALE_ANCHORS[0]), toColor: hexToRgb(RED_BLUE_SCALE_ANCHORS[1]) },
        { from: 0, to: max, fromColor: hexToRgb(RED_BLUE_SCALE_ANCHORS[1]), toColor: hexToRgb(RED_BLUE_SCALE_ANCHORS[2]) }
    ];
    return (value) => {
        if (!_.isFinite(value)) return RED_BLUE_SCALE_ANCHORS[1];
        const segment = value > 0 ? segments[1] : segments[0];
        const t = (value - segment.from) / (segment.to - segment.from);
        return rgbToHex(segment.fromColor.map((channel, idx) => channel + t * (segment.toColor[idx] - channel)));
    };
}

function getPaletteColorScale(values) {
    const colorMap = new Map(values.map((value, idx) => [String(value), STD_CHART_COLOR_PALETTE[idx % STD_CHART_COLOR_PALETTE.length]]));
    return (value) => {
        const color = colorMap.get(String(value));
        return color !== undefined ? color : NAN_FILL_COLOR;
    };
}

function escapeXml(textValue) {
    return _.toString(textValue)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function rect({ x, y, width, height, fill }) {
    return `<rect x="${_.round(x, 3)}" y="${_.round(y, 3)}" width="${width}" height="${height}" stroke="${STROKE_COLOR}" stroke-width="${STROKE_WIDTH}" fill="${fill}" />`;
}

function text({ x, y, content, fontSize, transform, textAnchor = "start", dominantBaseline = "middle", fill = "#000000" }) {
    return `<text x="${_.round(x, 3)}" y="${_.round(y, 3)}" font-family="Helvetica, Arial, sans-serif" font-size="${fontSize}" text-anchor="${textAnchor}" dominant-baseline="${dominantBaseline}" fill="${fill}"${transform ? ` transform="${transform}"` : ""}>${escapeXml(content)}</text>`;
}

function getFeatureLabel(row, proteinTagMap) {
    const tag = row.tag;
    if (!_.isString(tag)) return "";
    if (!(proteinTagMap instanceof Map)) return tag;
    return tag.includes(";")
        ? tag.split(";").map(t => (proteinTagMap.has(t) ? proteinTagMap.get(t).text : t)).join(";")
        : (proteinTagMap.has(tag) && _.isString(proteinTagMap.get(tag).text) && proteinTagMap.get(tag).text.length > 0)
            ? proteinTagMap.get(tag).text
            : tag;
}

/**
 * Replicates @mitocube/viz roundNumber({ number, limit }) used for legend labels.
 */
function roundNumberLabel({ number, limit }) {
    let diffTier = _.round(Math.log10(limit.max - limit.min)) * -1 + 2;
    const tier = Math.floor(Math.log10(Math.abs(number)));
    if (Math.abs(tier) >= 3) return number.toExponential(1);
    if (diffTier < 0) diffTier = 0;
    return number.toFixed(diffTier);
}

/**
 * Builds a standalone, complete heatmap SVG from the full heatmap data.
 * Geometry and color scales mirror @mitocube/viz charts/heatmap/Heatmap,
 * including rotated sample column names above the value columns.
 *
 * @param {Object} props
 * @param {Object[]} props.data - The full heatmap data rows.
 * @param {String[]} props.valueNames - The sample column names.
 * @param {String[]} props.colorNames - Extra color column names.
 * @param {Number[]} props.minMax - The z-score color scale domain.
 * @param {Number} props.binHeight - Bin size in pixels.
 * @param {Map} props.proteinTagMap - Map feature/protein tag to display text.
 * @returns {String} The SVG string.
 */
export function buildHeatmapSvg({
    data = [],
    valueNames = [],
    colorNames = [],
    minMax = [-6, 6],
    binHeight = 15,
    proteinTagMap
}) {
    const valueScale = getValueColorScale(minMax);
    const clusterValues = _.uniq(data.map(row => row.cluster).filter(value => value !== undefined));
    const clusterScale = getPaletteColorScale(clusterValues);
    const colorValues = colorNames.length > 0
        ? _.uniq(colorNames.flatMap(colorName => data.map(row => row[colorName]).filter(value => value !== undefined)))
        : [];
    const colorValuesExist = colorValues.length > 0;
    const extraColorScale = getPaletteColorScale(colorValues);

    const columnHeaderHeight = valueNames.length > 0 ? 160 : 0;
    const numberRows = data.length;
    const heatmapWidth = valueNames.length * binHeight + colorNames.length * binHeight + 300;
    const heatmapHeight = numberRows * binHeight;
    const svgWidth = Math.max(heatmapWidth, 400);
    const svgHeight = columnHeaderHeight + heatmapHeight;
    const xValuesEnd = valueNames.length * binHeight + 1;
    const marginBetweenValuesAndColors = colorValuesExist ? binHeight : 0;
    const marginBetweenValuesAndLabels = colorValuesExist
        ? colorNames.length * binHeight + marginBetweenValuesAndColors
        : marginBetweenValuesAndColors;

    const columnHeaderParts = [];
    const columnTextY = columnHeaderHeight - 10;
    if (clusterValues.length > 0) {
        columnHeaderParts.push(text({
            x: binHeight / 2,
            y: columnTextY,
            content: "Cluster",
            fontSize: 11,
            transform: `rotate(-60, ${binHeight / 2}, ${columnTextY})`
        }));
    }
    valueNames.forEach((valueName, valueIdx) => {
        const valueNameIdx = valueIdx;
        const x = (valueNameIdx + 1) * binHeight + binHeight / 4 + binHeight / 2;
        columnHeaderParts.push(text({
            x,
            y: columnTextY,
            content: valueName,
            fontSize: 11,
            transform: `rotate(-60, ${x}, ${columnTextY})`
        }));
    });
    colorNames.forEach((colorName, colorIdx) => {
        const x = xValuesEnd + marginBetweenValuesAndColors + colorIdx * binHeight + binHeight / 2;
        columnHeaderParts.push(text({
            x,
            y: columnTextY,
            content: colorName,
            fontSize: 11,
            transform: `rotate(-60, ${x}, ${columnTextY})`
        }));
    });

    const rowParts = data.map((row, rowIdx) => {
        const y = rowIdx * binHeight;
        const parts = [];
        if (clusterValues.length > 0) {
            parts.push(rect({ x: 0, y, width: binHeight, height: binHeight, fill: clusterScale(row.cluster) }));
        }
        valueNames.forEach((valueName, valueIdx) => {
            const value = row[valueName];
            parts.push(rect({
                x: (valueIdx + 1) * binHeight + binHeight / 4,
                y,
                width: binHeight,
                height: binHeight,
                fill: value === undefined ? NAN_FILL_COLOR : valueScale(value)
            }));
        });
        if (colorValuesExist) {
            colorNames.forEach((colorName, colorIdx) => {
                parts.push(rect({
                    x: xValuesEnd + marginBetweenValuesAndColors + colorIdx * binHeight,
                    y,
                    width: binHeight,
                    height: binHeight,
                    fill: extraColorScale(row[colorName])
                }));
            });
        }
        if (clusterValues.length > 0) {
            const labelX = xValuesEnd + binHeight / 2 + marginBetweenValuesAndLabels + 2 * binHeight + marginBetweenValuesAndLabels;
            parts.push(text({
                x: labelX + 5,
                y: y + binHeight / 2,
                content: getFeatureLabel(row, proteinTagMap),
                fontSize: binHeight * 0.8
            }));
        }
        return parts.join("");
    });

    return `<?xml version="1.0" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
    <g transform="translate(0, ${columnHeaderHeight})">
        <g transform="translate(0, ${-columnHeaderHeight})">
            ${columnHeaderParts.join("\n            ")}
        </g>
        ${rowParts.join("\n        ")}
    </g>
</svg>`;
}

/**
 * Builds a standalone legend SVG for the heatmap mirroring the on-screen
 * legend: the z-score gradient plus the cluster colors.
 *
 * @param {Object} props
 * @param {Object} props.heatmapData - The full heatmap data object.
 * @param {Number[]} props.minMax - The z-score color scale domain.
 * @param {Number} props.steps - Number of gradient steps.
 * @returns {String} The SVG string.
 */
export function buildHeatmapLegendSvg({ heatmapData, minMax = [-6, 6], steps = 7 }) {
    const valueScale = getValueColorScale(minMax);
    const elementSize = 20;
    const gradientValues = Array.from(
        { length: steps },
        (_, idx) => minMax[0] + idx * (minMax[1] - minMax[0]) / (steps - 1)
    );

    const parts = [];
    parts.push(text({ x: 0, y: 12, content: "Z-Scores", fontSize: 16 }));
    parts.push(...gradientValues.map((value, idx) => rect({
        x: idx * elementSize,
        y: 24,
        width: elementSize,
        height: elementSize,
        fill: valueScale(value)
    })));
    const labelValues = [minMax[0], (minMax[0] + minMax[1]) / 2, minMax[1]];
    const labelPositions = [0, (steps - 1) * elementSize / 2, (steps - 1) * elementSize];
    const labelAnchors = ["start", "middle", "end"];
    labelValues.forEach((value, idx) => {
        parts.push(text({
            x: labelPositions[idx],
            y: 56,
            content: roundNumberLabel({ number: value, limit: { min: minMax[0], max: minMax[1] } }),
            fontSize: 12,
            textAnchor: labelAnchors[idx]
        }));
    });

    const clusterIndices = _.isObject(heatmapData) && _.isObject(heatmapData.cluster_indices)
        ? heatmapData.cluster_indices
        : undefined;
    let clusterCount = 0;
    if (clusterIndices) {
        const data = _.isArray(heatmapData.data) ? heatmapData.data : [];
        const clusterValues = _.uniq(data.map(row => row.cluster).filter(value => value !== undefined));
        const clusterScale = getPaletteColorScale(clusterValues);
        clusterCount = _.keys(clusterIndices).length;
        parts.push(text({ x: 0, y: 86, content: "Clusters", fontSize: 16 }));
        _.keys(clusterIndices).sort((a, b) => a - b).forEach((clusterIdx, idx) => {
            const y = 104 + idx * 26;
            parts.push(rect({ x: 0, y, width: elementSize, height: elementSize, fill: clusterScale(clusterIdx) }));
            parts.push(text({
                x: elementSize + 6,
                y: y + elementSize / 2,
                content: `Cluster ${clusterIdx} (${clusterIndices[clusterIdx].length} features)`,
                fontSize: 12
            }));
        });
    }

    const width = 280;
    const height = clusterCount > 0 ? 104 + (clusterCount + 1) * 26 : 68;
    return `<?xml version="1.0" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    ${parts.join("\n    ")}
</svg>`;
}
