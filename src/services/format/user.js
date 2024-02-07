
/**
 * Returns the user's full name from a user dict.
 * @param   {Object}    user   User information that must contain firstname and lastname keys.
 * @param   {string}    user.firstname The user's first name
 * @param   {string}    user.lastname The user's last name.
* @return  {string}     Full name of the user  
 */
export function getUserFullName(user) {
    return `${user.firstname} ${user.lastname}`
}

/**
 * Returns the user's initials.
 * @param   {Object}    user   User information that must contain firstname and lastname keys.
 * @param   {string}    user.firstname The user's first name
 * @param   {string}    user.lastname The user's last name.
* @return  {string}     Full name of the user  
 */
export function getUserInitials(user) {
    return `${user.firstname.slice(0,2)} ${user.lastname.slice(0,2)}`
}