import _ from "lodash"
import hooks from "@mitocube/api-hooks"
import { useParams } from "react-router"

export function UserView({ }) {
    const { tag } = useParams()

    const { data: user, isLoading, isError, error } = hooks.users.useGetPublicUserByTag({ tag }, { enabled: _.isString(tag) && tag.length > 0 })

    if (isLoading) return <div>Loading user...</div>
    if (isError) return <div>Error loading user: {error.message}</div>

    return (
        <div className="user-view">
            <h2>User Details</h2>
            <p><strong>Tag:</strong> {user.tag}</p>
            <p><strong>First Name:</strong> {user.firstname}</p>
            <p><strong>Last Name:</strong> {user.lastname}</p>
            <p><strong>Email:</strong> {user.email}</p>
            {/* Add more user details as needed */}
        </div>
    )
}