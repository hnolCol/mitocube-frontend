import { Callout, Icon } from "@blueprintjs/core"

const C = {
    admin: "#c8761e",
    pi: "#2d7dd2",
    group_curator: "#7e57c2",
    member: "#9a3c50",
    members: "#6b8e23",
    line: "#8f9aa4",
    ok: "#2e7d32",
    no: "#c62828",
    pending: "#b8860b",
}

const ROLE_STYLES = {
    admin: { color: C.admin, icon: "shield", label: "Admin / Curator", short: "Admin" },
    pi: { color: C.pi, icon: "crown", label: "Head of research group (PI)", short: "PI" },
    group_curator: { color: C.group_curator, icon: "badge", label: "Group curator", short: "Group curator" },
    member: { color: C.member, icon: "person", label: "Standard member / owner", short: "Member" },
    members: { color: C.members, icon: "people", label: "Consortium members", short: "All members" },
}

// layout: main spine (Yes path) and right branch column (No path)
const SX = 230
const RX = 535
const VIEW_W = 680
const VIEW_H = 1240

/**
 * @description Colored role chip of the flowchart legend.
 * @param {Object} props
 * @param {String} props.roleKey Key of the role in ROLE_STYLES
 * @returns {JSX.Element} The role chip.
 */
function RoleChip({ roleKey }) {
    const role = ROLE_STYLES[roleKey]
    return <span className="div--round flex align-center"
        style={{
            gap: "0.2rem", padding: "0.1rem 0.4rem", fontWeight: 600, fontSize: "0.7rem",
            backgroundColor: `${role.color}22`, border: `1px solid ${role.color}`, color: role.color,
        }}>
        <Icon icon={role.icon} size={11} color={role.color} />
        {role.label}
    </span>
}

/**
 * @description Flowchart node shape: a pill bubble (start / end), a rounded box (step)
 * or a diamond (yes/no decision), with centered title, body and role lines.
 * @param {Object} props
 * @param {String} props.kind "pill", "box" or "diamond"
 * @param {Number} props.cx Center x
 * @param {Number} props.cy Center y
 * @param {Number} props.w Width
 * @param {Number} props.h Height
 * @param {String} props.color Accent color
 * @param {Array} props.title Bold title lines
 * @param {Array} props.body Regular body lines
 * @param {Array} props.roles Keys of the performing roles
 * @param {Boolean} props.dashed Whether the outline is dashed
 * @returns {JSX.Element} The SVG node.
 */
function FlowNode({ kind = "box", cx, cy, w = 260, h = 46, color, title = [], body = [], roles = [], dashed }) {
    const stroke = { stroke: color, strokeWidth: 2, strokeDasharray: dashed ? "5 4" : undefined }
    let shape
    if (kind === "diamond") {
        shape = <polygon points={`${cx},${cy - h / 2} ${cx + w / 2},${cy} ${cx},${cy + h / 2} ${cx - w / 2},${cy}`}
            fill={color} fillOpacity={0.07} {...stroke} />
    } else {
        shape = <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={kind === "pill" ? h / 2 : 12}
            fill={kind === "pill" ? color : "#fff"} fillOpacity={kind === "pill" ? 0.1 : 1} {...stroke} />
    }
    const lh = 14
    const total = title.length + body.length + (roles.length ? 1 : 0)
    const y0 = cy - ((total - 1) * lh) / 2
    return <g>
        {shape}
        {title.map((t, i) => <text key={`t${i}`} x={cx} y={y0 + i * lh} textAnchor="middle" dominantBaseline="middle"
            fontSize={12} fontWeight={700} fill={color}>{t}</text>)}
        {body.map((t, i) => <text key={`b${i}`} x={cx} y={y0 + (title.length + i) * lh} textAnchor="middle"
            dominantBaseline="middle" fontSize={10.5} fill="#444">{t}</text>)}
        {roles.length ? <text x={cx} y={y0 + (title.length + body.length) * lh} textAnchor="middle"
            dominantBaseline="middle" fontSize={10} fontWeight={600}>
            {roles.map((k, i) => <tspan key={k} fill={ROLE_STYLES[k].color}>{i ? " · " : ""}{ROLE_STYLES[k].short}</tspan>)}
        </text> : null}
    </g>
}

/**
 * @description Connector path with arrowhead.
 * @param {Object} props
 * @param {String} props.d SVG path
 * @param {Boolean} props.dashed Whether the line is dashed
 * @returns {JSX.Element} The connector.
 */
function Arrow({ d, dashed }) {
    return <path d={d} fill="none" stroke={C.line} strokeWidth={2}
        strokeDasharray={dashed ? "5 4" : undefined} markerEnd="url(#cpf-arrow-explore)" />
}

/**
 * @description Yes / No bubble placed on a branch connector.
 * @param {Object} props
 * @param {Number} props.x Center x
 * @param {Number} props.y Center y
 * @param {Boolean} props.yes Whether it is the Yes branch
 * @returns {JSX.Element} The branch tag.
 */
function BranchTag({ x, y, yes }) {
    const text = yes ? "Yes" : "No"
    const w = 34
    return <g>
        <rect x={x - w / 2} y={y - 9} width={w} height={18} rx={9} fill={yes ? C.ok : C.no} />
        <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={10.5} fontWeight={700} fill="#fff">{text}</text>
    </g>
}

/**
 * @description Small grey note or section label.
 * @param {Object} props
 * @param {Number} props.x X position
 * @param {Number} props.y Y position
 * @param {String} props.anchor Text anchor
 * @param {Boolean} props.section Whether it is a section label
 * @returns {JSX.Element} The note.
 */
function Note({ x, y, children, anchor = "start", section }) {
    return <text x={x} y={y} textAnchor={anchor} dominantBaseline="middle"
        fontSize={section ? 10 : 10.5} fontWeight={section ? 700 : 400} letterSpacing={section ? 1 : 0}
        fontStyle={section ? "normal" : "italic"} fill={section ? "#8a939b" : "#555"}>{children}</text>
}

/**
 * @description Flowchart of the explore view permission rules as they are enforced by the
 * backend: bubbles for start / end states, boxes for steps and diamonds for yes/no
 * decisions - from the group's explore setting (disabled by default, enabled by the PI)
 * over the collaboration request (required for both visibility scopes, 'ALL' and 'GROUPS')
 * to the final decision by the head (PI) of the submission
 * owner's research group for requests from other research groups.
 * @returns {JSX.Element} The explore view permission flowchart.
 */
export function CollaborationPermissionsFlow() {
    return <div className="flex flex-column align-center margin--little">
        <Callout title="How the explore view works" intent="info">
            <div className="font-size--small">
                Explore is disabled for every new research group until its head (PI) enables it.
                While disabled, the group's members cannot use the explore view and their
                submissions are hidden from others. The PI can also restrict which research
                groups may discover the group's submissions: either all research groups (also
                research groups joining later) or an explicit selection that never includes
                research groups automatically. Either way, visibility only controls discovery:
                opening a submission always requires an approved collaboration request, and a
                request from another research group is solely decided by the head (PI) of the
                submission owner's research group, backend enforced.
            </div>
        </Callout>

        <div className="flex flex-wrap margin--little justify-center" style={{ gap: "0.4rem" }}>
            <RoleChip roleKey="admin" />
            <RoleChip roleKey="pi" />
            <RoleChip roleKey="group_curator" />
            <RoleChip roleKey="member" />
        </div>

        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} style={{ width: "100%", maxWidth: 640, fontFamily: "inherit" }}>
            <defs>
                <marker id="cpf-arrow-explore" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
                    <path d="M0,0 L10,5 L0,10 z" fill={C.line} />
                </marker>
            </defs>

            <Note x={8} y={40} section>VISIBILITY</Note>
            <Note x={8} y={575} section>DISCOVERY</Note>
            <Note x={8} y={672} section>DECISION</Note>
            <Note x={8} y={1053} section>OUTCOME</Note>

            {/* visibility */}
            <FlowNode kind="pill" cx={SX} cy={40} w={300} h={50} color={C.admin}
                title={["Research group created"]} body={["explore disabled by default"]} />
            <Arrow d={`M${SX},65 V113`} />
            <Note x={SX + 10} y={90}>only the head (PI) of the group can enable it</Note>

            <FlowNode kind="diamond" cx={SX} cy={165} w={230} h={100} color={C.pi}
                title={["PI enabled", "explore?"]} roles={["pi"]} />
            <Arrow d={`M${SX + 115},165 H${RX - 107}`} />
            <BranchTag x={392} y={165} yes={false} />
            <FlowNode kind="pill" cx={RX} cy={165} w={210} h={80} color={C.no}
                title={["Explore unavailable"]}
                body={["members can't open the", "explore view; submissions", "hidden from others"]} />

            <Arrow d={`M${SX},215 V255`} />
            <BranchTag x={SX} y={235} yes />
            <FlowNode cx={SX} cy={280} h={50} color={C.ok}
                title={["Members can browse the", "explore view"]} />

            <Arrow d={`M${SX},305 V340`} />
            <FlowNode kind="diamond" cx={SX} cy={392} w={230} h={104} color={C.pi}
                title={["Visibility restricted to", "selected research", "groups?"]} roles={["pi"]} />

            <Arrow d={`M${SX + 115},392 H${RX - 102}`} />
            <BranchTag x={392} y={392} yes={false} />
            <FlowNode cx={RX} cy={392} w={204} h={84} color={C.member}
                title={["All research groups"]}
                body={["every research group can discover", "the submissions - access still", "needs an approved request"]} />
            <Arrow d={`M${RX},434 V605 H${SX + 132}`} />
            <Note x={RX + 8} y={525}>request still required</Note>

            <Arrow d={`M${SX},444 V485`} />
            <BranchTag x={SX} y={464} yes />
            <FlowNode cx={SX} cy={512} h={54} color={C.member}
                title={["Selected research groups only"]}
                body={["only allowed groups discover", "them; newcomers only after", "the PI added them"]} />

            {/* discovery */}
            <Arrow d={`M${SX},539 V578`} />
            <FlowNode cx={SX} cy={605} h={50} color={C.member}
                title={["Request collaboration"]} body={["for self or the own research group"]} roles={["member"]} />

            {/* decision */}
            <Arrow d={`M${SX},630 V668`} />
            <FlowNode kind="diamond" cx={SX} cy={720} w={230} h={100} color={C.pi}
                title={["Same research group", "as the owner?"]} />

            <Arrow d={`M${SX + 115},720 H${RX - 102}`} />
            <BranchTag x={392} y={720} yes={false} />
            <FlowNode cx={RX} cy={720} w={204} h={84} color={C.pi}
                title={["Solely the owner's PI", "decides"]}
                body={["admins & curators cannot;", "hidden from everybody else"]} roles={["pi"]} />

            <Arrow d={`M${SX},770 V815`} />
            <BranchTag x={SX} y={792} yes />
            <FlowNode cx={SX} cy={845} h={60} color={C.group_curator}
                title={["Owner, heads (PIs) &", "curators decide"]} />

            {/* both paths converge in the final decision */}
            <Arrow d={`M${SX},875 V907`} />
            <Arrow d={`M${RX},762 V890 H${SX + 3}`} />
            <FlowNode kind="diamond" cx={SX} cy={955} w={230} h={96} color={C.pi}
                title={["Request accepted?"]} />

            <Arrow d={`M${SX + 115},955 H${RX - 107}`} />
            <BranchTag x={392} y={955} yes={false} />
            <FlowNode kind="pill" cx={RX} cy={955} w={200} h={64} color={C.no}
                title={["Request denied"]} body={["dropped - no access,", "a new one can be filed"]} />

            <Arrow d={`M${SX},1003 V1045`} />
            <BranchTag x={SX} y={1024} yes />
            <FlowNode kind="pill" cx={SX} cy={1085} w={280} h={64} color={C.ok}
                title={["Collaboration active"]} body={["the requester or the whole", "requested group gains access"]} />

            <Arrow d={`M${SX},1117 V1155`} dashed />
            <Note x={SX + 10} y={1138}>anytime</Note>
            <FlowNode kind="pill" cx={SX} cy={1185} w={280} h={56} color={C.no} dashed
                title={["Collaboration revoked"]} body={["by the submission owner"]} />
        </svg>
    </div>
}