
import PropTypes, { string } from "prop-types"


function findControl({groupNames, commonControls = ["ctrl","wt"]}) {

    const groupNamesMatchingControls = groupNames.filter(groupName => commonControls.includes(groupName.toLowerCase()))

    if (groupNamesMatchingControls.length === 0) return undefined 
    
    return groupNamesMatchingControls[0]
}

findControl.propTypes = {
    groupNames: PropTypes.arrayOf(string),
    commonControls : PropTypes.arrayOf(string)

}

export default findControl