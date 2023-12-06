
import _ from "lodash"


export const storeTokenInLocalStorage = (tokenString) => {
    localStorage.setItem("mitocube-token",tokenString)
}

export const checkForTokenInLocalStorage = () => {
    //checks if there is a mitocube-token in the local storage
    const tokenString = localStorage.getItem("mitocube-token")
    return { tokenFound: _.isString(tokenString), tokenString: tokenString }
}

export const removeTokenFromLocalStorage = () => {
    // token removed from local storage.
    if (localStorage.getItem("mitocube-token") !== null){
        localStorage.removeItem("mitocube-token")
    }
}

export function saveSubmissionInLocalStorage(submissionState) {
    // save a submission state to local storage 
    if (submissionState===null) {
        localStorage.removeItem("mitocube-submission")
    }
    else 
    {
        const overwritten = localStorage.getItem("mitocube-submission") !== null 
        localStorage.setItem("mitocube-submission",JSON.stringify(submissionState))
       
        return overwritten?"Saved. A previous submission was overwritten":"Submission saved in local storage."
    }
}

export function loadSavedSubmissionFromLocalStorage() {
    //return the saved submission.
    const submission = localStorage.getItem("mitocube-submission")
    if (submission !== null && _.isString(submission))
        return JSON.parse(localStorage.getItem("mitocube-submission"))

}


export const removeSubmissionFromLocalStorage = () => {
    // submission removed from local storage.
    if (localStorage.getItem("mitocube-submission") !== null){
        localStorage.removeItem("mitocube-submission")
    }
}