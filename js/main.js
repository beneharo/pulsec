
var URL_INDICADORES = "assets/indicadores.json";
var URL = "http://banot.etsii.ull.es/alu4240/getJSON.php";
var BAR_CHART = 1;
var LINE_CHART = 2;
var DONUT_CHART = 3;
var title = "";         // Título del recurso que se está obteniendo.
var stub = "";          // Variables que van en las filas del dataset.
var heading = "";       // Variables que van en las columnas del dataset.
var categories = {}; 
var codes = {};
var labels = {};
var variables = [];     // Conjunto total de variables.
var temporals = [];     // Variables que se corresponden con el cubrimiento temporal.
var spatials = [];      // Variables que se corresponden con el cubrimiento geográfico.
var cont_variable;      // Variable que actúa como dimensión de medida.
var surveyTitle = "";   // Título de la operación estadística en la que se publica el recurso.
var data = "";          // Información de las variables.
var valueMap = {};
var indicador = "";
var periods = {}; // M: Mensual, Q: Trimestral, Y: Anual
var location;

$(document).ready(function(){
  var info = $("#page1-info");
  
  initializeSelect();
  //findMyCurrentLocation();
  
  $("#btnLocateMe").click(function(){
    findMyCurrentLocation();
  });
  
  $("#btn-page1").click(function(){
    if(indicador != $("#select-indicadores").val()) {   
      indicador = $("#select-indicadores").val();
      d3.selectAll("svg").remove();  // Borra el área de representación.
    info.show();                    // Muestra el mensaje de ayuda.
      try {
        loadData(indicador);
        initialize();
      } catch(err) {
         alert("Error: " + err.message + "\n\n");
         $(location).attr('href', 'index.html');
      }
    }
  });
  
  $("#btn-bar-chart").click(function(){
    info.hide();
    draw(BAR_CHART);
  });
  
  $("#btn-line-chart").click(function(){
    info.hide();
    draw(LINE_CHART);
  });
  
  $("#btn-donut-chart").click(function(){
    info.hide();
    draw(DONUT_CHART);
  });
  
  var $loading = $('#loadingDiv').hide();
  $(document)
    .ajaxStart(function () {
      $loading.show();
    })
    .ajaxStop(function () {
      $loading.hide();
    });
});

$(document).on('pagecreate', '#page1', function() {
    $(".newSelect").remove();
    $("#page1").on("swiperight", function() {
        $("#left-panel").panel("open");
    });
    $("#page1").on("swipeleft", function() {
        $("#right-panel").panel("open");
    });
    $("#left-panel").on("panelopen", function() {
        $("open-left-panel").buttonMarkup({ icon: "carat-l" });
    });
    $("#left-panel").on("panelclose", function() {
        $("open-left-panel").attr('data-icon','carat-r');
    });
    initialize();
    // Información de Geolocalización
    //$("#right-panel").html("Usted se encuentra en <h2>" +  location + "</h2>");
});

function initializeSelect() {
  $.ajax({
            async : false,
            dataType: "json",
            url: URL_INDICADORES,
            type : "GET",
            success: function(jsondata) {
                for(var i = 0; i < jsondata.length; i++) {
                  $('<option/>', {
                      value:  jsondata[i]['url'],
                      html:   jsondata[i]['indicador']
                  }).appendTo('#select-indicadores');
                }
            },
            error:function(xhr){
              console.log("Error:");
              console.log(JSON.stringify(xhr));
              alert("An error occured: " + xhr.status + " " + xhr.statusText);
            }
        });
  $("#select-indicadores").val($("#select-indicadores option:first").val());
  $("#select-indicadores").selectmenu("refresh");
}

function successJSON (jsondata) {
  // Reinicializar variables
  stub = "";
  heading = "";
  categories = {}; 
  codes = {};
  labels = {};
  variables = [];
  temporals = [];
  spatials = [];
  cont_variable = "";
  surveyTitle = "";
  data = "";
  valueMap = {};
  
  title = jsondata['title'];
  stub = jsondata['stub'];
  heading = jsondata['heading'];

  $("#hdr-h1").html(title);
  
  var tmp;
  
  tmp = jsondata['categories'];
  
  var variable = "";
  
  for(var i = 0; i < tmp.length; i++) {
      variable = tmp[i]['variable'];
      variables.push(variable);
      codes[variable] = tmp[i]['codes'];
      labels[variable] = {};
      for(var j = 0; j < tmp[i]['labels'].length; j++) {
          labels[variable][tmp[i]['codes'][j]] = tmp[i]['labels'][j];
      }
  }
  
  temporals = jsondata['temporals'];
  spatials = jsondata['spatials'];
  cont_variable = jsondata['contVariable'];
  // En caso de no existir, el vector quedará vacío.
  if(temporals == undefined) {
    temporals = [];
  }
  if(spatials == undefined) {
    spatials = [];
  }
  if(cont_variable == undefined) {
    cont_variable = "";
  }
  
  surveyTitle = jsondata['surveyTitle'];
  
  data = jsondata['data'];
  for(var i = 0; i < data.length; i++) {
      valueMap[data[i]['dimCodes']] = Number(data[i]['Valor']); // Conversión explícita a número
  }
  
  // Tratamiento de variables temporales
  var code = "";
  var regExpYear = /^\d{4}$/;     // Detección del código Anual
  var regExpM = /^\d{4}M\d{2}$/;  // Detección del código Mes
  var regExpQ = /^\d{4}Q\d{1}$/; // Detección del código Trimestre
  periods = {};                   // Se reinicia la variable.
  
  for(var i = 0; i < temporals.length; i++) {
    
    for(var j = 0; j < codes[temporals[i]].length; j++) {
      code = codes[temporals[i]][j];

      if(regExpYear.test(code)) {
        periods['Y'] = true;
      } else if(regExpM.test(code)) {
        periods['M'] = true;
      } else if(regExpQ.test(code)) {
        periods['Q'] = true;
      } else {
        // Variable sin contemplar
      }
    }
  }
}
/**
 * Carga la información del archivo JSON que se encuentre en la URL indicada. 
 */          
function loadData(urlData) {
  urlData = urlData.replace("&", ";;amp;;");
  $.ajax({
      async : false,
      data : {
        urlData : urlData
      },
      dataType: "text",
      url: URL,
      crossDomain: true,
      type : "GET",
      success: function(jsondata) {
          jsondata = jsondata.substring(1, jsondata.length-2); // Eliminar el primer y último paréntesis con el ;
          successJSON(JSON.parse(jsondata));
      },
      error:function(xhr){
        console.log("Error:");
        console.log(JSON.stringify(xhr));
        alert("Ha ocurrido un error: " + xhr.status + " " + xhr.statusText);
      }
  });
}

function fillSelectors(variable, type, index) {
  var values = {};
  var code = '';
  
  // Nombre de la variable
  $('#left-panel').append('<label for=\"select-' + type + '-' + index + '\">' + variable + ':</label>');
  
  // Comprueba que es una variable temporal
  if(temporals.indexOf(variable) != -1) {
    
    if(Object.keys(periods).length > 1) { // Si hay más de un tipo de periodo

      $('<div/>', {
          'data-role':       'ui-field-contain',
          'id':              'div-group'
        }).appendTo('#left-panel');
      
      $('<fieldset/>', {
          'data-role':       'controlgroup',
          'id':              'radio-group',
          'name':            'radio-group'
        }).appendTo('#div-group');
      
      if(periods['M'] != undefined) {
        $('<input/>', {
          'type':       'radio',
          'name':       'radio-b',
          'value':      'M',
          'id':         'radio-month'
        }).appendTo('#radio-group');
        $('<label/>', {
          'for':        'radio-month',
          html:         'Mensual'
        }).appendTo('#radio-group');
      }
      if(periods['Q'] != undefined) {
        $('<input/>', {
          'type':       'radio',
          'name':       'radio-b',
          'value':      'Q',
          'id':         'radio-term'
        }).appendTo('#radio-group');
        $('<label/>', {
          'for':        'radio-term',
          html:         'Trimestral'
        }).appendTo('#radio-group');
      }
      if(periods['Y'] != undefined) {
        $('<input/>', {
          'type':       'radio',
          'name':       'radio-b',
          'value':      'Y',
          'id':         'radio-year'
        }).appendTo('#radio-group');
        $('<label/>', {
          'for':        'radio-year',
          html:         'Anual'
        }).appendTo('#radio-group');
      }
      //Seleccionar el primer elemento radio por defecto
      $('input:radio[name=radio-b]:nth(0)').attr('checked',true);
      $(".radio-b").checkboxradio("refresh");
      
      $("#radio-group").bind( "change", function(event, ui) {
        fillTemporalSelectors('select-' + type + '-' + index, variable);
        // Selecciona las 5 primeras opciones por defecto
        for(var i = 0; i < 5; i++) {
          $("#" + selectorName + " option:eq(" + i + ")").prop('selected', true);
        }
        $("#" + selectorName).selectmenu("refresh");
      });
      
    }
    // Define el menú de selección
    $('<select/>', {
      name:         'select-' + type + '-' + index,
      id:           'select-' + type + '-' + index,
      'class':      'newSelect',
      'data-mini':  'true',
      'multiple' :  'multiple',
      'data-native-menu': 'false',
      'data-filter': 'true'
    }).appendTo('#left-panel');
    // Rellena el menú de selección
    var selectorName = 'select-' + type + '-' + index;
    fillTemporalSelectors(selectorName, variable);

    // Selecciona las 5 primeras opciones por defecto
    for(var i = 0; i < 5; i++) {
      $("#" + selectorName + " option:eq(" + i + ")").prop('selected', true);
    }
    // Seleccionar Todo
    //$("#" + selectorName + " option").each(function() {
      // $(this).attr('selected','selected');
    //});

  } else if(spatials.indexOf(variable) != -1) { // Variable Espacial
    // Define el menú de selección
    $('<select/>', {
      name:         'select-' + type + '-' + index,
      id:           'select-' + type + '-' + index,
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
      }).appendTo('#select-' + type + '-' + index);
    }
    
  } else { // Variable dimensión medida.
    // Define el menú de selección
    $('<select/>', {
      name:         'select-' + type + '-' + index,
      id:           'select-' + type + '-' + index,
      'class':      'newSelect',
      'data-mini':  'true',
      'data-native-menu': 'false'
    }).appendTo('#left-panel');
    
    for(var j = 0; j < codes[variable].length; j++) {
      code = codes[variable][j];
      $('<option/>', {
          value: code,
          html: labels[variable][code]
      }).appendTo('#select-' + type + '-' + index);
    }
  }
  
  // Selecciona por defecto la primera opción.
  $('#select-' + type + '-' + index + ' option:first').attr('selected','selected');
  
}
/**
 * Rellena los selectores de variables temporales. 
 */
function fillTemporalSelectors(selectorName, variable) {
  $('#' + selectorName).empty();
  
  var radioValue = $("#radio-group :radio:checked").val();
  var array = codes[variable];
     
  if(radioValue == 'Y') {
    array = array.filter(function(el) {
                          return /^\d{4}$/.test(el);
                        });
  } else if(radioValue == 'Q') {
    array = array.filter(function(el) {
                          return /^\d{4}Q\d{1}$/.test(el);
                        });
  } else if(radioValue == 'M') {
    array = array.filter(function(el) {
                          return /^\d{4}M\d{2}$/.test(el);
                        });
  } else {
    
  }
  
  for(var j = 0; j < array.length; j++) {
      code = array[j];
      
      $('<option/>', {
          value: code,
          html: labels[variable][code]
      }).appendTo('#' + selectorName);
  }

}
/**
*   Inicializa las opciones de los menús desplegables.
*/
function initialize() {
    
    var variable = '';
    
    $(".newSelect").remove();  
    $("#left-panel").empty();
    $("#right-panel").empty();

    // Filas
    for(var i = 0; i < stub.length; i++) {
        variable = stub[i];
        fillSelectors(variable, 's', i);
    }
    // Columnas
    for(var i = 0; i < heading.length; i++) {
        variable = heading[i];
        fillSelectors(variable, 'h', i);
    }
       
    $("#page1").trigger("create");  // Con esta línea los elementos del select toman el estilo adecuado.
    $("#selectors").trigger( "updatelayout" );

}

/**
 *  Prepara los datos y realiza la representación del gráfico según
 *   el tipo (chart) recibido como parámetro. 
 */
function draw(chart) {

    var temp = [];
    var key = [];
    var indexS = variables.indexOf(spatials[0]); // Controlar que no sea -1
    var indexT = variables.indexOf(temporals[0]);
    var diff = {};
    
    d3.selectAll("svg").remove();
    
    $(".newSelect").each(function (i) { 
        if ($(this).val() != '') {  // Comprueba que no está vacío.
           if (!($(this).val() instanceof Array)) { // En caso de selección simple, incluir la opción en un array de 1 elemento.
             temp = [];
             temp.push($(this).val());
             key.push(temp);
           } else {
             key.push($(this).val()); // Genera el array que será utilizado como key.
           }
       }
    });
    var dataset = [];
    var spatial; // Etiquetas de variables espaciales.
    var temporal; // Etiqueta de variables temporales.
    
    key = cartesian(key);
    
    for(var i = 0; i < key.length; i++) {
      temp = [];
      temp.push(key[i]);
      temp.push(valueMap[key[i]]);
      if(indexS != -1) {
        spatial = labels[variables[indexS]][key[i][indexS]];
        temp.push(spatial);
        if(diff[spatial] == undefined) {
          diff[spatial] = 0; // Array asociativo con las posibles opciones de etiquetas espaciales.
        }
      }
      if(indexT != -1) {
        temporal = labels[variables[indexT]][key[i][indexT]];
        temp.push(temporal);
      }
      dataset.push(temp);
    }
    // Ordenar cronológicamente
    dataset = dataset.sort(function(a,b) {
      return a[0][indexT] > b[0][indexT]; // Comparar columna con código de dato temporal.
    });
    
    assignColors(diff);
    
    // Selección del tipo de gráfico
    switch(chart) {
      case BAR_CHART:
        drawBarChart(dataset, diff);
        break;
      case LINE_CHART:
        drawLineChart(dataset, diff);
        break;
      case DONUT_CHART:
        drawDonutChart(dataset, diff);
        break;
    }
        
}

/*
 * Recibe un array asociativo con un conjunto de etiquetas a las que asociarles un color.
 * Modifica el mismo array para incluir los colores asignados.
 */
function assignColors(ar) {
  var colors = [
    "#008000", // Green
    "#FF4000", // OrangeRed
    "#000080", // Navy
    "#FFD800", // Gold
    "#FF00FF", // Magenta
    "#000000", // Black
    "#00FF00", // Lime
    "#FF0000", // Red
    "#0000FF", // Blue
    "#FFFF00", // Yellow
    "A05030", // Sienna
    "800080" // DarkMagenta
  ];
  var h, s, l, hsl;
  var size = 360 / ar.length;
  var i = 0;
  
  for(var k in ar) {
    //h = Math.floor(Math.random() * 360);
    //s = 1;
    //l = Math.random() * 0.5;
    //hsl = d3.hsl(h, s, l);
    ar[k] = colors[i];
    i++;
  }
  
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
