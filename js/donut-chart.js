/**
 * Función para dibujar un gráfico de líneas.
 * Cada donut representará una variable temporal diferente,
 * mientras que cada sección corresponderá a una variable geográfica.
 * 
 * @param {Object} dataset
 * @param {Object} diff
 */

function drawDonutChart(dataset, diff) {
  
  var margin = {top: 40, right: 20, bottom: 40, left: 40};
  var w = $("#page1-main").innerWidth() - margin.left - margin.right;
  var h = window.innerHeight - $("#page1-header").innerHeight() - margin.bottom - margin.top;
  var legend_width = 200;
  var legend_height = 500;
  
  var size = d3.min([w, h]);
  
  var radius;
  var padding = 10;
  
  var arc;

  var pie;

  var hash = {};
  var label;
  
  dataset.forEach(function(d) {
    label = d[3];
    if(hash[label] == undefined) {
      hash[label] = [];
    }
    hash[label].push({data: d[1], color: diff[d[2]], spatial: d[2], temporal: label});

  });
  var vector = d3.values(hash);
  
  radius = size / 2; // Calcular el radio para que el área del donut abarque el máximo de la pantalla.
  
  arc = d3.svg.arc()
      .outerRadius(radius)
      .innerRadius(radius - 40);
  pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.data; }); // Valor
        
  var svg = d3.select("#graphics").selectAll(".pie")
      .data(vector)
    .enter().append("svg")
      .attr("class", "pie")
      .attr("width", radius * 2 + margin.right + margin.left)
      .attr("height", radius * 2 + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + (radius) + "," + (radius) + ")");

  svg.selectAll(".arc")
      .data(function(d) { return pie(d); })
    .enter().append("path")
      .attr("class", "arc")
      .attr("d", arc)
      .style("fill", function(d) { return d.data.color; }); // Pie devuelve un array de arcos. La información original está dentro del objeto "data"

  svg.append("text")
      .attr("dy", ".25em")
      .style("text-anchor", "middle")
      .text(function(d) { return d[0].temporal; });
  
  // Leyenda
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