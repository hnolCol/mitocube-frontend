import { useMemo } from "react"
import { useGetSubmissions } from "../../../hooks/queries/submission.hooks"
import _ from "lodash"
import LineChart from "../../core/charts/linechart"
import { getAndTransformDatesFromArrayOfObjectsByKey } from "../../../services/arrays/transforms"
import APIError from "../../core/error/APIerror"

function combineMultipleParamFilesFromSubmissions(submissions, dateHeader = "Creation Date") {
    if (_.isArray(submissions)) {

        const paramFiles = _.map(submissions, submission => submission.paramsFile)
        const paramFilesWithDate = getAndTransformDatesFromArrayOfObjectsByKey({
            data: paramFiles,
            keyName: dateHeader,
            dateFormat: "YYYYMMDD"
        })

        return paramFilesWithDate 

        // console.log(paramFilesWithDate)

        // const uniqueParamFileHeader = _.uniq(_.flatten(_.map(paramFiles, paramsFile => {
        //     return Object.keys(paramsFile)
        // })))

        

        // const paramFilesValues = _.map(uniqueParamFileHeader, paramFileHeader => {
        //     return ([paramFileHeader, _.map(submissions, submission => {
        //         var value = submission.paramsFile[paramFileHeader]
        //         return { dataID: submission.dataID, value, isNumeric : _.isNumber(value )}
        //     })])
        // })
       
        // var combinedParamFiles = Object.fromEntries(paramFilesValues)
        // const transfomredStringToDate = getAndTransformDatesFromArrayOfObjectsByKey({
        //     data: combinedParamFiles[dateHeader],
        //     keyName: "value",
        //     dateFormat: "YYYYMMDD"
        // })
        // combinedParamFiles["asDate"] = _.map(transfomredStringToDate, stringToDate => {return { dataID : stringToDate.dataID, value : stringToDate.asDate}})
        
        // return {combinedParamFiles : combinedParamFiles}
    }
}


function SubmissionStatistics({ }) {
    //fetch data from API
    const { isSuccess, isLoading : submissionIDLoading, isFetching : submissionIDFetching, isError : submissionIsError, error : submissionAPIError, data } = useGetSubmissions()
    const paramFilesWithDate = useMemo(() => { return isSuccess && _.isObject(data) && _.has(data, "submissions") ? combineMultipleParamFilesFromSubmissions(data.submissions) : {} }, [data])

    if (submissionIsError) return <APIError {...{error : submissionAPIError}} />
    if (submissionIDLoading || submissionIDFetching) return <div>Loading...</div>

    return (
        <div>
            {_.isArray(paramFilesWithDate) ?
                <LineChart data={paramFilesWithDate} xAxisIsTime={true} xaxisName="asDate" yaxisNames={["SampleNumber"]} tooltipCircleNames={["Creation Date","dataID","SampleNumber"]} /> : null}




        </div>
    )
}


export default SubmissionStatistics