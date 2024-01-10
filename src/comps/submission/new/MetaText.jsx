
import PropTypes from "prop-types"
import { Header } from "../../core/base/Header"
import TextFieldInput from "../../core/input/TextArea"
import { useGetSubmissionMetatext } from "../../../hooks/queries/submission.hooks"
import _ from "lodash"
import Loading from "../../core/base/loading"

MetaText.propTypes = {
    onMetaTextChange: PropTypes.func.isRequired,
    metatextValues: PropTypes.object}


function MetaText({onMetaTextChange, metatextValues, allowTextForState = 0}){
    const {data : metatext, isLoading : metatextIsLoading} = useGetSubmissionMetatext()
    
    return (
        <div>
            {metatextIsLoading ? <Loading /> : null}
            {_.isObject(metatext) ? metatext.titles.map((metatextTitle, index) => {
                const metatextTag = metatext.tags[metatextTitle]
                if (_.has(metatext,"allowed_for_state") && _.has(metatext.allowed_for_state,metatextTag) && metatext.allowed_for_state[metatextTag] !== allowTextForState) return null 
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