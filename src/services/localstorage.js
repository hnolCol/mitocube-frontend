
import _ from "lodash"

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

export function saveSubmission(submissionState) {
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

export function getSavedSubmission() {
    //return the saved submission.
    return JSON.parse(localStorage.getItem("mitocube-submission"))

}