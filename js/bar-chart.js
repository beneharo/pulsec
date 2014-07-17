/**
 * Función para dibujar un gráfico de barras.
 * Cada barra representará una variable temporal diferente.
 * 
 * @param {Object} dataset
 * @param {Object} diff
 */

function drawBarChart(dataset, diff) {
   
  var margin = {top: 40, right: 40, bottom: 40, left: 40};
  var w = $("#page1-main").innerWidth() - margin.left - margin.right;
  var h = window.innerHeight - $("#page1-header").innerHeight() - $("#page1-footer").innerHeight() - margin.bottom - margin.top;
  var barPadding = 5;                                   // Separación entre las barras.
  var barWidth = (w / dataset.length) - barPadding;     // Anchura de cada una de las barras.
  var legend_width = 200;
  var legend_height = 500;
  
  var minMax = d3.extent(dataset.map(function(d) { return d[1];} ));
  var yMin = minMax[0] - minMax[0] * 0.1;
  var yMax = minMax[1];
  
  var xScale = d3.scale.linear()
    .domain([0, dataset.length])
    .range([0, w]);
  
  var yScale = d3.scale.linear()
          .domain([yMin, yMax])
          .range([h, 0]);
  
  var xAxis = d3.svg.axis().scale(xScale);
  var yAxis = d3.svg.axis().scale(yScale).ticks(5).orient("left");
  
  function Y0() {
    return yScale(0);
  }
  
  function Y(d) {
    return yScale(d[1]);
  }
  
  d3.selectAll("svg").remove();
  $("#page1-info").hide();
  
  var svg = d3.select("#graphics")
            .append("svg")
            .attr("width", w + margin.left + margin.right)
            .attr("height", h)
            .attr("preserveAspectRatio", "none")
            .append("g")
            .attr("transform", "translate(" + margin.left + ",0)");

  var g = svg.select("g")
          .attr("transform", "translate(" + margin.left + ",0)");

  var tip = d3.tip()
    .attr('class', 'tip')
    .offset([50, 0])
    .direction(function(d, i) { if(i < dataset.length / 2) {return 'ne';} else {return 'nw';} })
    .html(function(d) {
      return "<span class='tip-value'>" + d[1] + "</span></br><span>" + d[3] + "</span>";
  });
    
  svg.call(tip);
  
  var rgb = d3.rgb((Math.floor(Math.random() * 256)), (Math.floor(Math.random() * 256)), (Math.floor(Math.random() * 256)));
  
  svg.selectAll("rect")
   .data(dataset)
   .enter()
   .append("rect")
   .attr("x", function(d, i) {
      return xScale(i);
    })
   .attr("y", function(d) {
      return d[1] < 0 ? Y0() : Y(d);
    })
   .attr("width", barWidth)
   .attr("height", function(d) {
      return Math.abs( Y(d) - Y0() );
    })
   .attr("fill", function(d) {
      if(d[2] != undefined) {
        return diff[d[2]];
      } else {
        return rgb;
      }
    })
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide);
    //.on('mouseover', function(d) {$(this).attr("fill", rgb.brighter()); })
    //.on('mouseout', function(d) {$(this).attr("fill", diff[d[2]]); tip.hide;});
    
    // Añadir Ejes
    svg.append("g")
      .attr("class", "axis")  //Asignación de la clase "axis" (CSS)
      .attr("transform", "translate(0, 0)")
      .call(yAxis);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + h + ")")
      .call(xAxis);
   
   var legend = d3.select("#right-panel").append("svg")
      .attr("class", "legend")
      .attr("width", legend_width)
      .attr("height", legend_height)
      .selectAll("g")
      .data(Object.keys(diff))
      .enter().append("g")
      .attr("transform", function(d, i) { return "translate(" + margin.left + "," + i * 20 + ")"; });

  legend.append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", function(d) { return diff[d];});

  legend.append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .text(function(d) { return d;});
}
