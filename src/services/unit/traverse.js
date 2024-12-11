import _ from "lodash"

export function extractTagsFromFeature(obj) {
    // Recursive function to traverse and modify the object
    function traverseAndModify(obj) {
        // Ensure obj is an object and not an array or other type
        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }

        // If the current object has a 'feature' key with value 'feature'
        if (_.has(obj,"feature") && _.isArray(obj["feature"]["value"])) {
            // Return a new object with 'value' replaced by just 'tags'
            const feature = { ...obj["feature"] }
            feature["value"] = feature["value"].map(item => item.tag)
            //obj["feature"] = feature
            console.log({...obj, "feature" : feature})
            return {...obj, "feature" : feature}
        }

        // If the object doesn't match the criteria, recursively process all keys
        const modifiedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                modifiedObj[key] = traverseAndModify(obj[key]);
            }
        }
        console.log(modifiedObj)
        return modifiedObj; // Return the modified object
    }

    // Start the recursion from the top-level object
    return traverseAndModify(obj);
}