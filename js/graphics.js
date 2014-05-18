function drawBarChart(dataset) {
  
  var margin = {top: 20, right: 40, bottom: 20, left: 50};
  var w = $("#page1-main").innerWidth() - margin.left - margin.right;
  var h = 200;
  var barPadding = 1;
  var scale = 4;
  var barWidth = (w / dataset.length) - barPadding;
  var axePadding = 40;
  
  d3.select("svg").remove();

  var svg = d3.select("#graphics")
            .append("svg")
            .attr("width", w + margin.left + margin.right)
            .attr("height", h + margin.top + margin.bottom)
            .attr("preserveAspectRatio", "none")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");;
  
  var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-5, 0])
  .html(function(d) {
    return "<span style='color:red'>" + d + "</span>";
  });
    
  svg.call(tip);
  
  var xScale = d3.scale.linear()
    .domain([0, dataset.length])
    .range([0, w]);

  var yScale = d3.scale.linear()
    .domain([d3.min(dataset), d3.max(dataset)])
    .range([h, 0]);
  
  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom");

  var yAxis = d3.svg.axis()
                  .scale(yScale)
                  .orient("left")
                  .ticks(5);
  
  svg.selectAll("rect")
   .data(dataset)
   .enter()
   .append("rect")
   .attr("x", function(d, i) {
      //return i * (w / dataset.length);
      return xScale(i);
    })
   .attr("y", function(d) {
      return yScale(d);
    })
   .attr("width", barWidth)
   .attr("height", function(d) {
      return h - yScale(d);
    })
    .attr("fill", "green")
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide);
  
   svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0, 0)")
    .call(yAxis);
    
}
