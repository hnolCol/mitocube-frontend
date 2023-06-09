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

