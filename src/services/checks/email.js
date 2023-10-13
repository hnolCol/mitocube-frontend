

export function checkBasicEmailPattern(emailString) {
    //very simple checking since the email needs to be verified anyways
    //by the user afterwards.
    const re = /^\S+@\S+\.\S+$/
    return re.test(emailString)
}