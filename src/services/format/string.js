export function splitStringByNCharacters(string, n = 10) {
    var re = new RegExp(".{1,n}".replace("n", n),"g")

    return string.replaceAll("\n","").match(re)
}