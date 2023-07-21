



var svgWidth = window.innerWidth/2,
    svgHeight = window.innerHeight/2.5,
    margin = 0,
    width = svgWidth - margin * 2,
    height = svgHeight - margin * 2;

// Define the radius of the pie chart
var radius = Math.min(width - margin, height - margin) / 2 * 0.5;

var arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);

var svg = d3.select('#pieChart')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

var g = svg.append('g')
    .attr('transform', 'translate(' + svgWidth / 2 + ',' + svgHeight / 2 + ')');

// Define the radius of the pie chart
var radius = Math.min(width - margin, height - margin) / 2;

// Select the SVG element
var svg = d3.select('#pieChart');

// Define an arc generator with inner and outer radii
var arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);



    var labelArc = d3.arc()
    .innerRadius(radius - 20) // change these values accordingly
    .outerRadius(radius - 10);
    

// Define the pie layout function
var pie = d3.pie()
    .sort(null)
    .value(function(d) { return d.value; });

// Initialize Scrollama
const scroller = scrollama();

// Country data for steps 2 and 3
var countries = [
    {country: 'Greece', value: 11.80415879},
    {country: 'China', value: 11.03953953},
    {country: 'Japan', value: 10.73293264},
    {country: 'USA', value: 7.414305418},
    {country: 'Singapore', value: 5.294459172},
    {country: 'Norway', value: 4.704699937},
    {country: 'UK', value: 4.395531627},
    {country: 'Germany', value: 3.669042082},
    {country: 'Hong Kong', value: 3.634318676},
    {country: 'South Korea', value: 3.498210967},
    {country: 'Rest of the World', value: 34.7765066}
];

// Function to generate pie chart
function generatePieChart(data, transitionDuration) {
    var g = svg.append('g')
    .attr('transform', 'translate(' + svg.node().getBoundingClientRect().width / 2 + ',' + svg.node().getBoundingClientRect().height / 2 + ')');


    // Generate the new pie chart
    var arcs = g.selectAll('.arc')
        .data(pie(data))
        .enter()
        .append('g')
        .attr('class', 'arc');

            // Define a sequential color scale with shades of blue
    var colorScale = d3.scaleSequential()
    .interpolator(d3.interpolateBlues)
    .domain([0, data.length]);


    // Append the path (the pie piece) to each arc slice
    arcs.append('path')
        .attr('d', arc)
        .style('fill', function(d, i) {
            if (d.data.country === 'Rest of the World') {
                return '#000080';  // Fixed color for 'Rest of the World'
            }else if (d.data.country === 'Top 10 Countries') {
                return '#1E90FF';  // Fixed light blue color for 'Top 10 Countries'
            }
            return colorScale(i);  // Use the blue color scale for other countries
        })
        .style('opacity', 0)
        .transition()
        .duration(200)
        .ease(d3.easeLinear)  // Change to linear easing function
        .style('opacity', 1);


// Add labels to the pie chart
arcs.append('text')
    .attr('transform', function(d) {
        var pos = arc.centroid(d);
        pos[0] *= 2.6; //multiply by >1 to move outside the circle
        pos[1] *= 2.6;
        return 'translate(' + pos + ')';
    })
    .attr('text-anchor', 'middle')
    .text(function(d) { 
        var percentage = (d.endAngle - d.startAngle) / (2 * Math.PI) * 100;
        return d.data.country + ' ' + percentage.toFixed(2) + '%'; 
    });


    // Add polylines from pie slices to labels
    arcs.append('polyline')
        .attr('points', function(d) {
            var pos = arc.centroid(d);
            pos[0] *= 2.3; //also multiply by >1 to move outside the circle
            pos[1] *= 2.3;
            return [arc.centroid(d), pos];
        })
        .attr('stroke', 'black')
        .attr('fill', 'none');
}


// Function to generate bar chart
function generateBarChart(data, transitionDuration) {
    // Filter out 'Rest of the World'
    data = data.filter(function(d) { return d.country !== 'Rest of the World'; });

    // Sort data in descending order
    data.sort(function(a, b) { return b.value - a.value; });

    var margin = {top: 30, right: 20, bottom: 0, left: 50},
    maxWidth = 800, // set a maximum width
    maxHeight = 500, // set a maximum height
    width = Math.min(maxWidth, svg.node().getBoundingClientRect().width - margin.left - margin.right),
    height = Math.min(maxHeight, svg.node().getBoundingClientRect().height - margin.top - margin.bottom);

    
    var x = d3.scaleBand()
        .range([0, width])
        .padding(0.1)
        .domain(data.map(function(d) { return d.country; }));

    var y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(data, function(d) { return d.value; })]);

        var isMobile = window.innerWidth <= 768;
        var g = svg.append('g');

        // If mobile view, translate the group element to the center of the SVG container
        if (isMobile) {
            g.attr('transform', 'translate(' + (margin.left + (width - x.bandwidth() * data.length) / 2) + ',' + svg.node().getBoundingClientRect().height / 2 + ')');
        }
        // Otherwise, translate the group element towards the top of the SVG container
        else {
            g.attr('transform', 'translate(' + (margin.left + (width - x.bandwidth() * data.length) / 2) + ',' + margin.top + ')');
        }

// Add the Y Axis
var yAxis = g.append("g")
    .call(d3.axisLeft(y));

// Add Y Axis label
yAxis.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "0.11em")
    .style("text-anchor", "middle")
    .text("Share of the World's Merchant Fleet Value, %");


    // Add bars
    var bars = g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.country); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return height; })
        .attr("height", 0)
        .style("fill", "steelblue")
        .transition()
        .duration(transitionDuration)
        .ease(d3.easeLinear)
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); });

    // Add labels to bars
    bars.each(function(d, i) {
        g.append("text")
            .attr("x", (i * (width / data.length)) + (width / (2 * data.length))) 
            .attr("y", y(d.value) - 5)
            .attr("text-anchor", "middle") 
            .text(d.country);
    });
}






// Scrollama event handlers
function handleStepEnter(response) {
    var stepIndex = response.index;

    // Clear the SVG
    svg.selectAll('*').remove();

    switch(stepIndex) {
        case 1:  // First pie chart
            generatePieChart([
                {country: 'Top 10 Countries', value: 65.2234934},
                {country: 'Rest of the World', value: 34.7765066}
            ], 1000);
            break;
        case 2:  // Second pie chart
            generatePieChart(countries, 1000);
            break;
        case 3:  // Bar chart
            generateBarChart(countries, 1000);
            break;
    }

    var textBox = d3.select('#step-' + (stepIndex + 1));
    textBox.style('opacity', 1);
}

// Setup Scrollama
function setupScroller() {
    scroller.setup({
        step: '#scrolly .step',
        offset: 0.7,
        debug: false,
        progress: true,
    })
    .onStepEnter(handleStepEnter)
    .onStepProgress(handleStepProgress);
}

function handleResize() {
    svgWidth = window.innerWidth;
    svgHeight = window.innerHeight;
    width = svgWidth - margin * 2;
    height = svgHeight - margin * 2;
    radius = Math.min(width, height) / 2;

    svg.attr('width', svgWidth)
        .attr('height', svgHeight);

    g.attr('transform', 'translate(' + svgWidth / 2 + ',' + svgHeight / 2 + ')');

    arc.innerRadius(0)
        .outerRadius(radius);

    svg.selectAll('path')
        .attr('d', arc);

    generatePieChart(countries, 1000);
}


function init() {
    setupScroller();
    handleResize();
    window.addEventListener('resize', handleResize);
}

init();


// Setup Scrollama
function setupScroller() {
    scroller.setup({
        step: '#scrolly .step',
        offset: 0.5,
        debug: false,
        progress: true,
    })
    .onStepEnter(handleStepEnter)
    .onStepProgress(handleStepProgress);
}

// Handle window resize
function handleResize() {
    scroller.resize();
}

// Kickoff
function init() {
    setupScroller();
    window.addEventListener('resize', handleResize);
}

init();
