# Modular Procedures (facility workflow modules)

This folder contains the user-facing workflow components for modular procedures — the
facility's chain of wet-lab modules (e.g. "Protein Concentration Measurement" →
"SP3 Digestion" → "Measurement"). Curators manage the modules in the admin area
(`src/comps/admin/modularprocedures`); this folder is the **workflow board** where the
facility tracks submissions through the published modules, **executes** procedures on
plates and records **well metrics**.

See the backend documentation (`mitocube-backend/docs/modular-procedures.md`) for the
data model, the API and the rules (single open module per submission, pooling/splitting,
trait-based metrics).

## Components

| File | Purpose |
|---|---|
| `ModularProcedureBoard.jsx` | Horizontal overview of all published procedures (one column per procedure, only the latest published version per lineage). Each card is a linked submission with its link date and done state; the column header shows the utilized **protocols**. Curators can mark done / reopen, **Execute** a procedure and open the **Metrics** dialog. The **Executions** section lists the runs of the procedure with their status (RUNNING / SUCCEEDED / FAILED / ABORTED); curators confirm a running execution with **Successful / Failed / Aborted**, which frees the assigned submissions for the next procedure. Route: `/modular-procedures`. |
| `ModularProcedureExecutionDialog.jsx` | Executes a published procedure on a set of samples. |
| `ModularProcedureExecutionMetricsDialog.jsx` | Sets or updates well metrics of an **existing** execution. |
| `ModularProcedureForm.jsx` | Create/edit form used by the admin area (title, description, condition applications, protocols, **plate setup** — required input/output plate format and type, **well attributes** — input attributes that may be filled in per input well and output attributes expected after a successful run — and the optional **success submission state** that is set automatically when an execution is confirmed successful). |

## The execution dialog

The dialog implements the input-plate → output-plate workflow:

1. **Plates**: select the input and output plates (or create a new plate via the existing
   `PlateCreateDialog`). **Auto-map 1:1** maps every input well to the same position on the
   output plate for the common case.
2. **Samples**: the samples of *all* submissions linked to the procedure are listed,
   grouped by submission label. Click a sample, then click one or more input wells to
   place it (placing one sample into several wells is the splitting case).
3. **Transfer map**: click an occupied input well to select it, then click or **drag over
   output wells** to map it. Mapping several input wells onto the same output well is the
   pooling case (e.g. differently treated samples pooled into one column well). The
   backend derives the content of each output well from this map, so a sample can appear
   in more than one output well.
4. **Condition applications**: click an output well and add condition applications
   (e.g. heat treatment) to it via the existing `ConditionApplicationInput`.
5. **Responsible user**: defaults to the current user, selectable via `UserInput`; the backend requires the responsible user to be a curator. Plates that do not match the plate layout defined in the procedure setup are hidden from the dropdowns.
6. **Well metrics** (optional): define the measured quantities as **attribute → trait**
   pairs (e.g. *Concentration* → *µg/µL*) using `AttributeInput` and `TraitInput`,
   **download the txt template** (header line `well` + one column per trait, one line per
   output well), fill in the values and **upload** it. Tab, comma and semicolon separators
   are accepted; unknown wells/traits and non-numeric values are rejected with clear
   messages; the parsed values are previewed per well.

Right-click clears an input well / removes an output well (or unmaps the selected input
well). The validation summary under the grids explains why the execute button is disabled.

Executing starts the execution in the **RUNNING** state. The submissions owning the placed
samples stay linked and open until a curator **confirms the outcome** (successful / failed /
aborted) in the board's executions section: regardless of the outcome that frees them for the
next module; only a successful confirmation sets the procedure's optional success submission
state and makes the submissions adopt the condition applications of the module. Well metrics
can be defined for both sides: **input values** (`side: INPUT`, e.g. the concentration of each
well before harmonization) and **output metrics** (`side: OUTPUT`, measured after the run).

## The metrics dialog

The **Metrics** button on each board column opens `ModularProcedureExecutionMetricsDialog`
to record measured values *after* the execution: pick the execution, define the
attribute → trait quantities, download the template pre-filled with that execution's
output wells, upload the filled file and save. Existing metrics are shown per well.

## Shared helpers (exported from the execution dialog)

| Function | Purpose |
|---|---|
| `downloadMetricsTemplate(wellPositions, traitTags, filename)` | Generates the txt template: one header line (`well` + trait tags), one line per well. |
| `parseMetricsFile(content, traitTags)` | Parses an uploaded metrics file (tab/comma/semicolon separated) into `[{position, trait_tag, value}]` entries, validating the header traits, positions and numeric values. |

## Related components elsewhere

- `src/comps/admin/modularprocedures` — curator management (create/edit/publish/version/link).
- `src/comps/submission/view/SubmissionModuleStatus.jsx` — the "Workflow Modules" box in
  the submission overview showing the active module and the module history (hidden for
  submissions that are not linked to any module).
