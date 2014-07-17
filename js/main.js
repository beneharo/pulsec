
var URL_INDICADORES = "assets/indicadores.json";
var URL = "http://banot.etsii.ull.es/alu4240/getJSON.php";
var URL_SIZE = "http://banot.etsii.ull.es/alu4240/getSize.php";   // Script para determinar el tamaño del fichero JSON que será descargado.
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
var regions = {}; // P: Provincias, M: Municipios, C: Canarias, MC: Municipios Canarios
var geolocation;
var selMultiple = {}; // Control de las variables de selección multiple que han sido seleccionadas
var lastOpt = 0;      // Almacena la última opción seleccionada.
var regExpCCAA = /^ES\d{2}$/;             // Detección de Comunidades Autónomas
var regExpProvincia = /^ES\d{2}\d+$/;     // Detección de Provincias
var regExpCanarias = /^ES70\d$/;          // Detección de Islas Canarias
var regExpMunCanarias = /^3(5|8)\d{3}$/;  // Detección de municipios de Canarias
  

$(window).on("orientationchange", function(event) { 
  if($.mobile.activePage.attr('id') == "page1") {
    if(lastOpt != 0) {
      draw(lastOpt);
    }
  }; 
});

$(document).ready(function(){
  var info1 = $("#page1-info1");
  var info2 = $("#page1-info2");
  var rightPanelInfo = $("#right-panel-info");
  
  initializeSelect();
  //findMyCurrentLocation();
  
  $("#btnLocateMe").click(function(){
    findMyCurrentLocation();
  });
  
  $("#btn-page1").click(function(){
    if(indicador != $("#select-indicadores").val()) {   
      indicador = $("#select-indicadores").val();
      d3.selectAll("svg").remove();  // Borra el área de representación.
      info1.show();                   // Muestra el mensaje de ayuda.
      info2.show(); 
      lastOpt = 0;                   // La última opción cargada se reinicia.
      try {
        $loading.show();    // Muestra la pantalla de carga hasta que termine la carga de datos.
        loadData(indicador);
        initialize();
        $loading.hide();    // Oculta la pantalla de carga una vez ha finalizado la carga de datos.
      } catch(err) {
         alert("Error: " + err.message + "\n\n");
         $(location).attr('href', 'index.html');
      }
    }
  });
  
  $("#btn-bar-chart").click(function() {
    info1.hide();
    info2.hide();
    actualizarInformacion();
    lastOpt = BAR_CHART;
    draw(BAR_CHART);
  });
  
  $("#btn-line-chart").click(function() {
    info1.hide();
    info2.hide();
    actualizarInformacion();
    lastOpt = LINE_CHART;
    draw(LINE_CHART);
  });
  
  $("#btn-donut-chart").click(function() {
    info1.hide();
    info2.hide();
    actualizarInformacion();
    lastOpt = DONUT_CHART;
    draw(DONUT_CHART);
  });
  
  var $loading = $('#loadingDiv').hide();   // Por defecto la pantalla de carga no se mostrará.

});

$(document).on('pagecreate', '#page1', function() {
    $(".newSelect").remove();
    // Eventos de gestos en pantalla para abrir paneles laterales.
    $("#page1").on( "swipeleft swiperight", function( e ) {
        // Comprobar que no existe otro panel abierto.
        // Esto evitará que un gesto de cerrar un panel, abra el panel contrario.
        if ( $.mobile.activePage.jqmData( "panel" ) !== "open" ) {
          if ( e.type === "swipeleft"  ) {
            $( "#right-panel" ).panel( "open" );
          } else if ( e.type === "swiperight" ) {
            $( "#left-panel" ).panel( "open" );
          }
        }
      });
    
    $("#left-panel").on("panelopen", function() {
        $("open-left-panel").buttonMarkup({ icon: "carat-l" });
    });
    $("#left-panel").on("panelclose", function() {
        $("open-left-panel").attr('data-icon','carat-r');
    });
    $("#right-panel").on("panelopen", function() {
        $("open-right-panel").buttonMarkup({ icon: "carat-r" });
    });
    $("#right-panel").on("panelclose", function() {
        $("open-right-panel").attr('data-icon','carat-l');
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
  selMultiple = {};
  
  title = jsondata['title'];
  stub = jsondata['stub'];
  heading = jsondata['heading'];

  $("#ftr-h1").html(title);
  
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
  
  // Para cada variables temporal...
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
  
  // Tratamiento de variables espaciales 
  regions = {};
  
  for(var i = 0; i < spatials.length; i++) {
    for(var j = 0; j < codes[spatials[i]].length; j++) {
      code = codes[spatials[i]][j];
      
      if(regExpCCAA.test(code)) {
        regions['CCAA'] = true;
      } else if(regExpCanarias.test(code)) {
        regions['C'] = true;
      } else if(regExpProvincia.test(code)) {
        regions['P'] = true;
      }  else if(regExpMunCanarias.test(code)) {
        regions['MC'] = true;
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
  var txt = $("#loadingText").text();
  txt = txt.replace(/\((.|\s)*\)/, "");
  $("#loadingText").text(txt);
  
  // Calcular el tamaño del fichero a descargar.
  var xhr = $.ajax({
    data : {
      urlData : indicador
    },
    dataType: "text",
    url: URL_SIZE,
    crossDomain: true,
    success: function(msg){
      var txt = $("#loadingText").text() + "(" + msg + ")";
      $("#loadingText").text(txt);
    }
  });
  
  $.ajax({
      async : false,
      data : {
        urlData : urlData
      },
      dataType: "text",
      url: URL,
      //url: urlData,
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
        for(var i = 1; i <= 5; i++) {
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

    $("#" + selectorName).change(function(event) { 
        var old_array = selMultiple[selectorName];
        var new_array = $("#" + selectorName).val();
        // Cuando un menú de selección está vacío, JQuery devuelve null a través de la función val().
        // Para solventarlo, si en algún caso se detecta "null" se inicializará a la variable con un array vacío.
        if(old_array == null) {
          old_array = [];
        }
        if(new_array == null) {
          new_array = [];
        }
        
        // Si se marca la opción Seleccionar todo
        if(diffArray(new_array, old_array).indexOf("__SELECT_ALL") != -1) {
          // Seleccionar Todo
          $("#" + selectorName + " option").each(function() {
            $(this).prop('selected', true);
          });
          selMultiple[selectorName] = $("#" + selectorName).val();
        } else 
        // Si se desmarca la opción Seleccionar todo
        if(diffArray(old_array, new_array).indexOf("__SELECT_ALL") != -1) {
          // Deseleccionar Todo
          $("#" + selectorName).val([]);
          selMultiple[selectorName] = [];
        } else {
          selMultiple[selectorName] = $("#" + selectorName).val();
        }
        // Refresca el menú para observar los cambios hechos en la interfaz gráfica.
        $("#" + selectorName).selectmenu('refresh', true);
      });

    // Selecciona las 5 primeras opciones por defecto
    for(var i = 1; i <= 5; i++) {
      $("#" + selectorName + " option:eq(" + i + ")").prop('selected', true);
    }
    selMultiple[selectorName] = $("#" + selectorName).val();
    
  } else if(spatials.indexOf(variable) != -1) { // Variable Espacial

    if(Object.keys(regions).length > 1) { // Si hay más de un tipo de región
      $('<div/>', {
          'data-role':       'ui-field-contain',
          'id':              'div-group-region'
        }).appendTo('#left-panel');
      
      $('<fieldset/>', {
          'data-role':       'controlgroup',
          'id':              'radio-group-region',
          'name':            'radio-group-region'
        }).appendTo('#div-group-region');
      // Opción para cargar todas las variables
      $('<input/>', {
        'type':       'radio',
        'name':       'radio-r',
        'value':      'ALL',
        'id':         'radio-all'
      }).appendTo('#radio-group-region');
      $('<label/>', {
        'for':        'radio-all',
        html:         'Todo'
      }).appendTo('#radio-group-region');

      if(regions['CCAA'] != undefined) {
        $('<input/>', {
          'type':       'radio',
          'name':       'radio-r',
          'value':      'CCAA',
          'id':         'radio-ccaa'
        }).appendTo('#radio-group-region');
        $('<label/>', {
          'for':        'radio-ccaa',
          html:         'Comunidades Autónomas'
        }).appendTo('#radio-group-region');
      }
      if(regions['P'] != undefined) {
        $('<input/>', {
          'type':       'radio',
          'name':       'radio-r',
          'value':      'P',
          'id':         'radio-provincia'
        }).appendTo('#radio-group-region');
        $('<label/>', {
          'for':        'radio-provincia',
          html:         'Provincias'
        }).appendTo('#radio-group-region');
      }
      if(regions['C'] != undefined) {
        $('<input/>', {
          'type':       'radio',
          'name':       'radio-r',
          'value':      'C',
          'id':         'radio-canarias'
        }).appendTo('#radio-group-region');
        $('<label/>', {
          'for':        'radio-canarias',
          html:         'Canarias'
        }).appendTo('#radio-group-region');
      }
      if(regions['MC'] != undefined) {
        $('<input/>', {
          'type':       'radio',
          'name':       'radio-r',
          'value':      'MC',
          'id':         'radio-mun-canarias'
        }).appendTo('#radio-group-region');
        $('<label/>', {
          'for':        'radio-mun-canarias',
          html:         'Municipios de Canarias'
        }).appendTo('#radio-group-region');
      }
      //Seleccionar el primer elemento radio por defecto
      $('input:radio[name=radio-r]:nth(0)').attr('checked',true);
      $(".radio-r").checkboxradio("refresh");
      
      $("#radio-group-region").bind( "change", function(event, ui) {
        fillSpatialSelectors('select-' + type + '-' + index, variable);
        // Selecciona la primera opcion por defecto
        $("#" + selectorName + " option:eq(1)").prop('selected', true);
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
      'data-native-menu': 'false'
    }).appendTo('#left-panel');
    
    // Rellena el menú de selección
    var selectorName = 'select-' + type + '-' + index;
    fillSpatialSelectors(selectorName, variable);
    // Evento de cambio
    $("#" + selectorName).change(function(event) { 
      var old_array = selMultiple[selectorName];
      var new_array = $("#" + selectorName).val();
      // Cuando un menú de selección está vacío, JQuery devuelve null a través de la función val().
      // Para solventarlo, si en algún caso se detecta "null" se inicializará a la variable con un array vacío.
      if(old_array == null) {
        old_array = [];
      }
      if(new_array == null) {
        new_array = [];
      }
      // Si se marca la opción Seleccionar todo
      if(diffArray(new_array, old_array).indexOf("__SELECT_ALL") != -1) {
        // Seleccionar Todo
        $("#" + selectorName + " option").each(function() {
          $(this).prop('selected', true);
        });
        selMultiple[selectorName] = $("#" + selectorName).val();
      } else 
      // Si se desmarca la opción Seleccionar todo
      if(diffArray(old_array, new_array).indexOf("__SELECT_ALL") != -1) {
        // Deseleccionar Todo
        $("#" + selectorName).val([]);
        selMultiple[selectorName] = [];
      } else {
        selMultiple[selectorName] = $("#" + selectorName).val();
      }
      // Refresca el menú para observar los cambios hechos en la interfaz gráfica.
      $("#" + selectorName).selectmenu('refresh', true);
     
    });

    // Marca la primera opción por defecto
    $("#" + selectorName + " option:eq(1)").prop('selected', true);
    
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
  
  // Opción "Seleccionar todo"
  // Marcándola se seleccionarán todas las opciones, desmarcándola se deseleccionará todo.
  var opt = $('<option/>', {
      value: "__SELECT_ALL",
      html: "Seleccionar todo"
  });

  opt.appendTo('#' + selectorName);
  
  // Ordenar los periodos de más reciente a menos reciente 
  array = array.sort(function(a,b) {
    return a < b;
  });
  
  for(var j = 0; j < array.length; j++) {
      code = array[j];
      
      $('<option/>', {
          value: code,
          html: labels[variable][code]
      }).appendTo('#' + selectorName);
  }

}
/**
 * Rellena los selectores de variables espaciales. 
 */
function fillSpatialSelectors(selectorName, variable) {

  $('#' + selectorName).empty();
  
  var radioValue = $("#radio-group-region :radio:checked").val();
  var array = codes[variable];
     
  if(radioValue == 'CCAA') { // Comunidades Autónomas
    array = array.filter(function(el) {
                          return regExpCCAA.test(el);
                        });
  } else if(radioValue == 'P') {
    array = array.filter(function(el) {
                          return regExpProvincia.test(el);
                        });
  } else if(radioValue == 'C') {
    array = array.filter(function(el) {
                          return regExpCanarias.test(el);
                        });
  } else if(radioValue == 'MC') {
    array = array.filter(function(el) {
                          return regExpMunCanarias.test(el);
                        });
  } else { // En caso contrario, cargar todas las variables.
    // No se filtra el array.
  }
  
  // Opción "Seleccionar todo"
  // Marcándola se seleccionarán todas las opciones, desmarcándola se deseleccionará todo.
  var opt = $('<option/>', {
      value: "__SELECT_ALL",
      html: "Seleccionar todo"
  });
  
  opt.appendTo('#' + selectorName);
  
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
    $("#right-panel-info").show();

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
             temp = [];
             temp = $(this).val();
             if(temp.indexOf("__SELECT_ALL") != -1) { // Si detecta esta opción, la elimina antes de utilizarla en la representación.
               temp.shift();
             }
             key.push(temp); // Genera el array que será utilizado como key.
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
    "#A05030", // Sienna
    "#800080", // DarkMagenta
    "#90C830", // YellowGreen
    "#800000", // DarkRed
    "#80D0F0", // LightSkyBlue
    "#D0A020", // GoldenRod
    "#F08070", // Salmon
    "#800080", // Purple
    "#C0C0C0" // Silver
  ];
  var h, s, l, hsl;
  var size = 360 / ar.length;
  var i = 0;
  
  for(var k in ar) {
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

/**
 * Diferencia entre dos arrays.
 * Devuelve el array diferencia. 
 */
function diffArray(a, b) {
  var seen = [], diff = [];
  for( var i = 0; i < b.length; i++) {
    seen[b[i]] = true;
  }
  for(var i = 0; i < a.length; i++) {
    if(!seen[a[i]]) {
      diff.push(a[i]);
    }
  }
  return diff;
}

/**
 * Actualiza la información de panel lateral derecho. 
 */
function actualizarInformacion() {
  var info = $("#right-panel-info");
  var text = "Actualmente en pantalla: </br>";
   $(".newSelect").each(function (i) { 
        if ($(this).val() != '') {  // Comprueba que no está vacío.
           if (!($(this).val() instanceof Array)) { // Información de los elementos de selección simple
              var id = $(this).attr('id');
              var label = $("label[for='" + id + "']").html().replace(":", "");
              var val = labels[label][$(this).val()];
              text += "<p><b>" + label + ":</b>  " + val + "</p>";
           } else { // Elementos de selección múltiple
             var id = $(this).attr('id');
             var label = $("label[for='" + id + "']").html().replace(":", "");
             if(temporals.indexOf(label) != -1) { // Incluir rango temporal seleccionado (primero y último)
               var code1 = $(this).val()[$(this).val().length - 1];
               var code2 = $(this).val()[0];
               var p1 = labels[label][code1];
               var p2 = labels[label][code2];
               text += "<p>Periodo comprendido entre <b>" + p1 + "</b> y <b>" + p2 + "</b></p>";
             }
           }
         }
   });

  info.html(text);
}
