function drawBarChart(dataset, diff) {
   
  var margin = {top: 20, right: 75, bottom: 20, left: 75};
  var w = $("#page1-main").innerWidth() - margin.left - margin.right;
  var h = 200;
  var barPadding = 1;                                   // Separación entre las barras.
  var barWidth = (w / dataset.length) - barPadding;     // Anchura de cada una de las barras.
  
  var xScale = d3.scale.linear()
    .domain([0, dataset.length])
    .range([0, w]);

  var yScale = d3.scale.linear()
          .domain(d3.extent(dataset.map(function(d) { return d[1];} )))
          .range([h, 0])
          .nice();
  
  var xAxis = d3.svg.axis().scale(xScale);
  var yAxis = d3.svg.axis().scale(yScale).ticks(5).orient("left");
  
  assignColors(diff);
  
  function Y0() {
    return yScale(0);
  }
  
  function Y(d) {
    return yScale(d[1]);
  }
  
  d3.selectAll("svg").remove();

  var svg = d3.select("#graphics")
            .append("svg")
            .attr("width", w + margin.left + margin.right)
            .attr("height", h + margin.top + margin.bottom)
            .attr("preserveAspectRatio", "none")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var g = svg.select("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-3, 0])
  .html(function(d) {
    return "<span style='color:red'>" + d[0] + "; " + d[1] + "</span>";
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
    
    // Añadir Ejes
    svg.append("g")
      .attr("class", "axis")  //Asignación de la clase "axis" (CSS)
      .attr("transform", "translate(0, 0)")
      .call(yAxis);
      
   var legend = d3.select("#right-panel").append("svg")
      .attr("class", "legend")
      .attr("width", 100)
      .attr("height", 100)
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

/*
 * Recibe un array asociativo con un conjunto de etiquetas a las que asociarles un color.
 * Modifica el mismo array para incluir los colores asignados.
 */
function assignColors(ar) {
  var size = Object.keys(ar).length;
  var t = 255 / size;
  var r, g, b, rgb;
  r = 0;
  g = t/2;
  b = t;

  for(var k in ar) {
    rgb = d3.rgb(r, g, b);
    ar[k] = rgb;
    r += t;
    g += t;
    b += t;
  }
  
}