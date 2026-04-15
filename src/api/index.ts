

import {
    submissionAnalysisAPI,
    submissionTitleAPI,
    submissionCoreAPI,
    submissionMetatextAPI, submissionPermissionsAPI,
    submissionStateAPI
} from "./submission";
import { tokenAuthentication, userLogin } from "./authentication";
import { newsAPI } from "./news";
import { usersViewsAPI } from "./users";
import { metatextAPI } from "./metatexts";
import { stateAPI } from "./states";
import { attributesModifyAPI, attributesQueryAPI, traitsModifyAPI, traitsQueryAPI } from "./attributes";
import { backendInfoAPI } from "./info";
import { conditionApplicationAPI } from "./condition_applications";
import genotypes from "@/types/genotypes";
import { genotypesQueryAPI, genotypesModifyAPI, genotypesCAQueryAPI } from "./genotypes";
import { sampleCoreAPI, sampleCountAPI } from "./samples";

export const api = {
    attributes : { 
        queryAttributes : attributesQueryAPI,
        modifyAttributes : attributesModifyAPI
    },
    traits : {
        queryTraits : traitsQueryAPI,
        modifyTraits : traitsModifyAPI
    },
    genotypes : {
        queryGenotypes : genotypesQueryAPI,
        modifyGenotypes : genotypesModifyAPI,
        queryConditionApplications : genotypesCAQueryAPI
    },
    submissions: {
        core : submissionCoreAPI,
        title : submissionTitleAPI,
        analysis: submissionAnalysisAPI,
        metatexts: submissionMetatextAPI,
        permissions: submissionPermissionsAPI,
        states : submissionStateAPI
    },
    authentication: {
        login: userLogin,
        token: tokenAuthentication
    },
    condition_applications: conditionApplicationAPI,
    news: newsAPI,
    users: {
        views : usersViewsAPI
    },
    metatexts: metatextAPI,
    states: stateAPI,
    samples: {
        count: sampleCountAPI,
        core : sampleCoreAPI
    },
    info: { 
        backend : backendInfoAPI
    }
};