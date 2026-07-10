

import {
    submissionAnalysisAPI,
    submissionTitleAPI,
    submissionCoreAPI,
    submissionMetatextAPI, submissionPermissionsAPI,
    submissionStateAPI,
    submissionCAAPI,
    submissionCommentAPI,
    submissionCountAPI,
    submissionQuantificationsAPI,
    submissionQueryAPI,
    submissionRankingAPI,
    submissionSamplesAPI,
    submissionUserAPI,
    submissionViewsAPI,
    submissionRunlistAPI
} from "./submission";
import { tokenAuthentication, userLogin, mfaAuthentication } from "./authentication";
import { newsAPI } from "./news";
import { usersViewsAPI, userActiveAPI, userCountAPI, userCoreAPI, userRolesAPI, queryUserByQueryAPI, userEditAPI } from "./users";
import { metatextAPI } from "./metatexts";
import { stateAPI } from "./states";
import { attributesModifyAPI, attributesQueryAPI, traitsModifyAPI, traitsQueryAPI } from "./attributes";
import { backendInfoAPI, statisticsInfoAPI, termsInfoAPI } from "./info";
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
import { instrumentsCoreAPI, instrumentsCountAPI, instrumentsPermissionsAPI } from "./instruments";
import { featuresCorelationsAPI, featuresDataAPI, featuresInfoAPI ,featuresPairwiseQuantAPI ,featuresProteinsQueryAPI ,featuresQuantificationsAPI , featuresRankingAPI , featuresSequenceAPI , featuresTagAPI, proteinFavoritesAPI } from "./features";
import { statsAPI } from "./stats";
import { cyperOpenAIAPI } from "./openai";
import { diseasesQueryAPI, diseasesClinVarAPI } from "./diseases";
import { phenotypeQueryAPI, phenotypeassociationQueryAPI } from "./phenotypes";
import { variantsQueryAPI } from "./variants";
import { crosslinksQueryAPI, externalresourceQueryAPI } from "./crosslinks";

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
    proteomes : {
        queryProteomes : proteomesQueryAPI,
        postProteome : proteomesPostAPI,
        countProteomes : proteomesCountAPI  
    },
    features : {
        correlations : featuresCorelationsAPI,
        data : featuresDataAPI,
        info : featuresInfoAPI,
        pairwiseQuant : featuresPairwiseQuantAPI,
        proteinsQuery: featuresProteinsQueryAPI,
        proteinsFavorite : proteinFavoritesAPI,
        quantifications : featuresQuantificationsAPI,
        ranking : featuresRankingAPI,
        sequence : featuresSequenceAPI,
        tag : featuresTagAPI
    },
    submissions: {
        core : submissionCoreAPI,
        title : submissionTitleAPI,
        analysis: submissionAnalysisAPI,
        metatexts: submissionMetatextAPI,
        permissions: submissionPermissionsAPI,
        states : submissionStateAPI,
        condition_applications : submissionCAAPI,
        comments : submissionCommentAPI,
        counts : submissionCountAPI,
        quantifications : submissionQuantificationsAPI,
        query : submissionQueryAPI,
        ranking : submissionRankingAPI,
        samples : submissionSamplesAPI,
        users : submissionUserAPI,
        views : submissionViewsAPI,
            runlist : submissionRunlistAPI
    },
    authentication: {
        login: userLogin,
        token: tokenAuthentication,
        mfa : mfaAuthentication
    },
    condition_applications: conditionApplicationAPI,
    news: newsAPI,
    users: {
        core : userCoreAPI,
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
    samples: {
        count: sampleCountAPI,
        core : sampleCoreAPI
    },
    info: { 
        backend : backendInfoAPI,
        statistics : statisticsInfoAPI,
        terms : termsInfoAPI
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
    },
    instruments : {
        core : instrumentsCoreAPI,
        count : instrumentsCountAPI,
        permissions : instrumentsPermissionsAPI
    },
    stats : {
        submissionDurations : statsAPI
    },
    openai : {
        cyper : cyperOpenAIAPI
    },
        
    researchgroups : researchGroupsQueryAPI,

    diseases : {
        query : diseasesQueryAPI,
        clinvar : diseasesClinVarAPI
    },
    phenotypes : {
        query : phenotypeQueryAPI,
        associations : phenotypeassociationQueryAPI
    },
    variants : {
        query : variantsQueryAPI
    },
    crosslinks : {
        crosslinks : crosslinksQueryAPI,
        externalresources : externalresourceQueryAPI
    }   
};