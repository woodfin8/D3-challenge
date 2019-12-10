
//define svg area size and margin
var svgWidth = 850;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 20
};

// define chart size
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

//create svg wrapper
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

//define chart group
var chartGroup = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


// Import Data which has the following fields
// poverty	povertyMoe	age	ageMoe	income	incomeMoe	healthcare	healthcareLow	healthcareHigh	obesity	obesityLow	obesityHigh	smokes	smokesLow	smokesHigh
d3.csv("data.csv").then(healthData => {


    //Parse through data set ensuring values we want are numeric 
    healthData.forEach(data => {
      data.poverty = +data.poverty;
      data.obesity = +data.obesity;;
      data.smokes = +data.smokes;
    });

    // Create scale functions
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, data => data.poverty * 0.9), 
                d3.max(healthData,data => data.poverty * 1.1)])
      .range([0, width]);

    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, data => data.obesity * 0.9), 
        d3.max(healthData,data => data.obesity * 1.1)])
      .range([height, 0]);

    // Create axis functions and append to chart
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);


  
    //Create scatter plot circles
    // ==============================
    chartGroup.selectAll("circle")
    .data(healthData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.poverty))
    .attr("cy", d => yLinearScale(d.obesity))
    .attr("r", "15")
    .attr("fill", "blue")
    .attr("opacity", ".5");

    //add text, need to select text.stateText to get all states to appear as axis were already called
    var textselection = chartGroup.selectAll("text.stateText")
    .data(healthData);

    textselection.enter()
    .append("text")
    .attr("class", "stateText")
    .text(d => d.abbr)
    .attr("x", d => xLinearScale(d.poverty))
    .attr("y", d =>yLinearScale(d.obesity))
    .attr("font-family", "sans-serif")
    .attr("font-size", "10px")
    .attr("fill", "white");


// selection.enter()
//     .append("div")
//     .classed("temps", true)
//     .merge(selection)
//     .style("height", function(d) {
//       return d + "px";
//     });



    // chartGroup.selectAll("text")
    // .data(healthData)
    // .enter()
    // .append("text")
    // .text(d => d.abbr)
    // .attr("x", d => xLinearScale(d.poverty))
    // .attr("y", d =>yLinearScale(d.obesity))
    // .attr("font-family", "sans-serif")
    // .attr("font-size", "10px")
    // .attr("fill", "white")
    // .attr("transform", "translate(-8,4)");


    // Create axis labels
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("dy", 0 - margin.left + 40)
      .attr("dx", 0 - (height / 2))
      .attr("class", "aText")
      .text("Obesity Rate");

    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "aText")
      .text("Poverty Rate");
  }).catch(function(error) {
    console.log(error);
  });

