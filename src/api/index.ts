

import {
    submissionAnalysisAPI,
    submissionTitleAPI,
    submissionCoreAPI,
    submissionMetatextAPI, submissionPermissionsAPI
} from "./submission";
import { tokenAuthentication, userLogin } from "./authentication";
import { newsAPI } from "./news";
import { usersViewsAPI } from "./users";
import { metatextAPI } from "./metatexts";
import { stateAPI } from "./states";
import { attributesModifyAPI, attributesQueryAPI, traitsModifyAPI, traitsQueryAPI } from "./attributes";

export const api = {
    attributes : { 
        queryAttributes : attributesQueryAPI,
        modifyAttributes : attributesModifyAPI
    },
    traits : {
        queryTraits : traitsQueryAPI,
        modifyTraits : traitsModifyAPI
    },
    submissions: {
        core : submissionCoreAPI,
        title : submissionTitleAPI,
        analysis: submissionAnalysisAPI,
        metatexts: submissionMetatextAPI,
        permissions : submissionPermissionsAPI
    },
    authentication: {
        login: userLogin,
        token: tokenAuthentication
    },
    news: newsAPI,
    users: {
        views : usersViewsAPI
    },
    metatexts: metatextAPI,
    states : stateAPI
};