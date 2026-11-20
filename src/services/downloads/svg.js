export { downloadSVG } from "@mitocube/viz/src/export/svg";

/**
 * @description Download an SVG string as an .svg file.
 * @param {String} svgString - The SVG markup to download.
 * @param {String} fileName - The file name for the download.
 */
export function downloadSvgFromString(svgString, fileName = "download.svg") {
    const preface = '<?xml version="1.0" standalone="no"?>\r\n';
    const svgBlob = new Blob([preface, svgString], { type: "image/svg+xml" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = fileName.endsWith(".svg") ? fileName : fileName + ".svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
}
