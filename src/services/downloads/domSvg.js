import _ from "lodash";

/**
 * Combines all SVG elements rendered inside a DOM container into a single
 * standalone SVG string, preserving their relative screen positions.
 *
 * @param {HTMLElement} container - DOM node containing the rendered svg elements.
 * @param {Object} props
 * @param {Number} props.padding - Whitespace around the combined canvas.
 * @returns {String|null} The combined SVG string, or null if no svg was found.
 */
export function buildCombinedSvgFromContainer(container, { padding = 10 } = {}) {
    if (!_.isObject(container) || !_.isFunction(container.querySelectorAll)) return null;
    const svgElements = Array.from(container.querySelectorAll("svg"));
    if (svgElements.length === 0) return null;

    const containerRect = container.getBoundingClientRect();
    const positioned = svgElements.map((svgElement) => {
        const rect = svgElement.getBoundingClientRect();
        return {
            svgElement,
            left: rect.left - containerRect.left,
            top: rect.top - containerRect.top,
            width: rect.width,
            height: rect.height
        };
    });

    const maxX = _.max(positioned.map(item => item.left + item.width)) || 0;
    const maxY = _.max(positioned.map(item => item.top + item.height)) || 0;
    const svgWidth = Math.ceil(maxX + padding);
    const svgHeight = Math.ceil(maxY + padding);

    const inner = positioned.map(({ svgElement, left, top }) => {
        const clone = svgElement.cloneNode(true);
        clone.removeAttribute("id");
        clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        return `<g transform="translate(${_.round(left, 2)}, ${_.round(top, 2)})">${clone.outerHTML}</g>`;
    }).join("\\n    ");

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">${inner}</svg>`;
}
