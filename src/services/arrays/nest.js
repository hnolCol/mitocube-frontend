import _ from "lodash"


/**
 * @description Creates a data tree on a specific link (key in an array of objects). Please note that the array size will change.
 * The function is intended to work by ids. Therefore each item should contain an id. The ```link```keyname should point to a keyName
 * that references to the parent id. 
 * @param   {Object}    treeProps - The tree props.
 * @param   {Object[]}  treeProps.array The data to create the tree of. 
 * @param   {string}    treeProps.link The keyName to be used for linking the data. Defaults to ```'parent_id'```
 * @return  {Object[]} - Returns the tree data. Children can be found by the keyName childNodes.
 */
export function createDataTree({ array, link = 'parent_id' }){
    const hashTable = Object.create(null);
    array.forEach(aData => hashTable[aData.tag] = {...aData, childNodes: []});
    const dataTree = [];
    array.forEach(aData => {
      if(aData[link] && _.has(hashTable,aData[link])) hashTable[aData[link]].childNodes.push(hashTable[aData.tag])
      else dataTree.push(hashTable[aData.tag])
    });
    return dataTree;
  };