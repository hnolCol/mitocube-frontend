import _ from "lodash";
import { useEffect, useState } from "react";
import { api } from "@/api";
import useDebounce from "@/hooks/useDebounce";
import { getUserFullName } from "@/services/format/user";
import { ResearchGroupText } from "@/comps/admin/researchgroup/ResearchGroupText";

const ROLE_LABELS = { 2: "Group Curator", 3: "Curator", 4: "Admin" };
const ROLE_COLORS = { 2: "#2b6cb0", 3: "#cd4246", 4: "#cd4246" };

const styles = {
    label: { display: "block", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#5c7080", marginBottom: 4 },
    input: { width: "100%", boxSizing: "border-box", border: "1px solid #d8dee4", borderRadius: 8, padding: "0.5rem 0.6rem", fontSize: "0.9rem", background: "#ffffff", color: "#182026" },
    option: { display: "block", width: "100%", textAlign: "left", border: "1px solid #e1e5ea", background: "#ffffff", borderRadius: 8, padding: "0.4rem 0.6rem", marginTop: 2, cursor: "pointer", fontSize: "0.88rem", color: "#182026" },
    chip: { display: "inline-flex", alignItems: "center", gap: "0.3rem", background: "#eef2f6", border: "1px solid #d8dee4", borderRadius: 999, padding: "0.15rem 0.6rem", fontSize: "0.78rem", color: "#182026" },
    chipRemove: { border: "none", background: "none", color: "#cd4246", fontWeight: 700, cursor: "pointer", padding: 0, fontSize: "0.85rem" },
    roleBadge: { display: "inline-block", marginLeft: 6, padding: "0 6px", borderRadius: 8, color: "#ffffff", fontSize: "0.68rem", fontWeight: 700 },
    groupLabel: { marginLeft: 6, fontSize: "0.68rem", color: "#738091" },
    hint: { fontSize: "0.75rem", color: "#738091", marginTop: 2 },
};

/**
 * @description Reports the head (PI / group curator) tags of one research group upward.
 * Renders nothing.
 * @param {Object} props
 * @param {String} props.group_tag Research group tag
 * @param {Function} props.onHeads Callback with the array of head user tags
 * @returns {null}
 */
function GroupHeadsProbe({ group_tag, onHeads }) {
    const { data: head_tags } = api.researchgroups.useGetResearchGroupHeads({ tag: group_tag }, { enabled: _.isString(group_tag) })
    useEffect(() => {
        if (_.isArray(head_tags)) onHeads(head_tags)
    }, [group_tag, head_tags])
    return null
}

/**
 * @description One selectable user row: full name, role badge for curators/admins
 * (role >= 2) and research group labels. Plain HTML, no Blueprint.
 * @param {Object} props
 * @param {String} props.user_tag User tag
 * @param {Function} props.onSelect Select callback
 * @returns {JSX.Element} The option row.
 */
function PlainUserOption({ user_tag, onSelect }) {
    const { data: user, isSuccess } = api.users.core.useGetPublicUserByTag({ tag: user_tag }, { enabled: _.isString(user_tag) })
    const { data: role } = api.users.roles.useGetUserRoleByTag({ tag: user_tag }, { enabled: _.isString(user_tag), staleTime: 300000 })
    const { data: groups, isSuccess: groupsOk } = api.researchgroups.useGetResearchGroupsByQuery({ user_tags: [user_tag] }, { enabled: _.isString(user_tag) })
    const roleLabel = _.isFinite(_.toNumber(role)) ? ROLE_LABELS[_.toNumber(role)] : undefined
    return (
        <button type="button" style={styles.option} onClick={() => onSelect(user_tag)}>
            {isSuccess && _.isObject(user) ? getUserFullName(user) : user_tag}
            {roleLabel ? (
                <span style={{ ...styles.roleBadge, backgroundColor: ROLE_COLORS[_.toNumber(role)] || "#5f6b7c" }}>{roleLabel}</span>
            ) : null}
            {groupsOk && _.isArray(groups) ? groups.map(g => (
                <span key={g} style={styles.groupLabel}><ResearchGroupText research_group_tag={g} /></span>
            )) : null}
        </button>
    );
}

/**
 * @description Plain-HTML (Blueprint-free) multi-select user input with live search,
 * role badges for curators and a pinned "own group curator" at the top when
 * current_user_tag is given (the asking user themself is never pinned).
 * Usable in the compact app and other non-Blueprint contexts.
 * @param {Object} props
 * @param {Array} props.selected_users Selected user tags
 * @param {Function} props.onChange Called with the new array of selected user tags
 * @param {String} [props.current_user_tag] Tag of the asking user (enables group-curator pinning)
 * @param {String} [props.label] Field label
 * @param {String} [props.placeholder] Input placeholder
 * @param {Number} [props.limit] Max search results
 * @returns {JSX.Element} The user picker.
 */
export function PlainUserInput({ selected_users = [], onChange, current_user_tag = undefined, label = "Users", placeholder = "Find a user…", limit = 10 }) {
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 400);
    const [groupCuratorTags, setGroupCuratorTags] = useState([]);

    const { data: user_tags, isFetching } = api.users.queryByQuery.useGetUserByQuery(
        { search_string: debouncedQuery.trim().length > 0 ? debouncedQuery.trim() : null, limit },
        { enabled: true, staleTime: 30000 }
    );
    const { data: myGroups } = api.researchgroups.useGetResearchGroupsOfUser(
        { user_tag: current_user_tag }, { enabled: _.isString(current_user_tag), staleTime: 300000 }
    )
    const handleHeads = (tags) => setGroupCuratorTags(prev => _.uniq([...prev, ...tags]))

    const pinned = _.isArray(groupCuratorTags) ? groupCuratorTags.filter(t => t !== current_user_tag) : []
    const selected = _.isArray(selected_users) ? selected_users : []
    const searchResults = _.isArray(user_tags) ? user_tags.filter(t => !selected.includes(t)) : []
    const pinnedVisible = pinned.filter(t => !selected.includes(t))
    const showPinned = query.trim().length === 0 && pinnedVisible.length > 0

    const add = (t) => {
        if (!_.isString(t) || selected.includes(t)) return;
        onChange([...selected, t]);
        setQuery("");
    }
    const remove = (t) => onChange(selected.filter(x => x !== t))

    return (
        <div>
            {_.isString(current_user_tag) && _.isArray(myGroups) ? myGroups.map(g => (
                <GroupHeadsProbe key={g} group_tag={g} onHeads={handleHeads} />
            )) : null}
            {label ? <span style={styles.label}>{label}</span> : null}
            <input
                style={styles.input}
                placeholder={placeholder}
                value={query}
                onChange={e => setQuery(e.target.value)}
            />
            {isFetching && query.trim().length > 0 ? <div style={styles.hint}>Searching…</div> : null}
            {showPinned ? (
                <div style={{ marginTop: 4 }}>
                    <div style={styles.hint}>Your group curator</div>
                    {pinnedVisible.map(t => <PlainUserOption key={t} user_tag={t} onSelect={add} />)}
                </div>
            ) : null}
            {query.trim().length > 0 && searchResults.length > 0 ? (
                <div style={{ marginTop: 4 }}>
                    {searchResults.map(t => <PlainUserOption key={t} user_tag={t} onSelect={add} />)}
                </div>
            ) : null}
            {selected.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: 6 }}>
                    {selected.map(t => (
                        <span key={t} style={styles.chip}>
                            <PlainUserName user_tag={t} />
                            <button type="button" style={styles.chipRemove} onClick={() => remove(t)} title="Remove user">×</button>
                        </span>
                    ))}
                </div>
            ) : null}
        </div>
    );
}

/**
 * @description Chip label resolving a user tag to the full name.
 * @param {Object} props
 * @param {String} props.user_tag User tag
 * @returns {JSX.Element} The user name.
 */
function PlainUserName({ user_tag }) {
    const { data: user, isSuccess } = api.users.core.useGetPublicUserByTag({ tag: user_tag }, { enabled: _.isString(user_tag) })
    return <span>{isSuccess && _.isObject(user) ? getUserFullName(user) : user_tag}</span>
}
