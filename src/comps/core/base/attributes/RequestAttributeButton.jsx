import { useState } from "react"
import PropTypes from "prop-types"
import _ from "lodash"
import { Button, Tooltip } from "@blueprintjs/core"
import { RequestAttributeDialog } from "./RequestAttributeDialog"

const CURATOR_ROLE = 2

RequestAttributeButton.propTypes = {
    userRole: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    onRequested: PropTypes.func
}

/**
 * @description Button that opens a dialog for normal users to request a new attribute.
 * Only shown to non-curator/non-admin users.
 */
export function RequestAttributeButton({ userRole, onRequested }) {
    const [isOpen, setIsOpen] = useState(false)
    const isCurator = _.isFinite(_.toNumber(userRole)) && _.toNumber(userRole) >= CURATOR_ROLE

    if (isCurator) return null

    return (
        <>
            <Tooltip content="Request a new attribute to be added by curators and admins">
                <Button
                    icon="add"
                    text="Request Attribute"
                    onClick={() => setIsOpen(true)}
                />
            </Tooltip>
            <RequestAttributeDialog
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                userRole={userRole}
            />
        </>
    )
}