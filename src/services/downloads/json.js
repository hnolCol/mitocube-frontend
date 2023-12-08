


/**
 * Download a json file using a Blob.  Data must be stringiable. 
 * @param   {Object.<Array>}    data   - The data to stringify.
 * @param   {string}    fileName  - The filename of the exported jsonify data.
 */
export function downloadJSONFile(data, fileName = "file.json") {
   
    // create file in browser
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const href = URL.createObjectURL(blob);
  
    // create "a" HTLM element with href to file
    const link = document.createElement("a");
    link.href = href;

    link.download = fileName.endsWith(".json")?fileName : fileName + ".json";
    document.body.appendChild(link);
    link.click();
  
    // clean up "a" element & remove ObjectURL
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
}