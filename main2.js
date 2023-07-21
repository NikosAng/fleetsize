


// Define the size of the scatterplot and its margins
var width2 = 400;
var height2 = 300;
var margin2 = 0;

// Define the scales for our axes
var xScale = d3.scaleLinear().domain([18, 30]).range([margin2, width2 - margin2]);
var yScale = d3.scaleLinear().domain([0, 17]).range([height2 - margin2, margin2]);

// Define the axes using the scales
var xAxis = d3.axisBottom(xScale);
var yAxis = d3.axisLeft(yScale);

// Select the SVG element for the scatterplot
var svg2 = d3.select('#scatterPlot');

// Initialize Scrollama for the scatterplot
const scroller2 = scrollama();



// Handle window resize
function handleResize2() {
    // Tell Scrollama to update new element dimensions
    scroller2.resize();

    // Get the current dimensions of the SVG
    var currentWidth = svg2.node().getBoundingClientRect().width;
    var currentHeight = svg2.node().getBoundingClientRect().height;

    // Update the translation of the 'g' elements to the new center
    svg2.selectAll('g')
        .attr('transform', 'translate(' + currentWidth / 1 + ',' + currentHeight / 1 + ')');
}


// Load the data from the CSV file
d3.csv("df_merged.csv").then(function(data) {
    // Parse numeric values in the data
    data.forEach(function(d) {
        d.Log_GDP = +d.Log_GDP;
        d.Log_Total = +d.Log_Total;
    });

    function handleStepEnter2(response) {
        // Update the scatterplot based on the current step
        var stepIndex = response.index;

        // Clear the SVG
        svg2.selectAll('*').remove();

        

            // Append the x axis to the SVG
            svg2.append('g')
                .attr('transform', `translate(0, ${height2 - margin2})`)  // Place x-axis at the bottom of the plot
                .call(xAxis);

// Add x-axis label
svg2.append("text")             
    .attr("transform", "translate(" + (width2/2) + " ," + (height2 - margin2/2) + ")")  // Position at the middle of the x-axis
    .style("text-anchor", "middle")
    .text("Log GDP");  

            svg2.append('g')
                .attr('transform', `translate(${margin2}, 0)`)  // Place y-axis at the beginning of the x-axis
                .call(yAxis);

// Add y-axis label
svg2.append("text")
    .attr("transform", "rotate(-90)")  // Rotate the text by -90 degrees
    .attr("y", 0 + margin2/2)  // Position at the start of the y-axis
    .attr("x", 0 - (height2 / 2))  // Position at the middle of the y-axis
    .attr("dy", "1em")  // Shift the text slightly down
    .style("text-anchor", "middle")
    .text("Log Millions Tonnes, Deadweight Tonnage"); 

            if(stepIndex > 0){
                // Add dots to the scatterplot
                var circles = svg2.selectAll('circle')
                    .data(data)
                    .enter()
                    .append('circle')
                    .attr('cx', function(d) { return xScale(d.Log_GDP); })
                    .attr('cy', function(d) { return yScale(d.Log_Total); })
                    .attr('r', 5)
                    .style('fill', function(d) {
                        if (stepIndex === 3 && d.OutlierType === "above") { 
                            return "red"; // If the outlier is above and this is step 4, make it red
                        } else {
                            return "gray"; // Else, color it gray
                        }
                    })
                    .style('opacity', 0)
                    .transition()
                    .duration(1000)
                    .style('opacity', 1);
                
                // If it's the 4th step, append the names of the red dots
                if(stepIndex === 3) {
                    circles.filter(function(d) { return d.OutlierType === "above"; })
                        .each(function(d) {
                            svg2.append('text')
                                .attr('x', xScale(d.Log_GDP))
                                .attr('y', yScale(d.Log_Total) - 10)  // Adjust this value to place the label above the dot
                                .text(d["Country Name"])
                                .attr('font-size', '10px')
                                .attr('text-anchor', 'middle');
                        });
                }
            }
            


        if(stepIndex > 1){
            // Sort data by Log_GDP
            data.sort(function(a, b) {
                return a.Log_GDP - b.Log_GDP;
            });
        
            // Define line generator
            var lineGenerator = d3.line()
                .x(function(d) { return xScale(d.Log_GDP); })
                .y(function(d) { return yScale(d.Predicted); });
        
            // Draw line of best fit
            svg2.append('path')
                .attr('d', lineGenerator(data))
                .attr('stroke-width', 2)
                .attr('stroke', 'black')
                .attr('fill', 'none')
                .style('opacity', 0)
                .transition()
                .duration(1000)
                .style('opacity', 1);
        }
    }

    // Setup Scrollama for the scatterplot
    function setupScroller2() {
        scroller2.setup({
            step: '#scrolly2 .step',  // Step selector
            offset: 0.5,  // Half of the way down the screen
            debug: false  // Display trigger offset for testing
        })
        .onStepEnter(handleStepEnter2);
    }

    // Kickoff
    function init2() {
        // Setup scroller
        setupScroller2();

        // Handle window resize
        window.addEventListener('resize', handleResize2);
    }

    init2();
});
