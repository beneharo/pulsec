/**
 * @author Beneharo González
 */

function findMyCurrentLocation(){
  var geoService = navigator.geolocation;
  if (geoService) {
    navigator.geolocation.getCurrentPosition(showCurrentLocation, errorHandler);
  } else {
    $("#searchResults").html("Your Browser does not support GeoLocation.");
  }
}
 
function showCurrentLocation(position){
  $("#searchResults").html("Your location details: <br> Current Latitude : " + position.coords.latitude + " , Longitude : " + position.coords.longitude);
  
  $.ajax({
  type: 'GET',
  url: "http://open.mapquestapi.com/nominatim/v1/reverse?lat=" + position.coords.latitude + "&lon=" + position.coords.longitude,
  data: {
    key: "value"
  },
  dataType: "xml",
  success: function (xml) {
    geolocation = $(xml).find('state').first().text();
    alert("Su localización es: " + geolocation);
  }   
});
}
 
function errorHandler(error) {
  $("#searchResults").html("Error while retrieving current position. Error code: " + error.code + ",Message: " + error.message);
}