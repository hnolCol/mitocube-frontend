import { OptionButton } from "../../core/base/buttons/OptionButton";
import { api } from "@/api";
import _ from "lodash"

/**
 *
 * @param {Object} props
 * @param {String} props.selectedRole - selectedd role tag
 * @param {Function} props.onRoleChange - function that is called when the user selects a role. The new role tag is passed as an argument.
 * @param {Number} [props.maxRole] - Maximum selectable role tag. Roles above it are not rendered. If not set, all roles from the backend are shown.
 * @returns
 */
export function UserRoleSelection({ selectedRole, onRoleChange, maxRole }) {

   const { data: userRoles } = api.users.roles.useGetUserRoles();
    return (
        <div>
            {_.isObject(userRoles) ? _.keys(userRoles.roles).map(role_tag => {
                if (_.isFinite(_.toNumber(maxRole)) && _.toNumber(role_tag) > _.toNumber(maxRole)) return null
                return <OptionButton key={role_tag} children={<span>{userRoles.roles[role_tag]}</span>} isSelected={_.toNumber(role_tag) === selectedRole} onClick={() => onRoleChange(role_tag)} />
            }) : null}
        </div>
    );
}
