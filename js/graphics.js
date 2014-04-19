function drawBarChart(dataset) {
  
  var w = $("#page1-main").innerWidth();
  var h = 200;
  var barPadding = 1;
  var scale = 4;
  
  d3.select("svg").remove();

  var svg = d3.select("#graphics")
            .append("svg")
            .attr("width", w)
            .attr("height", h);
  
  svg.selectAll("rect")
   .data(dataset)
   .enter()
   .append("rect")
   .attr("x", function(d, i) {
      return i * (w / dataset.length);
    })
   .attr("y", function(d) {
      return h - d;  //Height minus data value
    })
   .attr("width", w / dataset.length - barPadding)
   .attr("height", function(d) {
      return d * scale;
    })
    .attr("fill", "teal");
   
   svg.selectAll("text")
       .data(dataset)
       .enter()
       .append("text")
       .text(function(d) {
          return d;
       })
       .attr("text-anchor", "middle")
       .attr("x", function(d, i) {
          return i * (w / dataset.length) + (w / dataset.length - barPadding) / 2;
       })
       .attr("y", function(d) {
          return h - (d * 4) + 14;
       })
       .attr("font-family", "sans-serif")
       .attr("font-size", "11px")
       .attr("fill", "white");
   
}
