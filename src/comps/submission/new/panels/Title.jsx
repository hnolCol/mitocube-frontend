import _ from "lodash"
import TextInput from "../../../core/input/Text"

export function TitlePanel({submission, setSubmission, setComponentKey}) {

    const handleTitleChange = (key, title) => {
        setSubmission(prevValues => {return {...prevValues,title}})
    }

    return <div>
                <h3>Project Title</h3>
                <TextInput
                    placeholder="Set the title of your project.."
                    hint=""
                    value={_.isString(submission["title"]) ? submission["title"] : ""}
                    callbackKey="title"
                    onChange={handleTitleChange} />
            </div>
}