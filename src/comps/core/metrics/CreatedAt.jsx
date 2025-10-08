import PropTypes from 'prop-types'
import { getFormatDateFromTimestamp } from "../../../services/date/format"


export function CreatedAt({ createdat, addFromNow = true, showOnlyFromNow = false }) {

    if (Math.log10(createdat) < 11) { //since the backend is python and is using 
        // seconds instead of miliseconds, check this first. 
        var createdat = createdat * 1000 
    }
    

    const [m, formatedTime] = getFormatDateFromTimestamp(createdat)
    return (
        <span style={{ color : "darkgrey"}}>
            {showOnlyFromNow ? `${ m.fromNow() }` : <>{formatedTime} {addFromNow ? `(${ m.fromNow() })` : ''}</> }
        </span>
    )
}