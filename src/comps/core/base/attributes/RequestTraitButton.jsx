import { useState } from "react"
import PropTypes from "prop-types"
import _ from "lodash"
import { Button, Tooltip } from "@blueprintjs/core"
import { RequestTraitDialog } from "./RequestTraitDialog"

const CURATOR_ROLE = 2

RequestTraitButton.propTypes = {
    userRole: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    attribute_tag: PropTypes.string,
    onRequested: PropTypes.func
}

export function RequestTraitButton({ userRole, attribute_tag, onRequested }) {
    const [isOpen, setIsOpen] = useState(false)
    const isCurator = _.isFinite(_.toNumber(userRole)) && _.toNumber(userRole) >= CURATOR_ROLE

    if (isCurator) return null

    return (
        <>
            <Tooltip content="Request a new trait to be added by curators and admins">
                <Button
                    icon="add"
                    text="Request Trait"
                    onClick={() => setIsOpen(true)}
                />
            </Tooltip>
            <RequestTraitDialog
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                userRole={userRole}
                attribute_tag={attribute_tag}
            />
        </>
    )
}