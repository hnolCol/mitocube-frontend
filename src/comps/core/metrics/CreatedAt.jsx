import PropTypes from 'prop-types'
import { getFormatDateFromTimestamp } from "../../../services/date/format"


export function CraetedAt({ createdat, addFromNow = true }) {
    
    if (Math.log10(createdat) < 11) { //since the backend is python and is using 
        // seconds instead of miliseconds, check this first. 
        var createdat = createdat * 1000 
    }
    

    const [m, formatedTime] = getFormatDateFromTimestamp(createdat)
    return (
        <div style={{ fontSize: "0.8rem", color : "darkgrey"}}>
            {formatedTime} {addFromNow ? `(${ m.fromNow() })` : ''}
        </div>
    )
}