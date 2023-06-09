## Barchart

Simple bar chart plotting simple bars on a categorical axis. Even though you can specify a colorName defining the colors, it does not split the data in categories
and also does not order the bars. 

The bars should be provided as an array of objects. Each object must contain at least the xaxisName (categorical x axis), the yaxisName (the numeric y axis value).
Optional settings are colorName which references to the key avaialbe in each object determining the color of the bar (Take of the ordering before). 
Moreover, specify the errorName which specifies the error (must also be available in the data array of objects. Please see default props - data - e )
Provide a svgID to make it accessible for downloading as a svg. 

The x-scale, y-scale and color scale are calculated using the data. 

If you are looking for a barchat that is able to split the data by a category, please go to the categorical barchart. 

```javascript 
function Barplot({
    width = 200, 
    height = 300,
    margins = {
        left: 50,
        right: 15,
        bottom: 40,
        top: 10
    },
    data = [
        { x: "Project 1", value : 4, c : "m", e : 0.2}, 
        { x: "Project 2", value : 5, c : "m", e : 0.3}, 
        { x: "Project 3", value : -5, c : "s", e : 0.5}, 
        { x: "Project 4", value : -5, c : "s2", e : 0.5}],
    yaxisName = "value",
    xaxisName = "x",
    colorName = "c",
    errorName = "e",
    showGrid = false,
    addLineAtYZero = true,
    svgID = undefined}) {

        //plotting some Bars 
    }
```


```javascript 
function Bar({
    x = 10,
    width = 10,
    y1 = 20, // 
    y0 = 100, // the baseline of the bar
    fill = "#efefef",
    stroke = "black",
    strokeWidth = 0.5,
    opacity = 1 }) { 
        
    }
```