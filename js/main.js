
var URL_INDICADORES = "tmp/indicadores.json";
var URL = "http://banot.etsii.ull.es/alu4240/getJSON.php";
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
var indicador = "";
var periods = {}; // M: Mensual, Q: Trimestral, Y: Anual

$(document).ready(function(){
  
  initializeSelect();

  $("#btnLocateMe").click(function(){
    findMyCurrentLocation();
  });
  
  $("#btn-page1").click(function(){
    if(indicador != $("#select-indicadores").val()) {   
      indicador = $("#select-indicadores").val();
      loadData(indicador);
      initialize();
    }
    
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
        $("#left-panel").panel( "open");
    });
    initialize();
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
  temporals = [];
  spatials = [];
  cont_variable = "";
  surveyTitle = "";
  data = "";
  valueMap = {};
  
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
      valueMap[data[i]['dimCodes']] = data[i]['Valor'];
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
        alert("An error occured: " + xhr.status + " " + xhr.statusText);
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
    $('<label/>', {
      'for':        'select-flipswitch-' + type + '-' + index,
      html:         'Rango'
    }).appendTo('#left-panel');
    $('<select/>', {
      name:         'select-flipswitch-' + type + '-' + index,
      id:           'select-flipswitch-' + type + '-' + index,
      'data-role':  'flipswitch',
      'data-native-menu': 'false'
    }).appendTo('#left-panel');
    $('<option/>', {
        value: 'si',
        html: 'Sí'
    }).appendTo('#select-flipswitch-' + type + '-' + index);
    $('<option/>', {
        value: 'no',
        html: 'No'
    }).appendTo('#select-flipswitch-' + type + '-' + index);
    
    // RangeSlider
    
    $('<div/>', {
                id:             'rangeslider' + type + '-' + index,
                'class':        'rslider',
                'data-role':    'rangeslider'
    }).appendTo('#left-panel');
    // Izquierdo
    $('<input/>', {
        id:             'range' + type + '-' + index,
        'type':         'range',
        'min':          '0',
        'max':          '100',
        'value':        '40'
    }).appendTo('#rangeslider' + type + '-' + index);
    // Derecho
    $('<input/>', {
        id:             'range' + type + '-' + index,
        'type':         'range',
        'min':          '0',
        'max':          '100',
        'value':        '80'
    }).appendTo('#rangeslider' + type + '-' + index);
    
    $('#select-flipswitch-' + type + '-' + index).on("change", function () {
        if($(this).val() == 'si') {
            $('.rslider').show();
        } else {
            $('.rslider').hide();
        }
    });
    
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
      
      $(".radio-b").checkboxradio("refresh");
      
      $("#radio-group").bind( "change", function(event, ui) {
        fillTemporalSelectors('select-' + type + '-' + index, variable);
        $("#" + selectorName + ' option:first').attr('selected','selected');
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

function draw() {
    var temp = [];
    var key = [];
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
