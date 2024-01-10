/**
 * @function
 * @description Splits an string into equal parts of n
 * @params {string} string - The string to split.
 * @params {int} n - The number of characters in a block.
 * @return {Array.<string>}     The split array as elements in an array.
 */
export function splitStringByNCharacters(string, n = 10) {
    var re = new RegExp(".{1,n}".replace("n", n),"g")

    return string.replaceAll("\n","").match(re)
}

/**
 * Returns the text string in title format (Title). 
 * Note that it does not check for spaces and just transformes everyhting after the first character to lower case.
 * @param   {string}    text   - The text to transform.
 * @return  {string}     The text in Title format.  
 */
export function titleFormat(text = "title") {
    return text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
}



