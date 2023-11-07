import _ from "lodash"

export function nestLinearArrayByLink({ array, id = null, link = 'parent_id' }) {
    
    return array.filter(i => i[link] === id).
        map(i => ({ ...i, children: nestLinearArrayByLink({ array, id : i.id, link })}))
}



export function createDataTree({ array, link = 'parent_id' }){
    const hashTable = Object.create(null);
    array.forEach(aData => hashTable[aData.id] = {...aData, childNodes: []});
    const dataTree = [];
    array.forEach(aData => {
      if(aData[link] && _.has(hashTable,aData[link])) hashTable[aData[link]].childNodes.push(hashTable[aData.id])
      else dataTree.push(hashTable[aData.id])
    });
    return dataTree;
  };