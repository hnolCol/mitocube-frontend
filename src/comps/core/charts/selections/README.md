# Chart Selection 

This folder contains all react component that can be used to give the user a chance to select a chart property. 
For example the values that should be plotted on the x and y axis. The color encoding color etc. 

All columns must be of the type 

```javascript
/**
 * @param {Object} props
 * @param {Object} props.selection
 * @param {Function} props.onSelectionChange 
 */
function selectionFn({selection, onSelectionChange}) {


}


```