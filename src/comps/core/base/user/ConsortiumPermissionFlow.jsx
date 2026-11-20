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
const VIEW_H = 1110

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
        strokeDasharray={dashed ? "5 4" : undefined} markerEnd="url(#cpf-arrow)" />
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
 * @description Flowchart of the consortium permission rules as they are enforced by the
 * backend: bubbles for start / end states, boxes for steps and diamonds for yes/no
 * decisions. The heads of research groups (PIs) always have the final approval.
 * Shown as a tab of the pooled topbar consortium dialog.
 * @returns {JSX.Element} The consortium permission flowchart.
 */
export function ConsortiumPermissionsFlow() {
    return <div className="flex flex-column align-center margin--little">
        <Callout title="How consortium permissions work" intent="info">
            <div className="font-size--small">
                Admins and curators set consortiums up but have no final say over data access.
                The heads of research groups (PIs) decide which members join and which
                submissions are shared - the final approval always rests with them, backend enforced.
            </div>
        </Callout>

        <div className="flex flex-wrap margin--little justify-center" style={{ gap: "0.4rem" }}>
            {Object.keys(ROLE_STYLES).map(key => <RoleChip key={key} roleKey={key} />)}
        </div>

        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} style={{ width: "100%", maxWidth: 640, fontFamily: "inherit" }}>
            <defs>
                <marker id="cpf-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                    <path d="M0,0 L10,5 L0,10 z" fill={C.line} />
                </marker>
            </defs>

            <Note x={8} y={40} section>SETUP</Note>
            <Note x={8} y={400} section>MEMBERSHIP</Note>
            <Note x={8} y={625} section>SHARING</Note>

            {/* setup */}
            <FlowNode kind="pill" cx={SX} cy={40} w={300} h={50} color={C.admin}
                title={["Create consortium & add research groups"]} roles={["admin"]} />
            <Arrow d={`M${SX},65 V113`} />
            <Note x={SX + 10} y={90}>PI of each group joins automatically</Note>

            <FlowNode kind="diamond" cx={SX} cy={165} w={230} h={100} color={C.pi}
                title={["PI agreed to the", "consortium terms?"]} roles={["pi"]} />
            <Arrow d={`M${SX + 115},165 H${RX - 97}`} />
            <BranchTag x={392} y={165} />
            <FlowNode kind="pill" cx={RX} cy={165} w={190} h={64} color={C.no}
                title={["Blocked"]} body={["members can't share", "or see shared data"]} />

            <Arrow d={`M${SX},215 V255`} />
            <BranchTag x={SX} y={235} yes />
            <FlowNode cx={SX} cy={280} color={C.ok}
                title={["Members can share & see"]} body={["submissions of the consortium"]} />

            {/* membership */}
            <Arrow d={`M${SX},303 V348`} />
            <FlowNode kind="diamond" cx={SX} cy={400} w={230} h={100} color={C.group_curator}
                title={["Added by PI or", "group curator?"]} roles={["pi", "group_curator"]} />

            <Arrow d={`M${SX + 115},400 H${RX - 97}`} />
            <BranchTag x={392} y={400} />
            <FlowNode cx={RX} cy={400} w={190} h={60} color={C.member}
                title={["Join request"]} body={["for own account only"]} roles={["member"]} />
            <Arrow d={`M${RX},430 V470`} />
            <FlowNode kind="diamond" cx={RX} cy={520} w={190} h={96} color={C.pi}
                title={["PI / curator", "accepts?"]} />
            <Arrow d={`M${RX - 95},520 H${SX + 132}`} />
            <BranchTag x={400} y={520} yes />
            <Arrow d={`M${RX},568 V601`} />
            <BranchTag x={RX} y={585} />
            <FlowNode kind="pill" cx={RX} cy={625} w={190} h={44} color={C.no} title={["Request denied"]} />

            <Arrow d={`M${SX},450 V495`} />
            <BranchTag x={SX} y={472} yes />
            <FlowNode cx={SX} cy={520} h={46} color={C.ok}
                title={["Member joins the group"]} body={["no further approval needed"]} />

            {/* sharing */}
            <Arrow d={`M${SX},543 V598`} />
            <FlowNode cx={SX} cy={625} h={50} color={C.member}
                title={["Share a submission"]} roles={["member", "admin", "pi"]} />
            <Arrow d={`M${SX},650 V688`} />
            <FlowNode kind="diamond" cx={SX} cy={740} w={230} h={100} color={C.pi}
                title={["Sharer is the owner's", "research-group PI?"]} />

            <Arrow d={`M${SX + 115},740 H${RX - 97}`} />
            <BranchTag x={392} y={740} />
            <FlowNode cx={RX} cy={740} w={190} h={64} color={C.pending}
                title={["Share request PENDING"]} body={["admins & curators", "cannot decide"]} />
            <Arrow d={`M${RX},772 V810`} />
            <FlowNode kind="diamond" cx={RX} cy={860} w={190} h={96} color={C.pi}
                title={["Owner's PI", "accepts?"]} roles={["pi"]} />
            <Arrow d={`M${RX - 95},860 H${SX + 132}`} />
            <BranchTag x={400} y={860} yes />
            <Arrow d={`M${RX},908 V941`} />
            <BranchTag x={RX} y={925} />
            <FlowNode kind="pill" cx={RX} cy={965} w={190} h={44} color={C.no} title={["Request dropped"]} />

            <Arrow d={`M${SX},790 V838`} />
            <BranchTag x={SX} y={812} yes />
            <FlowNode cx={SX} cy={860} h={40} color={C.ok} title={["Share active"]} />

            <Arrow d={`M${SX},880 V918`} />
            <FlowNode kind="pill" cx={SX} cy={950} w={260} h={60} color={C.members}
                title={["All consortium members"]} body={["can access the submission"]} roles={["members"]} />

            <Arrow d={`M${SX},980 V1028`} dashed />
            <Note x={SX + 10} y={1004}>anytime</Note>
            <FlowNode kind="pill" cx={SX} cy={1060} w={280} h={56} color={C.no} dashed
                title={["Revoke the share"]} body={["owner, owner's PI or a curator"]} />
        </svg>
    </div>
}