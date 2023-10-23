
import PropTypes from "prop-types"
import { Header } from "../../core/base/Header"
import TextFieldInput from "../../core/input/TextArea"
import { useGetSubmissionMetatext } from "../../../hooks/queries/submission.hooks"
import _ from "lodash"

MetaText.propTypes = {
    onMetaTextChange: PropTypes.func.isRequired,
    metatextValues: PropTypes.object,
    authenticationStatus : PropTypes.object.isRequired
}


function MetaText({authenticationStatus, onMetaTextChange, metatextValues, index = "3"}){
    const {data : metatext, isLoading : metatextIsLoading} = useGetSubmissionMetatext({ tokenString: authenticationStatus.token }, { staleTime : 1200000})
    return (

        <div className="bg--lightgrey padding--medium div--round intent-margin-top--little">
            <Header text={`${index}. Meta Text`} />
                {_.isObject(metatext) ? metatext.titles.map((metatextTitle, index) => 
                    <TextFieldInput
                        key = {`${metatext.tags[metatextTitle]}-${index}`}
                        value={_.isString(metatextValues[metatext.tags[metatextTitle]])?metatextValues[metatext.tags[metatextTitle]]:""}
                        placeholder={metatext.placeholders[metatextTitle]}
                        minLength={metatext["min_text_length"][metatextTitle]}
                        isRequired={metatext["required"][metatextTitle]}
                        hint={metatextTitle}
                        callbackKey={metatext.tags[metatextTitle]}
                        onChange={onMetaTextChange} />
                    ) : null}
            </div>
        
    )
}


export default MetaText