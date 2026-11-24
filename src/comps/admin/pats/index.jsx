import PropTypes from "prop-types"
import _ from "lodash"
import moment from "moment"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Button, Callout, Checkbox, FormGroup, HTMLTable, InputGroup, Switch } from "@blueprintjs/core"
import { api } from "@/api"
import Loading from "@/comps/core/base/loading"
import { Header } from "@/comps/core/base/Header"

const PAT_SCOPES = [
    { value: "qc.upload", label: "QC run upload (qc.upload)" },
    { value: "submissions.read", label: "Read newly added submission tags, e.g. to create NAS folders (submissions.read)" },
    { value: "sample.measuring", label: "Mark a sample as being measured, optionally on instruments (sample.measuring)" }
]
const ADMIN_ROLE = 4

function formatDate(epochMillis) {
    if (!_.isNumber(epochMillis)) return "—"
    return moment(epochMillis).format("YYYY-MM-DD HH:mm")
}

function PATTokenReveal({ token }) {
    const [copied, setCopied] = useState(false)
    const handleCopy = () => {
        navigator.clipboard.writeText(token).then(() => setCopied(true))
    }
    return (
        <Callout intent="warning" title="Copy your personal access token now">
            <p>For security reasons the token is shown only once. Store it in the environment of your script (e.g. <code>MITOCUBE_PAT</code>).</p>
            <pre style={{ userSelect: "all" }}>{token}</pre>
            <Button small={true} text={copied ? "Copied" : "Copy token"} onClick={handleCopy} />
        </Callout>
    )
}

PATTokenReveal.propTypes = {
    token: PropTypes.string.isRequired
}

function CreatePATSection() {
    const queryClient = useQueryClient()
    const [name, setName] = useState("")
    const [scopes, setScopes] = useState(["qc.upload"])
    const [expiresInDays, setExpiresInDays] = useState(365)
    const [createdToken, setCreatedToken] = useState(null)
    const [errorMessage, setErrorMessage] = useState(null)
    const { mutate: createPAT, isPending } = api.authentication.pats.useCreatePAT()

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ["getPATs"] })

    const handleCreate = () => {
        setErrorMessage(null)
        setCreatedToken(null)
        if (_.isEmpty(_.trim(name))) {
            setErrorMessage("Please provide a name for the token.")
            return
        }
        createPAT({ patProps: { name: _.trim(name), scopes, expires_in_days: expiresInDays } }, {
            onSuccess: (data) => {
                setCreatedToken(data.token)
                setName("")
                invalidate()
            },
            onError: (err) => {
                const detail = err?.response?.data?.detail
                setErrorMessage(typeof detail === "string" ? detail : "Creating the token failed.")
            }
        })
    }

    return (
        <div className="margin--medium">
            <Header text="Create token" fontSize="1.1rem" />
            <FormGroup label="Name" labelFor="pat-name">
                <InputGroup id="pat-name" placeholder="e.g. qc-upload-lab-PC3"
                    value={name} onChange={(e) => setName(e.target.value)} disabled={isPending} />
            </FormGroup>
            <FormGroup label="Scopes">
                {PAT_SCOPES.map((scope) => (
                    <Checkbox key={scope.value} label={scope.label}
                        checked={scopes.includes(scope.value)}
                        onChange={() => setScopes((current) =>
                            current.includes(scope.value)
                                ? current.filter((s) => s !== scope.value)
                                : [...current, scope.value])} />
                ))}
            </FormGroup>
            <FormGroup label="Expires after (days)" labelFor="pat-expires">
                <InputGroup id="pat-expires" type="number" min={1} max={3650}
                    value={expiresInDays} onChange={(e) => setExpiresInDays(_.toInteger(e.target.value))} disabled={isPending} />
            </FormGroup>
            <Button text="Create token" intent="primary" small={true} onClick={handleCreate} loading={isPending} />
            {errorMessage ? <Callout intent="danger" className="margin-top--small">{errorMessage}</Callout> : null}
            {createdToken ? <div className="margin-top--small"><PATTokenReveal token={createdToken} /></div> : null}
        </div>
    )
}

function PATTable({ pats, onRevoke, revokePending }) {
    return (
        <HTMLTable bordered={true} striped={true} interactive={false} className="width--full">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Tag</th>
                    <th>Scopes</th>
                    <th>Created</th>
                    <th>Expires</th>
                    <th>Last used</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {pats.map((pat) => (
                    <tr key={pat.tag}>
                        <td>{pat.name}</td>
                        <td><code>{pat.tag}</code></td>
                        <td>{pat.scopes.join(", ")}</td>
                        <td>{formatDate(pat.created_at)}</td>
                        <td>{formatDate(pat.expires_at)}</td>
                        <td>{formatDate(pat.last_used_at)}</td>
                        <td>{pat.revoked ? "revoked" : "active"}</td>
                        <td>{pat.revoked ? null : (
                            <Button small={true} text="Revoke" intent="danger" minimal={true}
                                loading={revokePending} onClick={() => onRevoke(pat.tag)} />
                        )}</td>
                    </tr>
                ))}
            </tbody>
        </HTMLTable>
    )
}

PATTable.propTypes = {
    pats: PropTypes.arrayOf(PropTypes.object).isRequired,
    onRevoke: PropTypes.func.isRequired,
    revokePending: PropTypes.bool
}

function OwnPATsSection() {
    const queryClient = useQueryClient()
    const { data: pats, isLoading, isError, error } = api.authentication.pats.useGetPATs()
    const { mutate: revokePAT, isPending } = api.authentication.pats.useRevokePAT()

    const handleRevoke = (patTag) => {
        revokePAT({ patTag }, {
            onSuccess: () => queryClient.invalidateQueries({ queryKey: ["getPATs"] })
        })
    }

    return (
        <div className="margin--medium">
            <Header text="My tokens" fontSize="1.1rem" />
            {isLoading ? <Loading /> :
                isError ? <Callout intent="danger">Error loading tokens: {error?.message}</Callout> :
                    _.isEmpty(pats) ? <p>You have no personal access tokens yet.</p> :
                        <PATTable pats={pats} onRevoke={handleRevoke} revokePending={isPending} />}
        </div>
    )
}

function UserPATsAdminSection({ ownTag }) {
    const queryClient = useQueryClient()
    const [userTag, setUserTag] = useState("")
    const [blocked, setBlocked] = useState(false)
    const { data: userPats = [], isLoading } = api.authentication.pats.useGetUserPATs(
        { userTag: _.trim(userTag) }, { enabled: _.trim(userTag).length > 0 })
    const { data: ownPats = [] } = api.authentication.pats.useGetPATs()
    const { mutate: revokeAsAdmin, isPending: revokePending } = api.authentication.pats.useRevokePATAsAdmin()
    const { mutate: setCreationBlocked, isPending: blockPending } = api.authentication.pats.useSetPATCreationBlocked()

    const normalizedUserTag = _.trim(userTag)
    const isSelf = normalizedUserTag.length > 0 && normalizedUserTag === ownTag

    const handleRevoke = (patTag) => {
        revokeAsAdmin({ patTag }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["getUserPATs", normalizedUserTag] })
                queryClient.invalidateQueries({ queryKey: ["getPATs"] })
            }
        })
    }

    const handleBlockToggle = () => {
        const nextBlocked = !blocked
        setBlocked(nextBlocked)
        setCreationBlocked({ userTag: normalizedUserTag, blocked: nextBlocked })
    }

    return (
        <div className="margin--medium">
            <Header text="Administer tokens of a user" fontSize="1.1rem" />
            <FormGroup label="User tag" labelFor="pat-user-tag" helperText="Enter a user tag to list and manage their tokens.">
                <InputGroup id="pat-user-tag" placeholder="e.g. abcdefgh"
                    value={userTag} onChange={(e) => setUserTag(e.target.value)} />
            </FormGroup>
            {normalizedUserTag.length > 0 ?
                <div>
                    {blockPending ? null : (
                        <Switch checked={blocked} label="Block token creation for this user" onChange={handleBlockToggle} />
                    )}
                    {isLoading ? <Loading /> :
                        _.isEmpty(userPats) ? <p>This user has no personal access tokens.</p> :
                            <PATTable pats={userPats} onRevoke={handleRevoke} revokePending={revokePending} />}
                    {isSelf && !_.isEmpty(ownPats) ? <Callout intent="warning" className="margin-top--small">This is your own account — use "My tokens" above to manage them.</Callout> : null}
                </div> : null}
        </div>
    )
}

UserPATsAdminSection.propTypes = {
    ownTag: PropTypes.string
}

const CURATOR_ROLE = 3  // must match UserRolesEnum.CURATOR in the backend

/**
 * Admin view for personal access tokens (PATs) used by scripts, e.g.
 * automated QC run uploads. Curators and admins create, inspect and
 * revoke their own tokens; admins can additionally manage the tokens
 * of any user. Standard users and guests are rejected (the backend
 * enforces the same restriction).
 * @param {Object} props
 * @param {Object} props.authenticationStatus - Authentication status with role.
 * @param {Number} props.userRole - Role of the current user.
 */
export function PATsAdminView({ authenticationStatus, userRole }) {
    const isAdmin = _.get(authenticationStatus, "role", 0) >= ADMIN_ROLE
    const isCurator = _.isNumber(userRole) && userRole >= CURATOR_ROLE
    if (!isCurator) {
        return (
            <div className="margin--medium width--half-viewport">
                <Callout intent="warning" title="Not authorized">
                    Personal access tokens are restricted to curators and admins.
                </Callout>
            </div>
        )
    }
    return (
        <div className="margin--medium width--half-viewport">
            <Header text="Personal access tokens" fontSize="1.4rem" />
            <p>A personal access token allows a script to upload QC runs to MitoCube without an interactive login.
                Tokens are scoped (they can only upload QC runs), can be revoked at any time and are shown only once at creation.
                Store the token in the environment of your script and send it as a Bearer token.</p>
            <OwnPATsSection />
            <CreatePATSection />
            {isAdmin ? <UserPATsAdminSection ownTag={_.get(authenticationStatus, "tag", "")} /> : null}
        </div>
    )
}

PATsAdminView.propTypes = {
    authenticationStatus: PropTypes.object,
    userRole: PropTypes.number
}
