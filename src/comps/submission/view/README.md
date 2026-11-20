## Admin-Submission

URL : admin/submission 

React components for the admin submission area.
Administrator restricted area to handle submissions.
Allowing Users (Admin Role) to edit submissions:
- State changes
- Assign Instrument 
- Create Sample Lists (Samples Names and Plate Positions)
- Adjust methods of a project and new sections using the ExperimentalInfoEditing dialog. 


SubmissionView expects to get the following formats from the API.

```
        submissions: [],
        states: [],
        tagNames : [],
        searchColumns : [], //columns that are available from the 
        submissionSummaryParams: []
        submissionsToShow: [],

        #these params are not expected from the API but are included in the state. 
        submissionFilter: "None",
        submissionSatesCounts: {}, //counts the states.
        searchString: "",
        
```


## Workflow Modules box

`SubmissionModuleStatus.jsx` renders the "Workflow Modules" box in the submission
overview (analysis view): the **active module** (the open modular procedure link, if any)
and the **module history** (done links with completion date and user). Submissions that
are not linked to any modular procedure show no box at all. See
`src/comps/modularprocedures/README.md` and the backend
`docs/modular-procedures.md` for the full workflow documentation.

## Module Flow box

`SubmissionModuleFlow.jsx` renders the "Module Flow" box: a directed, left-to-right
flow graph (@visx/hierarchy `Cluster`) of the modules the submission passed through —
submission → modules (assignment order) → executions (run order) → input wells → the
output wells they were transferred to. Node colors carry the status reports (module
done/open, execution state per the shared execution status colors); hovering a node shows
a tooltip with its details (procedure/version, states and dates, responsible user,
samples, per-well values and condition applications). Only the wells and values of the
requesting user's submissions are visible (the backend masks everything else); executions
holding other users' data never appear.

## Sample Locations box

`SubmissionSampleLocations.jsx` renders the "Sample Locations" box: for every sample of
the submission the wells of its most recent procedure execution (input and output plate),
the procedure and the execution state — samples stay visible on the plate even after a
failed or aborted run. Hidden for submissions whose samples were never placed.
