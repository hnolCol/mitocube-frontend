

import {
    submissionAnalysisAPI,
    submissionTitleAPI,
    submissionCoreAPI,
    submissionMetatextAPI, submissionPermissionsAPI
} from "./submission";
import { tokenAuthentication, userLogin } from "./authentication";
import { newsAPI } from "./news";
import { usersViewsAPI, userActiveAPI, userCountAPI, userCoreAPI, userRolesAPI, queryUserByQueryAPI, userEditAPI } from "./users";
import { metatextAPI } from "./metatexts";
import { stateAPI } from "./states";
import { attributesModifyAPI, attributesQueryAPI, traitsModifyAPI, traitsQueryAPI } from "./attributes";
import { backendInfoAPI } from "./info";
import { conditionApplicationAPI } from "./condition_applications";
import genotypes from "@/types/genotypes";
import { genotypesQueryAPI, genotypesModifyAPI, genotypesCAQueryAPI } from "./genotypes";
import { proteomesQueryAPI, proteomesPostAPI, proteomesCountAPI } from "./proteomes";
import { annotationsModifyAPI, annotationsQueryAPI } from "./annotations";
import { symptomsModifyAPI, symptomsQueryAPI } from "./maintenance/symptoms";
import { sparepartsModifyAPI, sparepartsQueryAPI } from "./maintenance/spareparts";
import { proceduresModifyAPI, proceduresQueryAPI } from "./maintenance/procedures";
import { externalserviceModifyAPI, externalserviceQueryAPI } from "./maintenance/externalservice";
import { sampleCoreAPI, sampleCountAPI } from "./samples";
import { researchGroupsQueryAPI } from "./researchgroups";
import { maintenanceCoreAPI, maintenanceStatesAPI } from "./maintenance/maintenanceevent";


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
        queryGenotpes : genotypesQueryAPI,
        modifyGenotypes : genotypesModifyAPI,
        queryConditionApplications : genotypesCAQueryAPI
    },
    proteomes : {
        queryProteomes : proteomesQueryAPI,
        postProteome : proteomesPostAPI,
        countProteomes : proteomesCountAPI  
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
    condition_applications: conditionApplicationAPI,
    news: newsAPI,
    users: {
        views : usersViewsAPI,
        active : userActiveAPI,
        count : userCountAPI,
        modify : userCoreAPI,
        roles : userRolesAPI,
        queryByQuery : queryUserByQueryAPI,
        edit : userEditAPI

    },
    metatexts: metatextAPI,
    states: stateAPI,
    info: { 
        backend : backendInfoAPI
    },
    maintenance : {
        core : maintenanceCoreAPI,
        states : maintenanceStatesAPI,
        
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