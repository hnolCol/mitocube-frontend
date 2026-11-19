import { Callout } from "@blueprintjs/core"

/**
 * Warning callout shown on admin tabs when a standard user views data
 * whose management is reserved for curators and admins (role >= 2).
 *
 * @param {String} props.nounPlural - Plural name of the managed entities, e.g. "symptoms"
 * @param {String} props.operations - Actions that are disabled, e.g. "creating and editing symptoms"
 */
export function RestrictedAreaCallout({ nounPlural, operations }) {
    return (
        <Callout className="margin-bottom--medium" intent="warning" icon="warning-sign">
            {`Restricted area : ${nounPlural} management is reserved for curators and admins. You can view the ${nounPlural}, but ${operations} is disabled for your account.`}
        </Callout>
    )
}
