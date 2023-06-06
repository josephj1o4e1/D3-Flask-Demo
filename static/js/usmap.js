// loads a GeoJSON file containing map data, applies a map projection, and draws the map using SVG path elements.

const width = 400;
const height = 300;
const chartContainer = d3.select("#chart");

// Map and projection
const projection = d3.geoNaturalEarth1()
    .scale(width / 1.0 / Math.PI) // projection's internal calculations are based on radians rather than pixels. PI radian = 180 degrees
    .translate([width / 2, height / 2])

// Load external data and boot
d3.json(worldgeoJsonUrl).then( function(data) {
    // Draw the map
    chartContainer.append("svg")
        .selectAll("path")
        .data(data.features)
        .join("path")
        .attr("fill", "#69b3a2")
        .attr("d", d3.geoPath().projection(projection))
        .style("stroke", "#fff")

})

// // Map and projection
// const path = d3.geoPath();
// const projection = d3.geoMercator()
//     .scale(70)
//     .center([0,20])
//     .translate([width / 2, height / 2]);

// // Data and color scale
// let data = new Map()
// const colorScale = d3.scaleThreshold()
//     .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
//     .range(d3.schemeBlues[7]);

// // Load external data and boot
// Promise.all([
//     d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
//     d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv", function(d) {
//         data.set(d.code, +d.pop)
//     })
// ]).then(function(loadData){
//     let topo = loadData[0]

//     // Draw the map
//     chartContainer.append("svg")
//         .selectAll("path")
//         .data(topo.features)
//         .join("path")
//         // draw each country
//         .attr("d", d3.geoPath()
//             .projection(projection)
//         )
//         // set the color of each country
//         .attr("fill", function (d) {
//             d.total = data.get(d.id) || 0;
//             return colorScale(d.total);
//         })
// })
