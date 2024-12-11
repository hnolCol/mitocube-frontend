import moment from "moment"

const event = new Date(Date.UTC(2012, 11, 20, 3, 0, 0));
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };


export function getFormatDateFromTimestamp(timestamp) {
   const m = moment.unix(timestamp/1000)
   return [m, m.format("YYYY-MM-DD")]
}

export function getCurrentDate() {
   return moment().format("YYYYMMDD")
}