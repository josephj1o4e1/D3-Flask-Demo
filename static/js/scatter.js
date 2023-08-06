// 1. create x-y axis
// 2. create yearSlider input element with initial values. 
// 3. zoom and pan
// 4. read data using d3.csv, and create a callback function "handleYearFilter" for d3.csv: 
    // - filter by year
    // - groupby on category with aggregation avg. backers & pledges
// 4. add input-type eventlistener on yearSlider. when triggered, execute handleYearFilter again. 
// 5. first execution of handleYearFilter. 


let zoom = d3.zoom()
    // .scaleExtent([0.5, 4]) // Set the minimum and maximum zoom scale
    // // .translateExtent([[0, 0], [width, height]]) // to specify bounds [[x0, y0], [x1, y1]] that the user can't pan outside of
    // .translateExtent([[-20, 0], [600, 400]])
    .on('zoom', handleZoom);

// Define the dimensions and margins for the plot
// set the dimensions and margins of the graph
const margin = {top: 10, right: 30, bottom: 40, left: 80},
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// Create the SVG container
// append the svg object to the body of the page
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .call(zoom)
    // .call(zoom.transform, d3.zoomIdentity)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// create a tooltip
const Tooltip = d3.select("#chart")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")

x0=[0, 200]
y0=[0, 100000]

// Add X axis
const x = d3.scaleLinear()
    .domain(x0)
    .range([ 0, width ]);
xAxis = svg.append("g")
    .attr("class", "grid-lines")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).ticks(10).tickSize(-height));
// Add X axis label:
svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", width/2)
    .attr("y", height + margin.top + 28)
    .attr("font-weight", 600)
    .text("Backers");

// Add Y axis
const y = d3.scaleLinear()
    .domain(y0)
    .range([ height, 0]);
yAxis = svg.append("g")
    .attr("class", "grid-lines")
    .call(d3.axisLeft(y).ticks(10).tickSize(-width));

newX = x
newY = y

// Y axis label:
svg.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left+12)
    .attr("x", -margin.top - (height/2) + 25)
    .attr("font-weight", 600)
    .text("Pledge")

// Add a clipPath: everything out of this area won't be drawn.
let clip = svg.append("defs") //"defs": store graphical objects that will be used at a later time. 
    .append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("width", width)
    .attr("height", height)
    .attr("x", 0)
    .attr("y", 0);

// Create the dots element under svg, where datapoint dots would take place (and also possibly a brush feature)
let dots = svg.append("g").attr("clip-path", "url(#clip)");
// let dots = svg.append("g")

// Get yearSlider input element in the DOM.
const yearSlider = document.getElementById("yearSlider");
const yearIndicator = document.getElementById("yearIndicator");
yearSlider.min = 2009; // Minimum year value
yearSlider.max = 2020; // Maximum year value
yearSlider.step = 1; // Increment step
// yearSlider.value = "all"; // "all"; // Initial value set to "all"
yearSlider.list = "yearselector";
yearSlider.setAttribute("list", "yearselector");
yearIndicator.innerHTML = yearSlider.value;

// Zoom and Pan 
function handleZoom(e) {
    newX = e.transform.rescaleX(x);
    newY = e.transform.rescaleY(y);

    // update axes with these new boundaries
    xAxis.call(d3.axisBottom(newX).ticks(10).tickSize(-height));
    yAxis.call(d3.axisLeft(newY).ticks(10).tickSize(-width));


    // apply transform to the chart / dots
    // e.transform has three properties x, y and k. (k is the scale factor), pass e.transform directly into .attr
    
    // tip: needs to .selectAll("circle"), that applies to every single dot for transform rather than the whole dots group. 
    // when clipping, it only reacts to the ones that were "selected". 
    // order: selectAll -> transform -> clip

    // If you don't use .selectAll('circle') and directly set the transform attribute of the dots group, the clipping method would miss the clips because the transform attribute of the group only applies to the group element itself, not its child elements (e.g., circles).
    // When you apply transformations to a group element, it affects the positioning, scaling, and other attributes of the group as a whole. However, any child elements inside the group are not individually affected by this transformation. As a result, if the child elements (circles) have positions outside the boundaries defined by the clip path, they will not be clipped or hidden, and they may still be drawn outside the chart area.
    // On the other hand, when you use .selectAll('circle'), you are selecting and applying transformations to each individual circle element inside the group. This means that each circle is affected individually by the zoom and pan transformations, and they correctly stay within the boundaries defined by the clip path. As a result, the clipping method works as expected, and any parts of the circles that extend outside the chart area are clipped or hidden, creating a visually appealing zoom and pan experience.
    dots.selectAll("circle")
        // .attr('transform', e.transform); 
        .attr("cx", d => newX(d.avgBackersCount))
        .attr("cy", d => newY(d.avgPledgedInUSD));

}

function updateChart(transform_func) {
    let anim = d3.select('svg').transition().duration(750);

    // recover the new scale
    newX = transform_func.rescaleX(x);
    newY = transform_func.rescaleY(y);

    // update axes with these new boundaries
    xAxis
        .transition(anim)
        .call(d3.axisBottom(newX).ticks(10).tickSize(-height));
    yAxis
        .transition(anim)
        .call(d3.axisLeft(newY).ticks(10).tickSize(-width));
    
    // update circles
    dots.selectAll("circle")
        .transition(anim)
        // .attr('transform', transform_func); 
        .attr("cx", d => newX(d.avgBackersCount))
        .attr("cy", d => newY(d.avgPledgedInUSD));

}

function reset_zoom() {
    updateChart(d3.zoomIdentity);
    // reset_flag=1;
    // e object of handleZoom(e) is not automatically updated when manually reset the zoom using d3.zoomIdentity.
    // svg.call(zoom.transform, d3.zoomIdentity)
}



//Read the data
d3.csv("static/data/ProjectDataUSA-week3.csv").then( function(data) {
    // create function to handle the yearSlider filter updates. 
    function handleYearFilter() {
        let selectedValue = yearSlider.value;
        yearIndicator.innerHTML = selectedValue;
        let filteredData;
        // Check if "all years" is selected
        if (selectedValue === "all") {
            // Use the entire data set
            filteredData = data;
        } else {
            const startYear = parseInt(selectedValue, 10); // 10 means it's a decimal number

            // Filter the data based on the selected year range
            filteredData = data.filter((d) => d.LAUNCHED_YEAR >= startYear);
        }
        
        // Aggregate data by category and calculate averages of Backers & Pledges
        const aggregatedData = d3.rollup(filteredData, 
            v => ({
                avgBackersCount: d3.mean(v, d => d.BACKERS_COUNT),
                avgPledgedInUSD: d3.mean(v, d => d.PLEDGED_IN_USD),
                successRate: d3.mean(v, d => d.STATE === "successful" ? 1 : 0), 
                //year filter
            }), 
            d => d.CATEGORY
        );

        // Convert aggregated data to an array
        groupedData = Array.from(aggregatedData, ([category, values]) => ({ category, ...values }));
        
        //numPoints = groupedData.length
        // Define color scale for success rate
        const colorScale = d3.scaleLinear()
            .domain([0, 1]) // Assuming success rate is between 0 and 1
            .range(["yellow", "red"]); // Adjust the colors as needed
        
        // Three function that change the tooltip when user hover / move / leave a cell
        const mouseover = function(event, d) {
            Tooltip
                .style("opacity", 1)
        }
        decimalPoints=3;
        const mousemove = function(event, d) {
            Tooltip
                .html("Category: " + d.category + '<br>' + 
                    "Backers Count: " + Math.round(d.avgBackersCount * Math.pow(10, decimalPoints)) / Math.pow(10, decimalPoints) + '<br>' + 
                    "Pledge($): " + Math.round(d.avgPledgedInUSD * Math.pow(10, decimalPoints)) / Math.pow(10, decimalPoints)
                )
                .style("left", `${event.layerX+10}px`)
                .style("top", `${event.layerY}px`)
        }
        const mouseleave = function(event, d) {
            Tooltip
                .style("opacity", 0)
        }    

        // Append circles for datapoints 'dots' 
        dots.selectAll("circle")
            .data(groupedData)
            .join("circle")
                .attr("cx", function (d) { return newX(d.avgBackersCount); } )
                .attr("cy", function (d) { return newY(d.avgPledgedInUSD); } )
                .attr("r", 4)
                .style("fill", "white")
                .style("stroke", d => colorScale(d.successRate))
                // .text(d => d.CATEGORY)
                .on("mouseover", mouseover)
                .on("mousemove", mousemove) // corresponding data object bound to that circle is passed as the second argument (d) to the mousemove function.
                .on("mouseleave", mouseleave)
                ;
        
        // // Append labels for datapoints 'dots'
        // dots.selectAll('text')
        //     .data(data)
        //     .join('text')
        //         .attr('x', d => d.x + 8)
        //         .attr('y', d => d.y)
        //         .text(d => d.CATEGORY)
        //         .style('font-size', '12px')
        //         .style('fill', 'black');
        
        // // Label collision detection and adjustment

    }

    // add eventlistener on yearSlider.  
    yearSlider.addEventListener("input", handleYearFilter);
    handleYearFilter(); // updateData: first execution of handleYearFilter.
})
