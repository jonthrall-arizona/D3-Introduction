/*
Jon Thrall 
CSC 444, Section 001 
*/

// Set constant dimensions for the SVG elements
const WIDTH = 600;
const HEIGHT = 300;

// --- Chart 1 ---
// Create and append an SVG element to div1
var svg1 = d3.select("#div1").append("svg")
    .attr("width", WIDTH)
    .attr("height", HEIGHT);

// Create and append rect elements for each data point in ukDriverFatalities
svg1.selectAll("rect")
    .data(ukDriverFatalities)
    // Append a 'rect' for each data point
    .enter().append("rect")
    .attr("width", function () { return Math.ceil(WIDTH / (1984 - 1969 + 1)); })
    .attr("height", function () { return Math.ceil(HEIGHT / 12); })
    .attr("x", function (d) { return Math.ceil(WIDTH / (1984 - 1969 + 1)) * (d.year - 1969); })
    .attr("y", function (d) { return Math.ceil(HEIGHT / 12) * (11 - d.month); })
    .attr("fill", function (d) { return color(d.count); });

// --- Chart 2 ---
// Create and append an SVG element to div2
var svg2 = d3.select("#div2").append("svg")
    .attr("width", WIDTH)
    .attr("height", HEIGHT);

// Create and append circle elements for each data point in ukDriverFatalities
svg2.selectAll("circle")
    .data(ukDriverFatalities)
    // Append a 'circle' for each data point
    .enter().append("circle")
    .attr("cx", function (d) { return Math.ceil(WIDTH / (1984 - 1969 + 1)) * (d.year - 1969 + 0.5); })
    .attr("cy", function (d) { return Math.ceil(HEIGHT / 12) * (11 - d.month + 0.5); })
    .attr("r", function (d) { return d.count / 500 * 3; })
    .attr("fill", "blue")
    .attr("stroke", "white");

// --- Chart 3 ---
// Create and append an SVG element to div3
var svg3 = d3.select("#div3").append("svg")
    .attr("width", WIDTH)
    .attr("height", HEIGHT);

// Create and append rect elements for each data point in ukDriverFatalities
svg3.selectAll("rect")
    .data(ukDriverFatalities)
    // Append a 'rect' for each data point
    .enter().append("rect")
    .attr("width", Math.ceil(WIDTH / ukDriverFatalities.length))
    .attr("height", function (d) { return d.count / 2500 * HEIGHT; })
    .attr("x", function (d, i) { return i * (WIDTH / ukDriverFatalities.length); })
    .attr("y", function (d) { return HEIGHT - (d.count / 2500 * HEIGHT); });

// --- Chart 4 ---
// Create and append an SVG element to div4
var svg4 = d3.select("#div4").append("svg")
    .attr("width", 500)
    .attr("height", 500);

// Create and append circle elements for each data point in ukDriverFatalities
svg4.selectAll("circle")
    .data(scores)
    // Append a 'circle' for each data point
    .enter().append("circle")
    .attr("cx", function (d) { return (d.GPA - 1.6) * 200; })
    .attr("cy", function (d) { return 500 - (d.ACT - 13) * 20; })
    .attr("r", function (d) { return d.SATV / 75; })
    .attr("fill", function (d) {
        // Set the fill color based on the SATM score
        var SATM = (d.SATM - 300) / 500;
        var red = SATM;
        var blue = 1 - SATM;
        return "#" + toHex(red * 255) + toHex(0) + toHex(blue * 255); // Modified from svg.js
    });

// --- Utility functions ---
// Taken from iteration_8.js
function clamp(v) {
    return Math.floor(Math.max(0, Math.min(255, v)));
}

// Taken from iteration_8.js
function rgb(r, g, b) {
    return "rgb(" + r + "," + g + "," + b + ")";
}

// Taken from iteration_8.js
function color(count) {
    var amount = (2500 - count) / 2500 * 255;
    var s = clamp(amount), s2 = clamp(amount / 2 + 127), s3 = clamp(amount / 2 + 127);
    return rgb(s, s2, s3);  
}

// Taken from svg.js
function toHex(v) {
    var str = "00" + Math.floor(Math.max(0, Math.min(255, v))).toString(16);
    return str.substr(str.length - 2); 
}
