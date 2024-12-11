export function indexStrings(data) {
    const result = {};

    // Iterate through each object in the array
    data.forEach((obj, arrIndex) => {
        // Iterate over each key-value pair in the object (assuming we care about 's1' here)
        for (const key in obj) {
            if (!result[key]) {
                result[key] = {};
            }

            // Iterate over each string in the array (obj[key] holds the array of strings)
            obj[key].forEach((str) => {
                // Initialize the key if it doesn't exist yet
                if (!result[key][str]) {
                    result[key][str] = [];
                }

                // Push the index of the current array to the corresponding string key
                result[key][str].push(arrIndex);
            });
        }
    });

    return result;
}