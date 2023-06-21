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


//Read the data
d3.csv("static/data/ProjectDataUSA-week3.csv").then( function(data) {

    // 1. create x-y axis
    // 2. create yearSlider input element with initial values. 
    // 3. create the handleYearFilter function: 
        // - year filter 
        // - groupby on category with aggregation avg. backers & pledges
    // 4. add input-type eventlistener on yearSlider. when triggered, execute handleYearFilter again. 
    // 5. first execution of handleYearFilter. 


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
        .attr("x", width)
        .attr("y", height + margin.top + 25)
        .text("Backers Count");

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
        .attr("y", -margin.left+20)
        .attr("x", -margin.top)
        .text("Pledges (USD)")


    // create yearSlider input element in the DOM with initial values.
    // const yearSlider = document.createElement("input");
    // const yearIndicator = document.createElement("div");
    const yearSlider = document.getElementById("yearSlider");
    const yearIndicator = document.getElementById("yearIndicator");
    yearSlider.min = 2009; // Minimum year value
    yearSlider.max = 2020; // Maximum year value
    yearSlider.step = 1; // Increment step
    // yearSlider.value = "all"; // "all"; // Initial value set to "all"
    yearSlider.list = "yearselector";
    yearSlider.setAttribute("list", "yearselector");
    // d3.select("#filters").node().appendChild(yearSlider);
    // d3.select("#filters").node().appendChild(yearIndicator);

    dots = svg.append("g");
    // let groupedData;
    // create the handleYearFilter function
    function handleYearFilter() {

        const selectedValue = yearSlider.value;
        yearIndicator.innerHTML = selectedValue;
        let filteredData;
        
        console.log(selectedValue);
        // Check if "all years" is selected
        if (selectedValue === "all") {
            // Use the entire data set
            filteredData = data;
        } else {
            const startYear = parseInt(selectedValue, 10); // 10 means it's a decimal number

            // Filter the data based on the selected year range
            filteredData = data.filter((d) => d.LAUNCHED_YEAR >= startYear);
        }
        console.log(filteredData);

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
        
        // // Clear the previous dots
        // svg.selectAll(".dot").remove();

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

    // add input-type eventlistener on yearSlider. when triggered, it'll execute handleYearFilter again. 
    yearSlider.addEventListener("input", handleYearFilter);

    // Zoom and Pan
    function handleZoom(e) {
        const verticalTranslation = `translate(${e.transform.x}, ${e.transform.y + height}) scale(${e.transform.k})`;
        // apply transform to the chart / dots
        dots.attr('transform', e.transform); // e.transform has three properties x, y and k. (k is the scale factor), pass e.transform directly into .attr
        // Apply the same transform to the axes
        xAxis.attr('transform', verticalTranslation);
        yAxis.attr('transform', e.transform);
    }
    
    let zoom = d3.zoom()
        .scaleExtent([0.5, 4]) // Set the minimum and maximum zoom scale
        .translateExtent([[0, 0], [width, height]]) // to specify bounds [[x0, y0], [x1, y1]] that the user can't pan outside of
        .on('zoom', handleZoom);

    function initZoom() {
        d3.select('svg')
            .call(zoom);
    }
    
    initZoom();
    handleYearFilter(); // updateData: first execution of handleYearFilter. 

})
