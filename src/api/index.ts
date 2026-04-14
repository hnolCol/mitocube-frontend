

import { submissionAnalysisAPI } from "./submission";
import { tokenAuthentication, userLogin } from "./authentication";
import { newsAPI } from "./news";

export const api = {
    submission: {
        analysis: submissionAnalysisAPI
    },
    authentication: {
        login: userLogin,
        token: tokenAuthentication
    },
    news: newsAPI
};