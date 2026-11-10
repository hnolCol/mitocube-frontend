import _ from "lodash";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useOnScreen } from "@/hooks/useOnScreen";
import useDebounce from "@/hooks/useDebounce";
import { getUserFullName } from "@/services/format/user";
import { api } from "@/api";
import { isHexColorLight } from "@/services/checks/color";
import { titleFormat } from "@/services/format/string";

/**
 * @description Colored pill showing a submission state name.
 * @param {Object} props
 * @param {Number} props.state_tag State tag
 * @returns {JSX.Element|null} The state pill.
 */
function StatePill({ state_tag }) {
    const { data: stateName } = api.states.useGetStateName({ tag: state_tag }, { enabled: _.isNumber(state_tag) });
    const { data: stateColor } = api.states.useGetStateColor({ tag: state_tag }, { enabled: _.isNumber(state_tag) });
    if (!_.isString(stateName) || !_.isString(stateColor)) return null;
    return (
        <span
            className="compact__state"
            style={{
                backgroundColor: stateColor,
                color: isHexColorLight(stateColor) ? "black" : "white",
            }}
        >
            {titleFormat(stateName)}
        </span>
    );
}

/**
 * @description Select option showing the state name, colored with the state color (CSS only).
 * @param {Object} props
 * @param {Number} props.state_tag State tag
 * @param {Boolean} [props.current] Whether this is the current state
 * @returns {JSX.Element} The option element.
 */
function StateOption({ state_tag, current = false }) {
    const { data: stateName } = api.states.useGetStateName({ tag: state_tag }, { enabled: _.isNumber(state_tag) });
    const { data: stateColor } = api.states.useGetStateColor({ tag: state_tag }, { enabled: _.isNumber(state_tag) });
    return (
        <option value={String(state_tag)} disabled={current} style={{ color: _.isString(stateColor) ? stateColor : undefined }}>
            {current ? "✔ " : ""}{_.isString(stateName) ? titleFormat(stateName) : state_tag}
        </option>
    );
}

/**
 * @description Row allowing a submission state change via a plain select element.
 * @param {Object} props
 * @param {String} props.submission_tag Submission tag
 * @returns {JSX.Element} The state change row.
 */
function SubmissionStateChanger({ submission_tag }) {
    const { data: state, refetch } = api.submissions.states.useGetSubmissionState({ tag: submission_tag }, { enabled: _.isString(submission_tag) });
    const { data: states } = api.submissions.states.useGetStates();
    const { data: permissions, isSuccess: isSuccessPermissions } = api.submissions.permissions.useGetSubmissionPermissionsByTag(
        { tag: submission_tag }, { enabled: _.isString(submission_tag), staleTime: 60000 }
    );
    const { mutate: updateState, isPending } = api.submissions.states.usePatchSubmissionState({
        onSuccess: () => refetch(),
    });

    const canChange = isSuccessPermissions && permissions?.state_change === true;

    return (
        <div className="compact__row">
            <span className="compact__label">State</span>
            <StatePill state_tag={state} />
            {canChange ? (
                <select
                    className="compact__select"
                    style={{ width: "auto", flex: 1 }}
                    value={_.isNumber(state) ? String(state) : ""}
                    disabled={isPending}
                    onChange={e => {
                        const newState = Number(e.target.value);
                        if (_.isNumber(newState)) updateState({ tag: submission_tag, state: newState });
                    }}
                >
                    {!_.isNumber(state) ? <option value="">Select state…</option> : null}
                    {_.isArray(states) ? states.map(s => (
                        <StateOption key={s} state_tag={s} current={s === state} />
                    )) : null}
                </select>
            ) : null}
        </div>
    );
}

/**
 * @description Protocol management for one submission: lists linked protocols with remove
 * buttons and a select to link additional protocols.
 * @param {Object} props
 * @param {String} props.submission_tag Submission tag
 * @returns {JSX.Element} The protocol section.
 */
function SubmissionProtocols({ submission_tag }) {
    const { data: linked, refetch } = api.submissions.protocols.useGetSubmissionProtocols({ tag: submission_tag }, { enabled: _.isString(submission_tag) });
    const { data: allProtocols } = api.protocols.query.useGetProtocolsByQuery({ search_string: null, limit: 500 }, { staleTime: 60000 });
    const { data: permissions, isSuccess: isSuccessPermissions } = api.submissions.permissions.useGetSubmissionPermissionsByTag(
        { tag: submission_tag }, { enabled: _.isString(submission_tag), staleTime: 60000 }
    );
    const { mutate: linkProtocol } = api.protocols.modify.useLinkProtocolToSubmission({ onSuccess: () => refetch() });
    const { mutate: unlinkProtocol } = api.protocols.modify.useUnlinkProtocolFromSubmission({ onSuccess: () => refetch() });

    const canEdit = isSuccessPermissions && permissions?.edit === true;
    const linkedTags = _.isArray(linked) ? linked : [];
    const options = _.isArray(allProtocols) ? allProtocols.filter(p => !linkedTags.includes(p)) : [];

    return (
        <div className="compact__section">
            <span className="compact__label">Protocols</span>
            <div className="compact__row">
                {linkedTags.length === 0 ? <span className="compact__hint">No protocols linked.</span> : null}
                {linkedTags.map(protocol_tag => (
                    <ProtocolChip
                        key={protocol_tag}
                        protocol_tag={protocol_tag}
                        removable={canEdit}
                        onRemove={() => unlinkProtocol({ submission_tag, protocol_tag })}
                    />
                ))}
            </div>
            {canEdit && options.length > 0 ? (
                <div className="compact__row">
                    <select
                        className="compact__select"
                        value=""
                        onChange={e => {
                            if (e.target.value) linkProtocol({ submission_tag, protocol_tag: e.target.value });
                        }}
                    >
                        <option value="">Link protocol…</option>
                        {options.map(protocol_tag => (
                            <ProtocolOption key={protocol_tag} protocol_tag={protocol_tag} />
                        ))}
                    </select>
                </div>
            ) : null}
        </div>
    );
}

/**
 * @description Protocol option whose label is resolved from the protocol tag.
 * @param {Object} props
 * @param {String} props.protocol_tag Protocol tag
 * @returns {JSX.Element} The option element.
 */
function ProtocolOption({ protocol_tag }) {
    const { data: protocol } = api.protocols.query.useGetProtocolByTag({ tag: protocol_tag }, { enabled: _.isString(protocol_tag) });
    return <option value={protocol_tag}>{protocol?.title || protocol_tag}</option>;
}

/**
 * @description Chip showing a linked protocol, optionally with a remove button.
 * @param {Object} props
 * @param {String} props.protocol_tag Protocol tag
 * @param {Boolean} props.removable Whether to show the remove button
 * @param {Function} props.onRemove Remove callback
 * @returns {JSX.Element} The protocol chip.
 */
function ProtocolChip({ protocol_tag, removable, onRemove }) {
    const { data: protocol } = api.protocols.query.useGetProtocolByTag({ tag: protocol_tag }, { enabled: _.isString(protocol_tag) });
    return (
        <span className="compact__chip">
            {protocol?.title || protocol_tag}
            {removable ? (
                <button className="compact__chip__remove" onClick={onRemove} title="Unlink protocol">×</button>
            ) : null}
        </span>
    );
}

/**
 * @description Metatext insertion and listing for one submission.
 * @param {Object} props
 * @param {String} props.submission_tag Submission tag
 * @returns {JSX.Element} The metatext section.
 */
function SubmissionMetatexts({ submission_tag }) {
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const { data: metatexts, refetch } = api.submissions.metatexts.useGetMetatexts({ tag: submission_tag }, { enabled: _.isString(submission_tag) });
    const { data: permissions, isSuccess: isSuccessPermissions } = api.submissions.permissions.useGetSubmissionPermissionsByTag(
        { tag: submission_tag }, { enabled: _.isString(submission_tag), staleTime: 60000 }
    );
    const { mutate: postMetatext, isPending } = api.submissions.metatexts.usePostMetatext({
        onSuccess: () => { setTitle(""); setText(""); refetch(); },
    });

    const canEdit = isSuccessPermissions && permissions?.edit === true;

    return (
        <div className="compact__section">
            <span className="compact__label">Metatexts</span>
            {_.isArray(metatexts) && metatexts.length > 0 ? (
                <div className="compact__row">
                    {metatexts.map(tag => <MetatextChip key={tag} tag={tag} />)}
                </div>
            ) : <div className="compact__hint">No metatexts yet.</div>}
            {canEdit ? (
                <div style={{ marginTop: "0.5rem" }}>
                    <input
                        className="compact__input"
                        placeholder="Title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                    <textarea
                        className="compact__textarea"
                        style={{ marginTop: "0.4rem" }}
                        placeholder="Metatext…"
                        value={text}
                        onChange={e => setText(e.target.value)}
                    />
                    <div className="compact__row">
                        <button
                            className="compact__button"
                            disabled={isPending || text.trim().length === 0}
                            onClick={() => postMetatext({ title, text, submission_tag })}
                        >
                            Add metatext
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

/**
 * @description Chip showing a metatext title.
 * @param {Object} props
 * @param {String} props.tag Metatext tag
 * @returns {JSX.Element} The metatext chip.
 */
function MetatextChip({ tag }) {
    const { data: metatext } = api.metatexts.useGetMetatext({ tag }, { enabled: _.isString(tag) });
    return <span className="compact__chip">{metatext?.title || tag}</span>;
}

/**
 * @description Chip showing a condition application label.
 * @param {Object} props
 * @param {String} props.ca_tag Condition application tag
 * @returns {JSX.Element} The CA chip.
 */
function ConditionApplicationChip({ ca_tag }) {
    const { data: text } = api.condition_applications.useGetConditionApplicationText({ tag: ca_tag }, { enabled: _.isString(ca_tag), staleTime: 300000 });
    return <span className="compact__chip">{_.isString(text) ? text : ca_tag}</span>;
}

/**
 * @description Condition application management for one submission: lists the currently
 * applied condition applications and allows adding new ones via a plain select. Adding
 * appends the CA trait to the submission trait tree and updates it via the CA update hook.
 * @param {Object} props
 * @param {String} props.submission_tag Submission tag
 * @returns {JSX.Element} The condition application section.
 */
function SubmissionConditionApplications({ submission_tag }) {
    const { data: ca_tags, refetch: refetchCATags } = api.submissions.condition_applications.useGetSubmissionConditionApplication(
        { tag: submission_tag, group_by_min_state: false, group_by_attribute: false }, { enabled: _.isString(submission_tag) }
    );
    const { data: ca_data, refetch: refetchCAData } = api.submissions.condition_applications.useGetSubmissionConditionApplicationData(
        { tag: submission_tag }, { enabled: _.isString(submission_tag) }
    );
    const { data: allCAs } = api.condition_applications.useGetConditionApplicationByQuery(
        { samples_only: true, sort_by_frequency: true, limit: 500 }, { staleTime: 300000 }
    );
    const { data: permissions, isSuccess: isSuccessPermissions } = api.submissions.permissions.useGetSubmissionPermissionsByTag(
        { tag: submission_tag }, { enabled: _.isString(submission_tag), staleTime: 60000 }
    );
    const { mutate: updateCA, isPending } = api.submissions.condition_applications.useUpdateSubmissionCA({
        onSuccess: () => { refetchCATags(); refetchCAData(); },
    });

    const canEdit = isSuccessPermissions && permissions?.edit === true;
    const currentTags = _.isArray(ca_tags) ? ca_tags : [];
    const options = _.isArray(allCAs) ? allCAs.filter(t => !currentTags.includes(t)) : [];

    /**
     * @description Strips a CA data tree node down to the fields the backend expects.
     * @param {Array} nodes Tree nodes
     * @returns {Array} Cleaned nodes.
     */
    const cleanForBackend = (nodes) => nodes.map(item => ({
        type: item.type,
        tag: item.tag,
        value: item.value ?? undefined,
        children: _.isArray(item.children) ? cleanForBackend(item.children) : [],
    }));

    /**
     * @description Adds a condition application to the submission by appending its trait
     * below its attribute node in the current trait tree, then updating the submission.
     * @param {String} ca_tag Condition application tag to add
     * @param {Object} caDetail CA detail with attribute_tag / trait_tag / value
     */
    const handleAdd = (ca_tag, caDetail) => {
        if (!_.isObject(caDetail) || !_.isString(caDetail.trait_tag)) return;
        const tree = cleanForBackend(_.isArray(ca_data) ? ca_data : []);
        const traitNode = { type: "trait", tag: caDetail.trait_tag, value: caDetail.value ?? undefined, children: [] };
        const attributeNode = _.isString(caDetail.attribute_tag)
            ? tree.find(n => n.type === "attribute" && n.tag === caDetail.attribute_tag)
            : undefined;
        if (attributeNode) {
            attributeNode.children = [...(attributeNode.children || []), traitNode];
        } else if (_.isString(caDetail.attribute_tag)) {
            tree.push({ type: "attribute", tag: caDetail.attribute_tag, children: [traitNode] });
        } else {
            tree.push(traitNode);
        }
        updateCA({ tag: submission_tag, selected_traits: tree });
    };

    return (
        <div className="compact__section">
            <span className="compact__label">Condition applications</span>
            <div className="compact__row">
                {currentTags.length === 0 ? <span className="compact__hint">No condition applications.</span> : null}
                {currentTags.map(ca_tag => <ConditionApplicationChip key={ca_tag} ca_tag={ca_tag} />)}
            </div>
            {canEdit && options.length > 0 ? (
                <AddConditionApplicationSelect
                    options={options}
                    disabled={isPending}
                    onAdd={handleAdd}
                />
            ) : null}
        </div>
    );
}

/**
 * @description Select to add a condition application. Resolves the CA detail (attribute /
 * trait) for the chosen tag before calling onAdd.
 * @param {Object} props
 * @param {Array} props.options Available CA tags
 * @param {Boolean} props.disabled Whether the select is disabled
 * @param {Function} props.onAdd Callback (ca_tag, caDetail)
 * @returns {JSX.Element} The select row.
 */
function AddConditionApplicationSelect({ options, disabled, onAdd }) {
    const [selected, setSelected] = useState("");
    const { data: caDetail } = api.condition_applications.useGetConditionApplication(
        { tag: selected }, { enabled: _.isString(selected) && selected.length > 0 }
    );

    useEffect(() => {
        if (!_.isString(selected) || selected.length === 0) return;
        const detail = _.isArray(caDetail) && caDetail.length > 0 ? caDetail[0] : undefined;
        if (_.isObject(detail)) {
            onAdd(selected, detail);
            setSelected("");
        }
    }, [selected, caDetail]);

    return (
        <div className="compact__row">
            <select
                className="compact__select"
                value={selected}
                disabled={disabled}
                onChange={e => setSelected(e.target.value)}
            >
                <option value="">Add condition application…</option>
                {options.map(ca_tag => <ConditionApplicationOption key={ca_tag} ca_tag={ca_tag} />)}
            </select>
        </div>
    );
}

/**
 * @description Option whose label is resolved from the CA tag.
 * @param {Object} props
 * @param {String} props.ca_tag Condition application tag
 * @returns {JSX.Element} The option element.
 */
function ConditionApplicationOption({ ca_tag }) {
    const { data: text } = api.condition_applications.useGetConditionApplicationText({ tag: ca_tag }, { enabled: _.isString(ca_tag), staleTime: 300000 });
    return <option value={ca_tag}>{_.isString(text) ? text : ca_tag}</option>;
}

/**
 * @description Read-only view of a submission's research aim (abstract), shown collapsed
 * (clamped preview) at the top of the compact submission card; expands on tap so long
 * aims don't occupy the whole screen on small devices.
 * @param {Object} props
 * @param {String} props.submission_tag Submission tag
 * @returns {JSX.Element} The collapsible research aim section.
 */
function SubmissionResearchAim({ submission_tag }) {
    const [expanded, setExpanded] = useState(false);
    const { data: researchAim, isLoading } = api.submissions.metatexts.useGetResearchAim(
        { tag: submission_tag }, { enabled: _.isString(submission_tag), staleTime: 300000 }
    );
    if (isLoading) return <div className="compact__hint">Loading research aim…</div>;
    if (!_.isString(researchAim) || researchAim.trim().length === 0) return null;
    return (
        <div className="compact__section" style={{ marginTop: 0, borderTop: "none", paddingTop: 0 }}>
            <button
                className="compact__button compact__button--ghost"
                style={{ padding: "0.3rem 0.6rem" }}
                onClick={() => setExpanded(v => !v)}
                aria-expanded={expanded}
            >
                {expanded ? "▾ Hide research aim" : "▸ Research aim"}
            </button>
            <p
                className={expanded ? undefined : "compact__aim--clamped"}
                style={{ margin: "0.3rem 0 0", fontSize: "0.88rem", whiteSpace: "pre-wrap", wordBreak: "break-word", textAlign: "justify" }}
            >
                {researchAim}
            </p>
        </div>
    );
}

/**
 * @description One submission card with state change, protocols, metatext and condition
 * application insertion. When highlighted, the card gets a colored border (e.g. when
 * deep-linked from an instrument for quick lab metadata entry).
 * @param {Object} props
 * @param {String} props.submission_tag Submission tag
 * @param {Boolean} [props.highlighted] Highlight the card
 * @returns {JSX.Element} The submission card.
 */
/**
 * @description Users (collaborators) of a submission shown as name chips.
 * @param {Object} props
 * @param {String} props.submission_tag Submission tag
 * @returns {JSX.Element} The users row.
 */
function SubmissionUsers({ submission_tag }) {
    const { data: user_tags } = api.submissions.users.useGetSubmissionUsers({ tag: submission_tag }, { enabled: _.isString(submission_tag), staleTime: 300000 });
    if (!_.isArray(user_tags) || user_tags.length === 0) return null;
    return (
        <div className="compact__row">
            <span className="compact__label">Users</span>
            {user_tags.map(t => (
                <span key={t} className="compact__chip"><UserLabel user_tag={t} /></span>
            ))}
        </div>
    );
}

function CompactSubmissionCard({ submission_tag, highlighted = false }) {
    const { data: title } = api.submissions.title.useGetSubmissionTitle({ tag: submission_tag }, { enabled: _.isString(submission_tag), staleTime: 300000 });
    return (
        <div className="compact__card" style={highlighted ? { borderColor: "#2b6cb0", boxShadow: "0 0 0 2px #2b6cb0" } : undefined}>
            <p className="compact__card__title">
                <Link to={`/submissions/${submission_tag}`} style={{ color: "#182026" }}>
                    {_.isString(title) && title.trim().length > 0 ? title : submission_tag}
                </Link>
            </p>
            <span className="compact__tag">{submission_tag}</span>
            <SubmissionUsers submission_tag={submission_tag} />
            <SubmissionResearchAim submission_tag={submission_tag} />
            <SubmissionStateChanger submission_tag={submission_tag} />
            <SubmissionProtocols submission_tag={submission_tag} />
            <SubmissionMetatexts submission_tag={submission_tag} />
            <SubmissionConditionApplications submission_tag={submission_tag} />
        </div>
    );
}

/**
 * @description Compact list of submissions with a search box, each allowing state changes,
 * protocol linking and metatext insertion.
 * @returns {JSX.Element} The submissions tab.
 */
const PAGE_SIZE = 15;

/**
 * @description Label resolving a user tag to the full name.
 * @param {Object} props
 * @param {String} props.user_tag User tag
 * @returns {JSX.Element} The user name.
 */
function UserLabel({ user_tag }) {
    const { data: user, isSuccess } = api.users.core.useGetPublicUserByTag({ tag: user_tag }, { enabled: _.isString(user_tag) });
    return <span>{isSuccess && _.isObject(user) ? getUserFullName(user) : user_tag}</span>;
}

/**
 * @description Label resolving a research group tag to its text.
 * @param {Object} props
 * @param {String} props.group_tag Research group tag
 * @returns {JSX.Element} The group name.
 */
function ResearchGroupLabel({ group_tag }) {
    const { data: group } = api.researchgroups.useGetResearchGroupByTag({ tag: group_tag }, { enabled: _.isString(group_tag) });
    return <span>{_.isObject(group) && _.isString(group.text) ? group.text : group_tag}</span>;
}

/**
 * @description Select option resolving a research group tag to its text.
 * @param {Object} props
 * @param {String} props.group_tag Research group tag
 * @returns {JSX.Element} The option element.
 */
function ResearchGroupOption({ group_tag }) {
    const { data: group } = api.researchgroups.useGetResearchGroupByTag({ tag: group_tag }, { enabled: _.isString(group_tag) });
    return <option value={group_tag}>{_.isObject(group) && _.isString(group.text) ? group.text : group_tag}</option>;
}

/**
 * @description Filter bar for the compact submissions list: free-text search plus
 * user-based search (type to find users, click to add as filter chips) and a
 * research group select (filters by the group's members).
 * @param {Object} props
 * @param {String} props.search Free text search
 * @param {Function} props.setSearch Setter for the free text search
 * @param {Array} props.selectedUserTags Selected user tags
 * @param {Function} props.setSelectedUserTags Setter for selected user tags
 * @param {String} props.selectedGroupTag Selected research group tag ("" = none)
 * @param {Function} props.setSelectedGroupTag Setter for the research group tag
 * @returns {JSX.Element} The filter bar.
 */
function SubmissionFilters({ search, setSearch, selectedUserTags, setSelectedUserTags, selectedGroupTag, setSelectedGroupTag }) {
    const [userQuery, setUserQuery] = useState("");
    const debouncedUserQuery = useDebounce(userQuery, 400);
    const { data: userResults } = api.users.queryByQuery.useGetUserByQuery(
        { search_string: debouncedUserQuery.trim().length > 0 ? debouncedUserQuery.trim() : null, limit: 10 },
        { enabled: debouncedUserQuery.trim().length > 0, staleTime: 30000 }
    );
    const { data: groupTags } = api.researchgroups.useGetResearchGroups({ limit: 200 }, { staleTime: 300000 });
    const { data: groupUserTags } = api.researchgroups.useGetResearchGroupUsers(
        { tag: selectedGroupTag }, { enabled: _.isString(selectedGroupTag) && selectedGroupTag.length > 0 }
    );

    const addUser = (user_tag) => {
        if (!_.isString(user_tag) || selectedUserTags.includes(user_tag)) return;
        setSelectedUserTags(prev => [...prev, user_tag]);
        setUserQuery("");
    };
    const userOptions = _.isArray(userResults) ? userResults.filter(t => !selectedUserTags.includes(t)) : [];
    const hasFilters = selectedUserTags.length > 0 || (_.isString(selectedGroupTag) && selectedGroupTag.length > 0);

    return (
        <div className="compact__card" style={{ marginBottom: "0.75rem" }}>
            <input
                className="compact__input"
                placeholder="Search submissions…"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
            <div className="compact__row">
                <input
                    className="compact__input"
                    style={{ flex: 1, width: "auto" }}
                    placeholder="Find user…"
                    value={userQuery}
                    onChange={e => setUserQuery(e.target.value)}
                />
                <select
                    className="compact__select"
                    style={{ width: "auto" }}
                    value={selectedGroupTag}
                    onChange={e => setSelectedGroupTag(e.target.value)}
                >
                    <option value="">All research groups</option>
                    {_.isArray(groupTags) ? groupTags.map(g => (
                        <ResearchGroupOption key={g} group_tag={g} />
                    )) : null}
                </select>
            </div>
            {userQuery.trim().length > 0 && userOptions.length > 0 ? (
                <div className="compact__row" style={{ flexDirection: "column", alignItems: "stretch", gap: 2 }}>
                    {userOptions.map(t => (
                        <button key={t} className="compact__button compact__button--ghost" style={{ textAlign: "left" }} onClick={() => addUser(t)}>
                            + <UserLabel user_tag={t} />
                        </button>
                    ))}
                </div>
            ) : null}
            {hasFilters ? (
                <div className="compact__row">
                    {selectedUserTags.map(t => (
                        <span key={t} className="compact__chip">
                            <UserLabel user_tag={t} />
                            <button className="compact__chip__remove" onClick={() => setSelectedUserTags(prev => prev.filter(x => x !== t))}>×</button>
                        </span>
                    ))}
                    {_.isString(selectedGroupTag) && selectedGroupTag.length > 0 ? (
                        <span className="compact__chip">
                            <ResearchGroupLabel group_tag={selectedGroupTag} />
                            {_.isArray(groupUserTags) && groupUserTags.length > 0 ? <span className="compact__hint"> ({groupUserTags.length} members)</span> : null}
                            <button className="compact__chip__remove" onClick={() => setSelectedGroupTag("")}>×</button>
                        </span>
                    ) : null}
                    <button className="compact__button compact__button--ghost" onClick={() => { setSelectedUserTags([]); setSelectedGroupTag(""); }}>
                        Clear filters
                    </button>
                </div>
            ) : null}
        </div>
    );
}

export function CompactSubmissions() {
    const [search, setSearch] = useState("");
    const [selectedUserTags, setSelectedUserTags] = useState([]);
    const [selectedGroupTag, setSelectedGroupTag] = useState("");
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const [searchParams] = useSearchParams();
    const focusRef = useRef(null);
    const sentinelRef = useRef(null);
    const sentinelOnScreen = useOnScreen(sentinelRef);
    const focusTag = _.isString(searchParams.get("submission")) && searchParams.get("submission").length > 0
        ? searchParams.get("submission") : null;
    const { data: groupUserTags } = api.researchgroups.useGetResearchGroupUsers(
        { tag: selectedGroupTag }, { enabled: _.isString(selectedGroupTag) && selectedGroupTag.length > 0 }
    );
    const effectiveUserTags = _.uniq([...selectedUserTags, ...(_.isArray(groupUserTags) ? groupUserTags : [])]);
    const { data: submission_tags, isLoading, isError, error } = api.submissions.query.useGetSubmissionByQuery(
        {
            search_string: search.trim().length > 0 ? search.trim() : null,
            user_tags: effectiveUserTags.length > 0 ? _.join(effectiveUserTags, ";") : null,
            limit: 100,
            group_by_state: false,
        },
        { staleTime: 30000 }
    );

    useEffect(() => {
        if (focusRef.current) focusRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }, [focusTag]);

    const listTags = _.isArray(submission_tags) ? submission_tags.filter(tag => tag !== focusTag) : [];
    const visibleTags = listTags.slice(0, visibleCount);
    const hasMore = visibleCount < listTags.length;

    // lazy loading: render the next page as soon as the sentinel scrolls into view
    useEffect(() => {
        if (sentinelOnScreen && hasMore) setVisibleCount(c => c + PAGE_SIZE);
    }, [sentinelOnScreen, hasMore]);

    useEffect(() => {
        setVisibleCount(PAGE_SIZE);
    }, [search, effectiveUserTags.join(";"), submission_tags]);

    return (
        <div>
            <SubmissionFilters
                search={search}
                setSearch={setSearch}
                selectedUserTags={selectedUserTags}
                setSelectedUserTags={setSelectedUserTags}
                selectedGroupTag={selectedGroupTag}
                setSelectedGroupTag={setSelectedGroupTag}
            />
            <div className="compact__hint" style={{ margin: "0.4rem 0 0.75rem" }}>
                State changes, protocols, metatexts and condition applications — optimized for lab use on small screens.
            </div>
            {focusTag ? (
                <div ref={focusRef}>
                    <CompactSubmissionCard submission_tag={focusTag} highlighted={true} />
                </div>
            ) : null}
            {isLoading ? <div className="compact__hint">Loading…</div> : null}
            {isError ? <div className="compact__hint" style={{ color: "#cd4246" }}>{error?.message || "Failed to load submissions."}</div> : null}
            {listTags.length === 0 && !focusTag && !isLoading ? <div className="compact__hint">No submissions found.</div> : null}
            {visibleTags.map(tag => (
                <CompactSubmissionCard key={tag} submission_tag={tag} />
            ))}
            {hasMore ? (
                <div ref={sentinelRef} style={{ textAlign: "center", padding: "0.5rem" }}>
                    <button className="compact__button compact__button--ghost" onClick={() => setVisibleCount(c => c + PAGE_SIZE)}>
                        Load more ({listTags.length - visibleTags.length} remaining)
                    </button>
                </div>
            ) : null}
        </div>
    );
}
