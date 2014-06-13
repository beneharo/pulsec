/*
 * 
 * Función para dibujar un gráfico de líneas.
 * Cada línea representará una variable geográfica diferente.
 * 
 */
function drawLineChart(dataset, diff) {
  
  var margin = {top: 40, right: 20, bottom: 40, left: 40};
  var w = $("#page1-main").innerWidth() - margin.left - margin.right;
  var h = window.innerHeight - $("#page1-header").innerHeight() - margin.bottom - margin.top;
  var legend_width = 200;
  var legend_height = 500;  
  
  var data = {}; // Hash Nombre - Array de datos.
  // Inicializar arrays
  for(var i in diff) {
    data[i] = []; // Array vacío para cada dato geográfico.
  }
  for(var i = 0; i < dataset.length; i++) {
    data[dataset[i][2]].push(dataset[i][1]); // Incluir valor en el array correspondiente.
  }
  
  var x = d3.scale
    .linear()
    .domain([0, data[Object.keys(diff)[0]].length - 1]) // TODO // Cambiar esto. (-1)
    .range([0, w]);
  
  var y = d3.scale
    .linear()
    .domain(d3.extent(dataset.map(function(d) { return d[1];} )))
    .range([h, 0])
    .nice();

  var line;
  var lines = {};
  for(var spatial in diff) {
     line = d3.svg.line();
     line.x(function(d,i) { 
        return x(i); 
      })
      .y(function(d) { 
          return y(d);
      });
      lines[spatial] = line;
  }

  var graph = d3.select("#graphics").append("svg")
        .attr("width", w + margin.right + margin.left)
        .attr("height", h + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var xAxis = d3.svg.axis().scale(x);

  graph.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + h + ")")
        .call(xAxis);

  var yAxisLeft = d3.svg.axis().scale(y).ticks(5).orient("left");
  
  graph.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(0, 0)")
        .call(yAxisLeft);
  
  for(var l in data) {
    graph.append("path")
      .attr("d", lines[l](data[l]))
      .attr("stroke", diff[l]);
  }
  
  // Crear leyenda
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