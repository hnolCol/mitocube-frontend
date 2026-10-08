import { getQuantiles as vizGetQuantiles, getQuantilesInArrayByKeyNames } from "@mitocube/viz/src/utils/stats"

export const getQuantiles = vizGetQuantiles
export { getQuantilesInArrayByKeyNames }

export function getMedian(array) {
    return vizGetQuantiles(array, [0.5], 1.5, false).values
}
