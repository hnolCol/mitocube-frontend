// src/services/downloads/md.js

/**
 * Download a markdown file using a Blob.
 * @param   {string|Blob}   content   - The markdown content (string or Blob).
 * @param   {string}        fileName  - The filename of the exported markdown.
 */
export function downloadMarkdownFile(content, fileName = "file.md") {
    // create file in browser
    const blob = content instanceof Blob ? content : new Blob([content], { type: "text/markdown;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    // create "a" HTML element with href to file
    const link = document.createElement("a");
    link.href = href;
    
    link.download = fileName.endsWith(".md") ? fileName : fileName + ".md";
    document.body.appendChild(link);
    link.click();
    // clean up "a" element & remove ObjectURL
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
    }