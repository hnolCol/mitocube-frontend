
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
            {metatextIsLoading ? <p>....</p> : null}
            {_.isObject(metatext) ? metatext.titles.map((metatextTitle, index) => {
                    const metatextTag = metatext.tags[metatextTitle]
                    return<TextFieldInput
                        key = {`${ metatextTag}-${index}`}
                        value={_.isString(metatextValues[ metatextTag])?metatextValues[metatextTag]:""}
                        placeholder={metatext.placeholders[ metatextTag]}
                        minLength={metatext["min_text_length"][ metatextTag]}
                        isRequired={metatext["required"][ metatextTag]}
                        hint={metatextTitle}
                        callbackKey={metatextTag}
                        onChange={onMetaTextChange} />}
                    ) : null}
            </div>
        
    )
}


export default MetaText