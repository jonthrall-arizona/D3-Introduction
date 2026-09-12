/*
Jon Thrall
CSC 444, Section 001

Four D3 charts built from two datasets:
  - ukDriverFatalities: monthly UK driver fatality counts, 1969-1984
  - scores: Calvin College senior GPA / ACT / SAT scores

Each chart follows the standard D3 margin convention: an outer SVG sized to
its container, with an inner <g> translated by the margin so axes have room
to render.
*/

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEARS = d3.range(1969, 1985); // 1969..1984 inclusive

// --------------------------------------------------------------------------
// Shared helpers
// --------------------------------------------------------------------------

// Creates the outer <svg> and returns the inner translated <g>, given a
// container selector and total/margin dimensions.
function makeChartArea(containerId, width, height, margin) {
  const svg = d3.select(containerId)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  return { svg, g };
}

function addAxisLabel(g, text, x, y, rotate) {
  g.append("text")
    .attr("class", "axis-label")
    .attr("x", x)
    .attr("y", y)
    .attr("text-anchor", "middle")
    .attr("transform", rotate ? `rotate(-90, ${x}, ${y})` : null)
    .text(text);
}

// Draws a horizontal color-gradient legend for a continuous color scale.
function addColorLegend(g, colorScale, x, y, width, height, minLabel, maxLabel, defsId) {
  const defs = g.append("defs");
  const gradient = defs.append("linearGradient")
    .attr("id", defsId)
    .attr("x1", "0%").attr("x2", "100%")
    .attr("y1", "0%").attr("y2", "0%");

  const stops = d3.range(0, 1.01, 0.1);
  stops.forEach(t => {
    const [d0, d1] = colorScale.domain();
    gradient.append("stop")
      .attr("offset", `${t * 100}%`)
      .attr("stop-color", colorScale(d0 + t * (d1 - d0)));
  });

  g.append("rect")
    .attr("x", x).attr("y", y)
    .attr("width", width).attr("height", height)
    .style("fill", `url(#${defsId})`)
    .attr("stroke", "#e2e0d8");

  g.append("text")
    .attr("class", "legend-label")
    .attr("x", x)
    .attr("y", y + height + 14)
    .text(minLabel);

  g.append("text")
    .attr("class", "legend-label")
    .attr("x", x + width)
    .attr("y", y + height + 14)
    .attr("text-anchor", "end")
    .text(maxLabel);
}

// --------------------------------------------------------------------------
// Chart 1 - Heatmap: fatalities by year (x) and month (y), color = count
// --------------------------------------------------------------------------
(function chart1() {
  const margin = { top: 10, right: 20, bottom: 90, left: 55 };
  const width = 680, height = 400;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const { g } = makeChartArea("#div1", width, height, margin);

  const x = d3.scaleBand().domain(YEARS).range([0, innerWidth]).padding(0.06);
  const y = d3.scaleBand().domain(d3.range(12)).range([0, innerHeight]).padding(0.06);
  const color = d3.scaleSequential(d3.interpolateBlues)
    .domain(d3.extent(ukDriverFatalities, d => d.count));

  g.selectAll("rect")
    .data(ukDriverFatalities)
    .enter().append("rect")
    .attr("x", d => x(d.year))
    .attr("y", d => y(d.month))
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .attr("fill", d => color(d.count))
    .append("title")
    .text(d => `${MONTH_NAMES[d.month]} ${d.year}: ${d.count} fatalities`);

  g.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x).tickValues(YEARS.filter(yr => yr % 1 === 0)))
    .selectAll("text")
    .attr("transform", "rotate(-40)")
    .style("text-anchor", "end");

  g.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y).tickFormat(m => MONTH_NAMES[m]));

  addAxisLabel(g, "Year", innerWidth / 2, innerHeight + 58);
  addAxisLabel(g, "Month", -40, innerHeight / 2, true);

  addColorLegend(
    g, color,
    0, innerHeight + 70, 180, 12,
    "Fewer fatalities", "More fatalities",
    "heatmap-legend"
  );
})();

// --------------------------------------------------------------------------
// Chart 2 - Bubble view of the same fatality data, area encodes count
// --------------------------------------------------------------------------
(function chart2() {
  const margin = { top: 10, right: 20, bottom: 150, left: 55 };
  const width = 680, height = 470;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const { g } = makeChartArea("#div2", width, height, margin);

  const x = d3.scaleBand().domain(YEARS).range([0, innerWidth]).padding(0.06);
  const y = d3.scaleBand().domain(d3.range(12)).range([0, innerHeight]).padding(0.06);
  const countExtent = d3.extent(ukDriverFatalities, d => d.count);
  // Square-root scale so bubble *area* (not radius) tracks count. The domain is
  // the actual data range (not [0, max]) so the full radius range is used to
  // show contrast between months - anchoring at 0 here would compress every
  // real value into the top ~35% of the scale, since fatality counts never
  // get near zero, making the bubbles hard to tell apart.
  const r = d3.scaleSqrt()
    .domain(countExtent)
    .range([2, Math.min(x.bandwidth(), y.bandwidth()) / 2]);

  g.selectAll("circle.data-point")
    .data(ukDriverFatalities)
    .enter().append("circle")
    .attr("class", "data-point")
    .attr("cx", d => x(d.year) + x.bandwidth() / 2)
    .attr("cy", d => y(d.month) + y.bandwidth() / 2)
    .attr("r", d => r(d.count))
    .attr("fill", "#1f5673")
    .attr("fill-opacity", 0.75)
    .attr("stroke", "#ffffff")
    .append("title")
    .text(d => `${MONTH_NAMES[d.month]} ${d.year}: ${d.count} fatalities`);

  g.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x).tickValues(YEARS))
    .selectAll("text")
    .attr("transform", "rotate(-40)")
    .style("text-anchor", "end");

  g.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y).tickFormat(m => MONTH_NAMES[m]));

  addAxisLabel(g, "Year", innerWidth / 2, innerHeight + 48);
  addAxisLabel(g, "Month", -40, innerHeight / 2, true);

  // Size legend: sits below the axis/label row, out of the plot area.
  // Three reference bubbles share one baseline so a bigger circle simply
  // reaches higher, rather than each circle being centered independently
  // (which is what made them look randomly placed before).
  const legendValues = [countExtent[0], d3.mean(countExtent), countExtent[1]];
  const legendCenterX = innerWidth / 2;
  const slotSpacing = 90;
  const baselineY = innerHeight + 95;

  const legend = g.append("g").attr("class", "size-legend");

  legend.selectAll("circle")
    .data(legendValues)
    .enter().append("circle")
    .attr("cx", (d, i) => legendCenterX + (i - 1) * slotSpacing)
    .attr("cy", d => baselineY - r(d))
    .attr("r", d => r(d))
    .attr("fill", "none")
    .attr("stroke", "#6b6f76");

  // Baseline the bubbles sit on, so it's clear they're being compared on
  // the same footing.
  legend.append("line")
    .attr("x1", legendCenterX - slotSpacing - 16)
    .attr("x2", legendCenterX + slotSpacing + 16)
    .attr("y1", baselineY)
    .attr("y2", baselineY)
    .attr("stroke", "#e2e0d8");

  legend.selectAll("text.legend-value")
    .data(legendValues)
    .enter().append("text")
    .attr("class", "legend-label legend-value")
    .attr("x", (d, i) => legendCenterX + (i - 1) * slotSpacing)
    .attr("y", baselineY + 16)
    .attr("text-anchor", "middle")
    .text(d => Math.round(d));

  legend.append("text")
    .attr("class", "legend-label")
    .attr("x", legendCenterX)
    .attr("y", baselineY + 34)
    .attr("text-anchor", "middle")
    .text("fatalities per month");
})();

// --------------------------------------------------------------------------
// Chart 3 - Bar chart: fatalities over time, one bar per month, 1969-1984
// --------------------------------------------------------------------------
(function chart3() {
  const margin = { top: 10, right: 20, bottom: 50, left: 55 };
  const width = 680, height = 340;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const { g } = makeChartArea("#div3", width, height, margin);

  const parsed = ukDriverFatalities.map(d => ({
    ...d,
    date: new Date(d.year, d.month, 1)
  }));

  const x = d3.scaleTime()
    .domain(d3.extent(parsed, d => d.date))
    .range([0, innerWidth]);
  const y = d3.scaleLinear()
    .domain([0, d3.max(parsed, d => d.count)]).nice()
    .range([innerHeight, 0]);

  const barWidth = innerWidth / parsed.length;

  g.selectAll("rect")
    .data(parsed)
    .enter().append("rect")
    .attr("x", d => x(d.date))
    .attr("y", d => y(d.count))
    .attr("width", Math.max(barWidth - 1, 1))
    .attr("height", d => innerHeight - y(d.count))
    .attr("fill", "#1f5673")
    .append("title")
    .text(d => `${MONTH_NAMES[d.month]} ${d.year}: ${d.count} fatalities`);

  // Annotate the January 1983 seatbelt law, visible as a sharp drop. The
  // line sits near the right edge of the chart, so the label is anchored to
  // grow leftward (not rightward, which ran it off the canvas) and split
  // across two short lines to keep it compact.
  const lawDate = new Date(1983, 0, 1);
  g.append("line")
    .attr("x1", x(lawDate)).attr("x2", x(lawDate))
    .attr("y1", 0).attr("y2", innerHeight)
    .attr("stroke", "#c53030")
    .attr("stroke-dasharray", "4,3");

  const lawLabelX = x(lawDate) - 8;
  const lawLabel = g.append("text")
    .attr("class", "legend-label")
    .attr("fill", "#c53030")
    .attr("text-anchor", "end");
  lawLabel.append("tspan").attr("x", lawLabelX).attr("y", 12).text("Seatbelt law");
  lawLabel.append("tspan").attr("x", lawLabelX).attr("y", 26).text("Jan 1983");

  g.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x).ticks(d3.timeYear.every(2)).tickFormat(d3.timeFormat("%Y")));

  g.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y).ticks(5));

  addAxisLabel(g, "Year", innerWidth / 2, innerHeight + 40);
  addAxisLabel(g, "Fatalities per month", -42, innerHeight / 2, true);
})();

// --------------------------------------------------------------------------
// Chart 4 - Scatter: GPA vs ACT, bubble size = SAT Verbal, color = SAT Math
// --------------------------------------------------------------------------
(function chart4() {
  const margin = { top: 10, right: 20, bottom: 60, left: 55 };
  const width = 520, height = 460;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const { g } = makeChartArea("#div4", width, height, margin);

  const x = d3.scaleLinear()
    .domain(d3.extent(scores, d => d.GPA)).nice()
    .range([0, innerWidth]);
  const y = d3.scaleLinear()
    .domain(d3.extent(scores, d => d.ACT)).nice()
    .range([innerHeight, 0]);
  const r = d3.scaleSqrt()
    .domain(d3.extent(scores, d => d.SATV))
    .range([2, 11]);
  const color = d3.scaleLinear()
    .domain(d3.extent(scores, d => d.SATM))
    .range(["#2b6cb0", "#c53030"]);

  g.selectAll("circle")
    .data(scores)
    .enter().append("circle")
    .attr("cx", d => x(d.GPA))
    .attr("cy", d => y(d.ACT))
    .attr("r", d => r(d.SATV))
    .attr("fill", d => color(d.SATM))
    .attr("fill-opacity", 0.7)
    .attr("stroke", "#ffffff")
    .attr("stroke-width", 0.5)
    .append("title")
    .text(d => `GPA ${d.GPA.toFixed(2)}, ACT ${d.ACT}\nSAT Verbal ${d.SATV}, SAT Math ${d.SATM}`);

  g.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x));

  g.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y));

  addAxisLabel(g, "GPA", innerWidth / 2, innerHeight + 40);
  addAxisLabel(g, "ACT score", -40, innerHeight / 2, true);

  addColorLegend(
    g, color,
    0, innerHeight + 48, 160, 12,
    "Low SAT Math", "High SAT Math",
    "scatter-legend"
  );
})();
