import { api } from "@/api"; 

/**
 * 
 * @param {Object} props 
 * @param {boolean} props.exclude_inactive - If true, inactive users are excluded from the count.
 * @description A component that displays the count of users.
 * It uses the useGetUserCount hook from the api-hooks to fetch the user count.
 * @example <UserCount exclude_inactive={true} /> 
 * @returns 
 */
export function UserCount({ exclude_inactive = true }) {
    const { data: userCount, isLoading } = api.users.count.useGetUserCount({ exclude_inactive });

    return (
        <span>{isLoading ? "Loading..." : userCount}</span>
    )
}
