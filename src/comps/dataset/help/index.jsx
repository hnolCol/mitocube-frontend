

function DatasetHelp() {
    return (
        <div>
            <h3>Dataset Help</h3>
            <h4>Volcano plot</h4>
            <p>A volcano plot is specific type of a scatter plot which displays the log2 fold change on the x-axis as well as the -log10 transformed p-value from a two-sided t-test on the y-axis. 
                This plot allows the identification of the most regulated proteins (left and right side) with a low p-value (high in -log10 transform).
                By default the False Discovery Rate (FDR) is calculated using the Benjamini-Hochberg correction. But in the future,  you will be able to select the method of choice. 
                The volcano plot allows you to annotate features by clicking on the circles, clicking again removes the label.
            </p>
            <h4>Heatmap</h4>

            <h4>Principal Component Analysis</h4>
            <p>A Principal component analysis is a versatile statistical method for reducing a cases-by-variables data table to its essential features,
                called principal components. Principal components are a few linear combinations of the original variables that maximally explain the variance of all the variables.
                The components are determined with decreasing coverage of variance. Therefore the first component covers most of the variance.</p>
            <p>Here the PCA is calculated and displays the projected data (left scatter plot, e.g. samples) as well as the eigenvalues. (right scatter plot)
                As for other scatter plots, you can use the toolbar on top to customize the chart. 
            </p>
            <h4>MitoMap</h4>
            <p>The MitoMap is based a publicly available database. By default, the MitoCara 3.0 is used for human and mouse samples which contains a hierarchical 
                pathway annotation. Based on this annotations, a  network is build connecting pathways and features (protein). Notably, if a protein is assigned 
                to multiple pathways of the same hierarchy, then only the most specific connection is shown. You can search for nodes (e.g. pathways and features) which are 
                then highlighted by a greater opacity. 
            </p>
        </div>
    )
}

export default DatasetHelp