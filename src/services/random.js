
/**
 * @description Generates a pseudo random string and uses lower and upper characters and numbers.
 * @param {Number} n - Length of the random string
 * @returns {String} - The length of random string
 */
export function getRandomString(n = 5){
        let idString = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < n) {
            idString += characters.charAt(Math.floor(Math.random() * charactersLength));
          counter += 1;
        }
        return idString;
    }