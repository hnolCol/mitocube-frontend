import hooks from "@mitocube/api-hooks"

export function SubmissionUpload({ }) { 

    const { data: permissions } = hooks.submissions.permissions.useGetSubmissionPermissions({}, { staleTime: 60000 });




    




}