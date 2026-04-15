

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
import { annotationsModifyAPI, annotationsQueryAPI } from "./annotations";
import { symptomsModifyAPI, symptomsQueryAPI } from "./maintenance/symptoms";
import { sparepartsModifyAPI, sparepartsQueryAPI } from "./maintenance/spareparts";
import { proceduresModifyAPI, proceduresQueryAPI } from "./maintenance/procedures";
import { externalserviceModifyAPI, externalserviceQueryAPI } from "./maintenance/externalservice";
import { sampleCoreAPI, sampleCountAPI } from "./samples";

export const api = {
    annotations : {
        queryAnnotations : annotationsQueryAPI,
        modifyAnnotations : annotationsModifyAPI
    },
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
    },
    maintenance : {
        symptoms : {
            querySymptoms : symptomsQueryAPI,
            modifySymptoms : symptomsModifyAPI
        },
        spareparts : {
            querySpareParts : sparepartsQueryAPI,
            modifySpareParts : sparepartsModifyAPI
        },
        procedures : {
            queryMaintenanceProcedures : proceduresQueryAPI,
            modifyMaintenanceProcedures : proceduresModifyAPI
        },
        externalservice : {
            queryExternalService : externalserviceQueryAPI,
            modifyExternalService : externalserviceModifyAPI
        }
    }
};