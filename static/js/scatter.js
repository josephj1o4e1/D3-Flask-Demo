// 1. create x-y axis
// 2. create yearSlider input element with initial values. 
// 3. zoom and pan
// 4. read data using d3.csv, and create a callback function "handleYearFilter" for d3.csv: 
    // - filter by year
    // - groupby on category with aggregation avg. backers & pledges
// 4. add input-type eventlistener on yearSlider. when triggered, execute handleYearFilter again. 
// 5. first execution of handleYearFilter. 




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
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

let anim = svg.transition().duration(750);

// Add X axis
const x = d3.scaleLinear()
    .domain([0, 200])
    .range([ 0, width ]);
xAxis = svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));
// Add X axis label:
svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", width/2)
    .attr("y", height + margin.top + 28)
    .attr("font-weight", 600)
    .text("Backers");

// Add Y axis
const y = d3.scaleLinear()
    .domain([0, 100000])
    .range([ height, 0]);
yAxis = svg.append("g")
    .call(d3.axisLeft(y));
// Y axis label:
svg.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left+12)
    .attr("x", -margin.top - (height/2) + 25)
    .attr("font-weight", 600)
    .text("Pledge")

// Add a clipPath: everything out of this area won't be drawn.
let clip = svg.append("defs")
  .append("svg:clipPath")
  .attr("id", "clip")
  .append("svg:rect")
  .attr("width", width)
  .attr("height", height)
  .attr("x", 0)
  .attr("y", 0);

// Create the dots element under svg, where datapoint dots would take place (and also possibly a brush feature)
dots = svg.append("g").attr("clip-path", "url(#clip)");

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
    const verticalTranslation = `translate(${e.transform.x}, ${e.transform.y + height*e.transform.k}) scale(${e.transform.k})`;
    // apply transform to the chart / dots
    dots.attr('transform', e.transform); // e.transform has three properties x, y and k. (k is the scale factor), pass e.transform directly into .attr
    // Apply the same transform to the axes
    xAxis.attr('transform', verticalTranslation); // xAxis.attr('transform', e.transform);
    yAxis.attr('transform', e.transform);
}

let zoom = d3.zoom()
    .scaleExtent([0.5, 4]) // Set the minimum and maximum zoom scale
    // .translateExtent([[0, 0], [width, height]]) // to specify bounds [[x0, y0], [x1, y1]] that the user can't pan outside of
    .translateExtent([[-20, 0], [600, 400]])
    .on('zoom', handleZoom);

function initZoom() {
    d3.select('svg')
        .call(zoom);
}

initZoom();

// function updateChart(newX, newY) {
//     // let t = SVG.transition().duration(750);
//     anim = d3.select('svg').transition().duration(750);
    
//     // update axes with these new boundaries
//     xAxis.transition(anim).call(d3.axisBottom(newX));
//     yAxis.transition(anim).call(d3.axisLeft(newY));
    
//     // update circle position
//     scatter
//         .selectAll("circle")
//         .transition(anim)
//         .attr("cx", function(d) {
//             return newX(d.Sepal_Length);
//         })
//         .attr("cy", function(d) {
//             return newY(d.Petal_Length);
//         });
// }

// function reset_zoom() {
//     newX = x.domain(x0);
//     newY = y.domain(y0);
    
//     updateChart(newX, newY);
// }

// let resetbutton = document.getElementById("resetZoom"); 
// resetbutton.addEventListener("click", reset_zoom);


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
        numPoints = groupedData.length
        // Define color scale for success rate
        const colorScale = d3.scaleLinear()
            .domain([0, 1]) // Assuming success rate is between 0 and 1
            .range(["yellow", "red"]); // Adjust the colors as needed
        

        // Append circles for datapoints 'dots' 
        dots.selectAll("circle")
            .data(groupedData)
            .join("circle")
                .attr("cx", function (d) { return x(d.avgBackersCount); } )
                .attr("cy", function (d) { return y(d.avgPledgedInUSD); } )
                .attr("r", 3)
                .style("fill", "none")
                .style("stroke", d => colorScale(d.successRate))
                // .text(d => d.CATEGORY)
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
