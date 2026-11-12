import { useParams } from "react-router"
import { Metatexts } from "@/comps/core/metatext/SubmissionMetatext"

/**
 * @description Metatext tab of the submission analysis pages. Shows all metatexts
 * of the submission and allows adding, editing and deleting them (permission based).
 * @returns {JSX.Element} The metatext list with add button.
 */
export function SubmissionMetatextsPage() {
    const { tag } = useParams()
    return <div className="padding--medium">
        <Metatexts submission_tag={tag} fill={true} />
    </div>
}
