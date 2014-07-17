/**
 * Función para dibujar un gráfico de líneas.
 * Cada donut representará una variable temporal diferente,
 * mientras que cada sección corresponderá a una variable geográfica.
 * 
 * @param {Object} dataset
 * @param {Object} diff
 */

function drawDonutChart(dataset, diff) {
  
  var margin = {top: 40, right: 20, bottom: 40, left: 20};
  var w = $("#page1-main").innerWidth() - margin.left - margin.right;
  var h = window.innerHeight - $("#page1-header").innerHeight() - margin.bottom - margin.top;
  var legend_width = 200;
  var legend_height = 500;
  
  var size = d3.max([w, h]) / 2; // El tamaño será la mitad de la pantalla para poder visualizar dos gráficos simultáneamente.
  var radius;
  var padding = 10;
  var arc;
  var pie;
  var hash = {};
  var label;
  
  function getPercent(d){
    return Math.round(1000*(d.endAngle-d.startAngle)/(Math.PI*2)) / 10 + '%';
  }
  
  // Ordenar de mayor a menor valor
  dataset = dataset.sort(function(a,b) {
    return a[1] < b[1]; // Comparar columna con código de dato temporal.
  });
  
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
      .attr("width", margin.left + margin.right + radius * 2)
      .attr("height", radius * 2)
    .append("g")
      .attr("transform", "translate(" + (margin.left + margin.right + radius) + "," + (radius) + ")");

  var tip = d3.tip()
    .attr('class', 'tip')
    .offset([50, 0])
    .direction(function(d, i) { if(i < dataset.length / 2) {return 'ne';} else {return 'nw';} })
    .html(function(d) {
      var percent = getPercent(d);
      return "<span class='tip-value'>" + percent + "</span></br><span>" + d.data.temporal + "</span>";
  });
    
  svg.call(tip);

  svg.selectAll(".arc")
      .data(function(d) { return pie(d); })
    .enter().append("path")
      .attr("class", "arc")
      .attr("d", arc)
      .style("fill", function(d) { return d.data.color; }) // Pie devuelve un array de arcos. La información original está dentro del objeto "data"
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);
  svg.append("text")
      .attr("dy", ".25em")
      .style("text-anchor", "middle")
      .text(function(d) { return d[0].temporal; });
  
  // Leyenda
  var legend = d3.select("#legend-panel").append("svg")
      .attr("class", "legend")
      .attr("width", legend_width)
      .attr("height", legend_height)
      .selectAll("g")
      .data(Object.keys(diff))
      .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

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