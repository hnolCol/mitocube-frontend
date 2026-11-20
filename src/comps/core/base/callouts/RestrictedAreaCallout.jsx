import { Callout } from "@blueprintjs/core"

export function RestrictedAreaCallout({ nounPlural, operations }) {
    return (
        <Callout className="margin-bottom--medium" intent="warning" icon="warning-sign">
            {`Restricted area : ${nounPlural} management is reserved for curators and admins. You can view the ${nounPlural}, but ${operations} is disabled for your account.`}
        </Callout>
    )
}