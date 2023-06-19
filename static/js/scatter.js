// Define the dimensions and margins for the plot
// set the dimensions and margins of the graph
const margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
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
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, 100000])
        .range([ height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));


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
        const groupedData = Array.from(aggregatedData, ([category, values]) => ({ category, ...values }));
        
        // Define color scale for success rate
        const colorScale = d3.scaleLinear()
            .domain([0, 1]) // Assuming success rate is between 0 and 1
            .range(["yellow", "red"]); // Adjust the colors as needed
        
        // // Clear the previous dots
        // svg.selectAll(".dot").remove();

        // Add dots
        dots.selectAll("circle")
            .data(groupedData)
            .join("circle")
                .attr("cx", function (d) { return x(d.avgBackersCount); } )
                .attr("cy", function (d) { return y(d.avgPledgedInUSD); } )
                .attr("r", 2)
                .style("fill", "none")
                .style("stroke", d => colorScale(d.successRate))
                // .text(d => d.CATEGORY)
                ;

    }

    // add input-type eventlistener on yearSlider. when triggered, it'll execute handleYearFilter again. 
    yearSlider.addEventListener("input", handleYearFilter);

    // first execution of handleYearFilter. 
    handleYearFilter();

})
