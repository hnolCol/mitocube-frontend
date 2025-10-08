import { OptionButton } from "../../core/base/buttons/OptionButton";
import hooks from "@mitocube/api-hooks"
import _ from "lodash"

export function UserRoleSelection({ user, selectedRole, onRoleChange }) {

   const { data: userRoles } = hooks.users.useGetUserRoles();
    return (
        <div>
            {_.isObject(userRoles) ? _.keys(userRoles.roles).map(role_tag => {
                return <OptionButton key={role_tag} children={<span>{userRoles.roles[role_tag]}</span>} isSelected={_.toNumber(role_tag) === selectedRole} onClick={() => onRoleChange(role_tag)} />
            }) : null}
        </div>
    );
}