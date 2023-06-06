// import {us, states, statemesh, Choropleth, Legend} from "@d3/choropleth";
var width = 960,
height = 500;

// var path = d3.geo.path(),
//     force = d3.layout.force().size([width, height]);

const chartContainer = d3.select("#chart");
// const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);
const svg = chartContainer
.append("svg")
.attr("width", width)
.attr("height", height);
const color = d3.scaleQuantize([1, 10], d3.schemeBlues[9]);
const path = d3.geoPath();
// const format = d => `${d}%`; // defines an arrow function named format. format(10) --> "10%"

svg.append("g") // The <g> element is a container that can hold and group multiple SVG elements together.
.attr("transform", "translate(610,20)")
.append(() => Legend(color, {title: "Case", width: 260}));

svg.append("g")
.selectAll("path")
.data(topojson.feature(us, us.objects.counties).features)
.join("path")
.attr("fill", d => color(unemployment.get(d.id)))
.attr("d", path)
.append("title")
.text(d => `${d.properties.name}, ${statemap.get(d.id.slice(0, 2)).properties.name}\n${unemployment.get(d.id)}%`);

svg.append("path")
.datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
.attr("fill", "none")
.attr("stroke", "white")
.attr("stroke-linejoin", "round")
.attr("d", path);

chartContainer.node().appendChild(svg.node());

// function UsStateChoropleth(data, {
//     features = states,
//     borders = statemesh,
//     width = 975,
//     height = 610,
//     ...options
// } = {}) {
//     return Choropleth(data, {features, borders, width, height, ...options});
// }

// chart = UsStateChoropleth(unemployment, {
//     id: d => namemap.get(d.name),
//     value: d => d.rate,
//     scale: d3.scaleQuantize,
//     domain: [1, 7],
//     range: d3.schemeBlues[6],
//     title: (f, d) => `${f.properties.name}\n${d?.rate}%`
// })

