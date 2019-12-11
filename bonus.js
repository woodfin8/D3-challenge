
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

//initial params
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

console.log(chosenXAxis, chosenYAxis);

//function for updating x-scale on click
function xScale(healthData, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenXAxis]*0.9),
        d3.max(healthData, d => d[chosenXAxis]*1.1)
        ])
        .range([0, width]);
    return xLinearScale;
}

//function for updating y-scale on click
function yScale(healthData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenYAxis]*0.9),
        d3.max(healthData, d => d[chosenYAxis]*1.1)
        ])
        .range([height, 0]);
        console.log(d3.min(healthData,d => d[chosenYAxis]));
        console.log(d3.max(healthData,d => d[chosenYAxis])); 
        console.log(height);   
    return yLinearScale;
}

// function for updating xAxis var upon click
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}
//function for updating yAxis var upon click
function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}

// function used for updating circle placement
function renderCircles(circlesGroup, newXScale, newYScale) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}

// function for updating text placement
function renderText(textGroup, newXScale, newYScale){
    textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));
    return textGroup
}

// function used for updating tooltips
function updateToolTip(chosenXAxis, chosenYAxis,
    circlesGroup) {

    //conditional statemenets to get label names   
    if (chosenXAxis === "poverty" && chosenYAxis === "obesity") {
        var xlabel = "Poverty: ";
        var ylabel = "Obesity: ";
    }
    else if (chosenXAxis === "poverty" && chosenYAxis === "smokes") {
        var xlabel = "Poverty: ";
        var ylabel = "Smoking: "
    }

    else if (chosenXAxis === "income" && chosenYAxis === "obesity") {
        var xlabel = "Avg. Income: ";
        var ylabel = "Obesity: ";
    }
    else {
        var xlabel = "Avg. Income: "
        var ylabel = "Smoking: ";
    }

    //define tool Tip
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([60, -60])
        .html(function(d) {
            return (`${d.abbr}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
        });   

    //call tool Tip        
    circlesGroup.call(toolTip);

    //add mouseover and out events    
    circlesGroup.on("mouseover",function(data) {
        toolTip.show(data);
      })
        .on("mouseout",  function(data, index) {
            toolTip.hide(data);
          });

    return circlesGroup;
}

// Import Data which has the following fields
// poverty	povertyMoe	age	ageMoe	income	incomeMoe	healthcare	healthcareLow	healthcareHigh	obesity	obesityLow	obesityHigh	smokes	smokesLow	smokesHigh
d3.csv("data.csv").then(function(healthData, err) {
    if (err) throw err;
    //Parse through data set ensuring values we want are numeric 
    healthData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;;
        data.smokes = +data.smokes;
        data.age = +data.age;
    });
    // yLinearScale function
    var yLinearScale = yScale(healthData, chosenYAxis);
    // xLinearScale function 
    var xLinearScale = xScale(healthData, chosenXAxis);

 

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(healthData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 15)
        .attr("class", "stateCircle");

    //add text, need to select text.stateText to get all states to appear as axis were already called
    var textGroup = chartGroup.selectAll("text.stateText")
        .data(healthData)
        .enter()
        .append("text")
        .attr("class", "stateText")
        .text(d => d.abbr)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))

    // Create group for  2 x- axis labels
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .classed("aText", true)
        .text("Poverty Rate (%)");

    var incomeLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .classed("aText", true)
        .text("Avg. Income ($'s)");

    // Create group for 2 y-axis labels
    var ylabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)")

    var obesityLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (height / 2))
        .attr("value", "obesity")
        .classed("active", true)
        .classed("aText", true)
        .text("Obesity Rate (%)");

    var smokesLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left + 60)
        .attr("x", 0 - (height / 2))
        .attr("value", "smokes")
        .classed("inactive", true)
        .classed("aText", true)
        .text("Smoking Rate (%)");

        console.log(chosenYAxis);
    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var xvalue = d3.select(this).attr("value");
            if (xvalue !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = xvalue;
                chosenYAxis = ylabelsGroup.selectAll("text.active").attr("value");

                console.log(chosenXAxis);
                console.log(chosenYAxis);

                // updates x scale for new data
                xLinearScale = xScale(healthData, chosenXAxis);
                yLinearScale = yScale(healthData, chosenYAxis);

                // updates x axis with transition
                xAxis = renderXAxis(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale);

                //updates text with new values
                textGroup = renderText(textGroup, xLinearScale, yLinearScale)

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });

    //y axis labels event listener
    ylabelsGroup.selectAll("text")
    .on("click", function () {
        // get value of selection
        var yvalue = d3.select(this).attr("value");
        if (yvalue !== chosenYAxis) {

            // replaces chosenYAxis with value
            chosenXAxis = xlabelsGroup.selectAll("text.active").attr("value");
            chosenYAxis = yvalue;

            console.log(chosenXAxis);   
            console.log(chosenYAxis);

            // updates y scale for new data
            xLinearScale = xScale(healthData, chosenXAxis);
            yLinearScale = yScale(healthData, chosenYAxis);

            // updates y axis with transition
            yAxis = renderYAxis(yLinearScale, yAxis);

            // updates circles with new y values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale);

             //updates text with new values
            textGroup = renderText(textGroup, xLinearScale, yLinearScale)

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // changes classes to change bold text
            if (chosenYAxis === "obesity") {
                obesityLabel
                    .classed("active", true)
                    .classed("inactive", false);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else {
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
        }
    });

}).catch(function (error) {
    console.log(error);
});

