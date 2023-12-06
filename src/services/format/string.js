export function splitStringByNCharacters(string, n = 10) {
    var re = new RegExp(".{1,n}".replace("n", n),"g")

    return string.replaceAll("\n","").match(re)
}


export function titleFormat(text = "asda4") {
    return text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
}