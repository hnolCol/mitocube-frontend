import _ from "lodash"
import { Callout, Code, Collapse, H5, Icon, Tag } from "@blueprintjs/core"
import { useState } from "react"

const ROLE_FALLBACK_NAMES = {
    0: "Guest",
    1: "Standard User",
    2: "Group Curator",
    3: "Curator",
    4: "Admin"
}

const ROLE_RIGHTS = {
    0: {
        description: "Not logged in. Can only access public pages of the platform.",
        rights: [
            "View public pages (impressum, contact, news)"
        ]
    },
    1: {
        description: "Regular user of the platform.",
        rights: [
            "Create and edit own submissions",
            "Upload data to own submissions and request collaborations",
            "Create attributes, traits and genotypes (new entries are reviewed by curators)",
            "Request deposition of published submissions",
            "Use the analysis tools for accessible submissions"
        ]
    },
    2: {
        description: "Curator of one or more research groups. Has extended rights within the scope of the own research groups and their collaborations.",
        rights: [
            "See all submissions of the own research groups, including collaborations and consortium shares",
            "Edit title, research aim and metatexts of submissions within the own scope",
            "Upload data and change submission states within the own scope",
            "Create and edit attributes, genotypes, annotations and proteomes",
            "Delete attributes, genotypes, annotations and proteomes",
            "Approve collaboration and consortium share requests of the own research groups",
            "Create users for the own research groups (cannot assign roles above group curator)"
        ]
    },
    3: {
        description: "Global curator. Has extended rights across all submissions and research groups.",
        rights: [
            "See all submissions on the platform",
            "Edit title, research aim and metatexts of all submissions",
            "Upload data and change submission states of all submissions",
            "Create, edit and delete attributes, genotypes, annotations and proteomes",
            "Approve collaboration and consortium share requests of all research groups",
            "Request and complete depositions to PRIDE",
            "Create users for all research groups (cannot assign admin role)",
            "Access the year report",
            "Exclude samples from statistical analysis"
        ]
    },
    4: {
        description: "Administrator. Full access to all platform functions.",
        rights: [
            "Everything a curator can do",
            "Create and delete research groups and consortiums",
            "Change user roles, block and delete users",
            "Manage instruments, plates, protocols, spare parts and procedures",
            "Manage platform content (news, policy, impressum)",
            "Access and manage admin functions"
        ]
    }
}

const prettyRoleName = (name) =>
    _.chain(_.words(name))
        .map(_.capitalize)
        .join(" ")
        .value()

/**
 * @description Overview of the platform user roles and the rights connected to
 * them. The role names and tags are fetched from the backend; the rights
 * description mirrors the role permissions enforced by the backend. The role of
 * the current user is highlighted.
 * @param {Object} props
 * @param {Object} props.userRoles - Roles object from the backend
 * (`{roles: {role_tag: role_name}}`), as returned by the user roles endpoint.
 * @param {Number|String} props.currentRole - Role tag of the current user.
 * @returns {JSX.Element} The role rights overview.
 */
export function RoleRights({ userRoles, currentRole }) {

    const [expandedRole, setExpandedRole] = useState(_.toNumber(currentRole))
    const backendRoles = _.mapKeys(_.get(userRoles, "roles", {}), (name, tag) => _.toNumber(tag))
    const roleTags = _.union(_.keys(ROLE_FALLBACK_NAMES), _.keys(backendRoles))
    const roles = _.sortBy(roleTags, (tag) => _.toNumber(tag)).map((role_tag) => ({
        tag: _.toNumber(role_tag),
        name: prettyRoleName(backendRoles[_.toNumber(role_tag)] || ROLE_FALLBACK_NAMES[_.toNumber(role_tag)])
    }))

    return (
        <div className="flex flex-column" style={{ gap: "0.5rem" }}>
            <p>
                The platform distinguishes the following user roles. The rights
                listed per role are enforced by the backend. Your own role is
                highlighted.
            </p>
            {roles.map((role) => {
                const roleRights = ROLE_RIGHTS[role.tag]
                if (!roleRights) return null
                const isExpanded = expandedRole === role.tag
                const isCurrentRole = _.toNumber(currentRole) === role.tag
                return (
                    <div key={role.tag} className="padding--little" style={{ border: "1px solid #e0e0e0", borderRadius: "3px" }}>
                        <div
                            className="flex center-items"
                            style={{ gap: "0.5rem", cursor: "pointer" }}
                            onClick={() => setExpandedRole(isExpanded ? null : role.tag)}
                        >
                            <Icon icon={isExpanded ? "chevron-down" : "chevron-right"} />
                            <H5 style={{ margin: 0 }}>{role.name}</H5>
                            <Code>{role.tag}</Code>
                            {isCurrentRole ? <Tag intent="success" minimal={true}>your role</Tag> : null}
                        </div>
                        <Collapse isOpen={isExpanded}>
                            <div className="padding--little">
                                <p>{roleRights.description}</p>
                                <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                                    {roleRights.rights.map((right, index) => (
                                        <li key={index}>{right}</li>
                                    ))}
                                </ul>
                            </div>
                        </Collapse>
                    </div>
                )
            })}
            <Callout intent="primary" title="Role changes">
                User roles are assigned by curators and admins. If you need
                extended rights, for example for your research group, please
                contact the platform administrators.
            </Callout>
        </div>
    )
}
