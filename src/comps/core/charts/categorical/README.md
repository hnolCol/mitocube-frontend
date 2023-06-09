## Components for Categorical Plotting

The idea of the single and multiple components is to provide easy plotting of up to three categorical keys. 
This components must be used within a different component that defines the plot type such as a bar, point/line or boxplot. 
The data should be provided in an array of objects as shown below. 
The component returns and array of objects that hold the data for each subplot. Please see below for more details. 

```javascript
function MultiCategoricalChart({
    data = [
        { y: 5, T: "A", G: "WT", O : "0.5h" },
        { y: 4, T: "B", G: "WT", O : "0.5h" },
        { y: 10, T: "C", G: "WT", O: "0.5h" },
        { y: 5, T: "A", G: "WT2", O : "0.5h" },
        { y: 4, T: "B", G: "WT2", O : "0.5h" },
        { y: 10, T: "C", G: "WT2", O : "0.5h" },
        { y: 5, T: "A", G: "KO", O : "0.5h" },
        { y: 40, T: "B", G: "KO", O : "0.5h" },
        { y: -20, T: "C", G: "KO", O : "0.5h" },
        { y: 5, T: "A", G: "WT", O : "10h" },
        { y: 4, T: "B", G: "WT", O : "10h" },
        { y: 2, T: "C", G: "WT", O : "10h" },
        { y: 5, T: "A", G: "KO", O : "10h" },
        { y: 4, T: "B", G: "KO", O : "10h" },
        { y: 2, T: "C", G: "KO", O : "10h" }
    ],
    yaxisName = "y",
    colorName = "T",
    splitName, 
    subplotName,
    innerSubplotPadding = 0.05,
    outerSubplotPadding = 0.1,
    innerSplitPadding = 0.2,
    innerColorPadding = 0.0,
    svgID = undefined,
    colorPalette = [],
    children
}) {
    ...
}
```
### Defining the split of the data 

The categories used for splitting the data are defined by the functional parameters

```javascript
yaxisName = "y" // the value used for the y axis. Must be numerical 
colorName = "T" // key that should be used be distinguished by color 
splitName = "G" undefined // key that splits the data on the xaxis 
subplotName = "O" undefined // key that holds the values for the subplot splitting. 
```

Please note that the splitName and subplotName can also be undefined. 

### Colors 

The ```colorPalette``` can be defined as an array providing a list of colors that should match the length of the unique categories in the data (colorName as key). 
As an alternative, colorPalette can also be defined as an object within the keys should be unique colorCategories and the values must be hex color. 
By default the the standard colorPalette implemented in core/colors/colorPaleete.js (getColorPalette function) will be utilized.

### Returns

The component returns the following object for each subplot. 

```javascript
            {chartHeight, // the height of the chart in pixel (applying the margins and )
            chartWidth, // the width of the subplot 
            idx, // integer index
            yaxisName, // the provided yaxisName
            splitName, // the provided splitName
            colorName, // the provided colorname
            subplotName, // the provided subplotName
            margins, // the provided margins
            yScale, // the calculated yScale which is consistend over the subplot
            splitCategories, // the detected unique categories from the data 
            splitScale, // the calcultated splitScale (e.g. the xaxis for each subplot)
            subplotScale, // the calculated subplotScale (e.g. the positioning of the subplot - bandwidth == chartWidth)
            subplotCategory, // the subplotCategory for the particular subplot
            splitColorScale, // the colorSplitScale (within the splitScale bandwidth - e.g. barplot next to each other within the splitScale)
            colorScale, // the calculated color scale for unique categories detected in the data.
            subplotData, // the data for the subplot (e.g. filtered by subplotCategory)
            subplotCategoryFound, // boolean indicating if a subplot category was detected (subplotName === undefined -> false)
            splitCategoryFound, // same as above but for the splitName
            bandwidth, // bandwidth of the subplotScale => width of the subplot 
            colorBandwidth, //bandwidth of the color
            xcenter // the xaxis center of the subplot
            }
```