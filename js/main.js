
var URL = "http://www.gobiernodecanarias.org/istac/jaxi-istac/tabla.do?accion=jsonMtd&uuidConsulta=c0bfe128-69f4-4751-85e1-6d46108acba9&?callback=?";
var title = "";         // Título del recurso que se está obteniendo.
var stub = "";          // Variables que van en las filas del dataset.
var heading = "";       // Variables que van en las columnas del dataset.
var categories = {}; 
var codes = {};
var labels = {};
var temporals = [];     // Variables que se corresponden con el cubrimiento temporal.
var spatials = [];      // Variables que se corresponden con el cubrimiento geográfico.
var cont_variable;      // Variable que actúa como dimensión de medida.
var surveyTitle = "";   // Título de la operación estadística en la que se publica el recurso.
var data = "";          // Información de las variables.
var valueMap = {};

$(document).ready(function(){
  $("#btnLocateMe").click(function(){
    findMyCurrentLocation();
  });
  
  $('#checkbox-value').change(function() {
    if($(this).is(":checked")) {
      d3.select("svg")
      .selectAll("text")
      .style('display', "block");
    } else {
      d3.select("svg")
      .selectAll("text")
      .style('display', "none");
    }
  });
  
});

$(document).on('pagecreate', '#page1', function() {
    $(".newSelect").remove();
    $("#page1").on("swiperight", function() {
        $("#left-panel").panel( "open");
    });
    loadData();
});

function loadData () {

        $.ajax({
            async : false,
            dataType: "json",
            url: "tmp/result.json",
            type : "GET",
            success: function(jsondata) {
                title = jsondata['title'];
                stub = jsondata['stub'];
                heading = jsondata['heading'];

                var tmp;
                
                tmp = jsondata['categories'];
                
                var variable = "";
                
                for(var i = 0; i < tmp.length; i++) {
                    variable = tmp[i]['variable'];
                    codes[variable] = tmp[i]['codes'];
                    labels[variable] = {};
                    for(var j = 0; j < tmp[i]['labels'].length; j++) {
                        labels[variable][tmp[i]['codes'][j]] = tmp[i]['labels'][j];
                    }
                }
                
                temporals = jsondata['temporals'];
                spatials = jsondata['spatials'];
                cont_variable = jsondata['contVariable'];
                surveyTitle = jsondata['surveyTitle'];
                
                data = jsondata['data'];
                for(var i = 0; i < data.length; i++) {
                    valueMap[data[i]['dimCodes']] = data[i]['Valor'];
                }

            },
            error:function(xhr){
              console.log("Error:");
              console.log(JSON.stringify(xhr));
              alert("An error occured: " + xhr.status + " " + xhr.statusText);
            }
        });   


        fillSelectors();
}

/**
*   Añade opciones a los menús desplegables.
*/
function fillSelectors() {

    var variable = '';
    var code = '';
    // Filas
    for(var i = 0; i < stub.length; i++) {
        variable = stub[i];
        $('#left-panel').append('<label for=\"select-s-' + i + '\">' + variable + ':</label>');
        $('<select/>', {
          name:         'select-s-' + i,
          id:           'select-s-' + i,
          'class':      'newSelect',
          'data-mini':  'true',
          'multiple' :  'multiple',
          'data-native-menu': 'false'
        }).appendTo('#left-panel');
        
        for(var j = 0; j < codes[variable].length; j++) {
            code = codes[variable][j];
            $('<option/>', {
                value: code,
                html: labels[variable][code]
            }).appendTo('#select-s-' + i);
        }
        // Selecciona por defecto la primera opción.
        $('#select-s-' + i + ' option:first').attr('selected','selected');
    }
    // Columnas
    for(var i = 0; i < heading.length; i++) {
        variable = heading[i];
        $('#left-panel').append('<label for=\"select-h-' + i + '\">' + variable + ':</label>');
        $('<select/>', {
          name:         'select-h-' + i,
          id:           'select-h-' + i,
          'class':      'newSelect',
          'data-mini':  'true',
          'multiple' :  'multiple',
          'data-native-menu': 'false'
        }).appendTo('#left-panel');

        for(var j = 0; j < codes[variable].length; j++) {
            code = codes[variable][j];
            $('<option/>', {
                value: code,
                html: labels[variable][code]
            }).appendTo('#select-h-' + i);
        }
        // Selecciona por defecto la primera opción.
        $('#select-h-' + i + ' option:first').attr('selected','selected');
    }
    $("#page1").trigger("create");  // Con esta línea los elementos del select toman el estilo adecuado.
    $("#selectors").trigger( "updatelayout" );
}

function draw() {
    var key = [];
    $(".newSelect").each(function (i) { 
        if ($(this).val() != '') {  // Comprueba que no está vacío.
           key.push($(this).val()); // Genera el array que será utilizado como key.
       }
    });
    var dataset = [];
    key = cartesian(key);
    for(var i = 0; i < key.length; i++) {
      dataset.push(valueMap[key[i]]);
    }
    drawBarChart(dataset);    
}

/*
 * Recibe como argumento un array de arrays.
 * Devuelve todas las posibles combinaciones de sus elementos. 
*/
function cartesian(arg) {
    var r = [], max = arg.length-1;
    function helper(arr, i) {
        for (var j=0, l=arg[i].length; j<l; j++) {
            var a = arr.slice(0);
            a.push(arg[i][j]);
            if (i==max) {
                r.push(a);
            } else
                helper(a, i+1);
        }
    }
    helper([], 0);
    return r;
};


function elementIs(value, index) {
  if(value[element['index']] == element['value']) return value;
}

function o(i, value) {
  var obj = {};
  obj['index'] = i;
  obj['value'] = value;
  return obj;
}

element = {'index' : 0, 'value' : 1};
