import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import Polygon from 'ol/geom/Polygon';
import Point from 'ol/geom/Point';
import Overlay from 'ol/Overlay';
import Draw, {createRegularPolygon, createBox} from 'ol/interaction/Draw';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {OSM, Vector as VectorSource} from 'ol/source';
import {Zoom,ZoomSlider,ScaleLine,Control} from 'ol/control';
import {transform} from 'ol/proj';
import Feature from 'ol/feature';
import {Style, Icon} from 'ol/style';
var raster = new TileLayer({
  source: new OSM()
});

var source = new VectorSource({wrapX: false});

var vector = new VectorLayer({
  source: source
});
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');
var coordinateSeismometer=[9109096.38139622,3435589.142878548];
var coordinateGeigerCounter=[9704104.692179251,3114044.2476574136];
var overlay = new Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250
  }
});

//start marker
var icons=[];
var vectorSource = new VectorSource({
  features: icons
});

var vectorLayer = new VectorLayer({
  source: vectorSource
});
//end marker

var map = new Map({
  layers: [raster, vector,vectorLayer],
  overlays: [overlay],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 1
  })
});
var key;
function makeAJAXrequest(dataforAJAX) {
  
  $.ajax({
    url: 'http://localhost:8080/52n-sos-webapp/service',
    type: 'POST',
    data: dataforAJAX,
    contentType: 'application/json; charset=utf-8',
    success: function (response) {
         var ret=response;
         handleResponse(ret);
         
    },
    error: function () {
        alert("error");
    }
  });
}
function initInputs(){
  document.getElementById("xMin").value="";
  document.getElementById("yMin").value="";
  document.getElementById("xMax").value="";
  document.getElementById("yMax").value="";
  document.getElementById("descSensorResponse").value="";
  var checkBoxes=[
    "radiation",
    "seismic",
    "waterlevel",
    "windspeed"
  ];
  for (var i = 3; i >= 0; i--) {
    document.getElementById(checkBoxes[i]).checked=false;
  }
}
function initMapControls(){
  var myZoom = new Zoom();
  var myZoomSlider = new ZoomSlider();
  var myScaleLine = new ScaleLine();
  map.addControl(myZoom);
  map.addControl(myZoomSlider);
  map.addControl(myScaleLine);  
}
var xmin,xmax,ymin,ymax;
var draw;
function addInteraction() {
  var value = 'Circle';
  var geometryFunction = createBox();
  
  draw = new Draw({
    source: source,
    type: value,
    geometryFunction: geometryFunction
  });
  map.addInteraction(draw);
}
source.on('addfeature', function(evt){
    var feature = evt.feature;
    var coords = feature.getGeometry().getCoordinates();

    xmax=coords[0][1][0];
    ymin=coords[0][1][1];
    xmin=coords[0][3][0];
    ymax=coords[0][3][1];
    
    
    
    
    
    draw.setActive(false);
    document.getElementById("xMin").value=xmin;
    document.getElementById("yMin").value=ymin;
    document.getElementById("xMax").value=xmax;
    document.getElementById("yMax").value=ymax;

});
document.getElementById("setSpatialFilter").onclick=function getSpatialParameter() {
  var spatialFilter=document.getElementById("selectSpatialFilter").value;
  
  addInteraction();
};

document.getElementById("sendCapabilities").onclick=function getCapabilities() {
  var dataAJAX=JSON.stringify({
    "request": "GetCapabilities",
    "service": "SOS",
    "sections": [
      "ServiceIdentification",
      "ServiceProvider",
      "OperationsMetadata",
      "FilterCapabilities",
      "Contents"
    ]
  });
  key=1;
  makeAJAXrequest(dataAJAX);
  setTimeout(function(){
    
  }, 20000000);
};
document.getElementById("desc").onclick=function descSensor() {
  var sel=document.getElementById("selectSensor");
  var selectedSensor="";
  for ( var i = 0, len = sel.options.length; i < len; i++ ) {
     var opt = sel.options[i];
    if ( opt.selected === true ) {
        selectedSensor=opt.value;
        break;
    }
  }
  var dataAJAX=JSON.stringify({
      "request": "DescribeSensor",
      "service": "SOS",
      "version": "2.0.0",
      "procedure": "http://www.52north.org/test/procedure/9",
      "procedureDescriptionFormat": "http://www.opengis.net/sensorml/2.0"
    });
  key=1;
  makeAJAXrequest(dataAJAX);
  setTimeout(function(){
    
  }, 20000000);
};


document.getElementById("selectSensor").onblur=function showSensor() {
  closer.onclick = function() {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
  };
  var selectedSensor="";
  
  var sel=document.getElementById("selectSensor");
  for ( var i = 0, len = sel.options.length; i < len; i++ ) {
   var opt = sel.options[i];
    if ( opt.selected === true ) {
        selectedSensor=opt.value;
        break;
    }
  }
  if(selectedSensor=="Seismometer"){
    content.innerHTML = "<p>Seismometer<p><p>Pauri Garhwal</p>";
    overlay.setPosition(coordinateSeismometer);
    map.getView().animate({
    center: coordinateSeismometer,
    zoom: 13,
    duration: 2000});
  }
  else{
    content.innerHTML = "<p>Geiger Counter<p><p>Roorke</p>";
    overlay.setPosition(coordinateGeigerCounter);
    map.getView().animate({
    center: coordinateGeigerCounter,
    zoom: 13,
    duration: 2000});
  }
};
document.getElementById("getObservations").onclick=function getObservations() {
  var dataAJAX=JSON.stringify({
    "request": "GetObservation",
    "service": "SOS",
    "version": "2.0.0"
  });
  key=2;
  makeAJAXrequest(dataAJAX);
  setTimeout(function(){
    
  }, 2000);
};
function filterSpatialy() {
  var dataAJAX=JSON.stringify({
    "request": "GetObservation",
    "service": "SOS",
    "version": "2.0.0",
    "spatialFilter": {
      "bbox": {
        "ref": "http://www.opengis.net/req/omxml/2.0/data/samplingGeometry",
        "value": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                Number(document.getElementById("xMin").value),
                Number(document.getElementById("yMin").value)
              ],
              [
                Number(document.getElementById("xMin").value),
                Number(document.getElementById("yMax").value)
              ],
              [
                Number(document.getElementById("xMax").value),
                Number(document.getElementById("yMax").value)
              ],
              [
                Number(document.getElementById("xMax").value),
                Number(document.getElementById("yMin").value)
              ],
              [
                Number(document.getElementById("xMin").value),
                Number(document.getElementById("yMin").value)
              ]
            ]
          ]
        }
      }
    }
  });
  key=3;
  makeAJAXrequest(dataAJAX);
};
document.getElementById("filterSpatial").onclick=function filterSpatialy() {
  var dataAJAX=JSON.stringify({
    "request": "GetObservation",
    "service": "SOS",
    "version": "2.0.0"
  });
  key=3;
  makeAJAXrequest(dataAJAX);
};
document.getElementById("filterTemporal").onclick=function filterTime() {
  var sel=document.getElementById("selectSpatialFilter");
  var selectedFilter="";
  for ( var i = 0, len = sel.options.length; i < len; i++ ) {
   var opt = sel.options[i];
    if ( opt.selected === true ) {
        selectedFilter=opt.value;
        break;
    }
  }
  if(selectedFilter=="Before time"){
    filterPast();
  }
  else{
    filterFuture();
  }
};
function filterPast() {
  
  var datePast=new Date(document.getElementById("dateBefore").value);
  var timePast=document.getElementById("timeBefore").value;
  
  
  var year=(datePast.getFullYear()).toString();
  var month=(1+datePast.getMonth()).toString();
  var day=(datePast.getDate()).toString();
  if(1+datePast.getMonth()<10){
    month="0"+month;
  }
  if(1+datePast.getDate()<10){
    day="0"+day;
  }
  
  
  
  var temp=year+"-"+month+"-"+day+"T14:08:00+01:00";
  
  
  var dataAJAX=JSON.stringify({
    "request": "GetObservation",
    "service": "SOS",
    "version": "2.0.0",
    "temporalFilter": [
      {
        "before": {
          "ref": "om:phenomenonTime",
          "value": temp
        }
      }
    ]
  });
  key=2;
  makeAJAXrequest(dataAJAX);
  setTimeout(function(){
    
  }, 2000);
}
function filterFuture() {
  var dateFuture=new Date(document.getElementById("dateAfter").value);
  var timeFuture=document.getElementById("timeAfter").value;
  var year=(dateFuture.getFullYear()).toString();
  var month=(1+dateFuture.getMonth()).toString();
  var day=(dateFuture.getDate()).toString();
  if(1+dateFuture.getMonth()<10){
    month="0"+month;
  }
  if(1+dateFuture.getDate()<10){
    day="0"+day;
  }
  var temp=year+"-"+month+"-"+day+"T14:08:00+01:00";
  var dataAJAX=JSON.stringify({
    "request": "GetObservation",
    "service": "SOS",
    "version": "2.0.0",
    "temporalFilter": [
      {
        "after": {
          "ref": "om:phenomenonTime",
          "value": temp
        }
      }
    ]
  });
  key=2;
  makeAJAXrequest(dataAJAX);
  setTimeout(function(){
    
  }, 20000000);
}
function writeResponse(ret){
  document.getElementById("descSensorResponse").value=JSON.stringify(ret);
}
function showrows(ret){
  var table=document.getElementById("tableBody")
  table.innerHTML="";
  for (var i = 0; i < ret.observations.length; i++) {
    var observationName=ret.observations[i].featureOfInterest.name.value;
    var observationIdentifier=ret.observations[i].observableProperty;
    var observationResult=ret.observations[i].result.value;
    var observationCoordinate=ret.observations[i].featureOfInterest.geometry.coordinates;
    writeIntoTable(observationName,observationIdentifier,observationResult,observationCoordinate);
    
  }

  
}
function writeIntoTable(observationName,observationIdentifier,observationResult,observationCoordinate) {
  var selectObservationType=[false,false,false,false];
  var propertyKey=[
    "http://www.52north.org/test/observableProperty/9_3",
    "http://www.52north.org/test/observableProperty/9_4",
    "http://www.52north.org/test/observableProperty/9_5",
    "http://www.52north.org/test/observableProperty/9_6"
  ];
  var observationRealName=["Radiation","Seismic Activity","Water level","Wind speed"];
  var checkBoxes=[
    "radiation",
    "seismic",
    "waterlevel",
    "windspeed"
  ];
  for (var i = 3; i >= 0; i--) {
    if(document.getElementById(checkBoxes[i]).checked==true&&propertyKey[i]==observationIdentifier){
      writeEntry(observationName,observationResult,observationCoordinate,observationRealName[i]);
      addMarker(observationName,observationResult,observationCoordinate);
    }
  }
}
function writeEntry(observationName,observationResult,observationCoordinate,observationRealName) {

  var table=document.getElementById("tableBody");
  var rowCount = table.rows.length;
  var row = document.createElement("TR");
  var button=document.createElement("button");
  button.style["width"]="100%";button.style["margin"]="0%";button.style["padding"]="0%";
  button.type="button";
  button.classList.add("btn");button.classList.add("btn-default");
  button.onclick=function showObservationOnMap() {
    var markerText="<p>Feature-"+
    observationName+
    "</p>"+
    "<p>Property-"+
    observationRealName+
    "</p>"+
    "<p>Value-"+
    observationResult+
    "</p>";
    showObservation(observationCoordinate,markerText);
  };
  var cell1 = document.createElement("TD");
  cell1.style["width"]="50%";cell1.style["margin-left"]="10%";cell1.style["margin-right"]="50%";cell1.style["padding"]="0%";cell1.style["text-align"]="left";
  var cell2 = document.createElement("TD");
  cell2.style["width"]="10%";cell2.style["margin"]="0%";cell2.style["margin-right"]="50%";cell2.style["padding"]="0%";cell2.style["text-align"]="right";
  var cell3 = document.createElement("TD");
  cell3.style["width"]="20%";cell3.style["margin"]="0%";cell3.style["padding"]="0%";cell3.style["text-align"]="right";cell3.style["float"]="right";
  var newTable=document.createElement("table");
  var newRow=document.createElement("TR");
  var newCol=document.createElement("TD");
  cell1.innerHTML = observationName;
  cell2.innerHTML = observationRealName;
  cell3.innerHTML = observationResult;
  newRow.appendChild(cell1);
  newRow.appendChild(cell2);
  newRow.appendChild(cell3);
  newTable.appendChild(newRow);
  button.appendChild(newTable);
  newCol.appendChild(button);
  row.appendChild(newCol);
  table.appendChild(row);
}
function addMarker(observationName,observationResult,observationCoordinate) {
  var iconFeature = new Feature({
    geometry: new Point(observationCoordinate),
    name: observationName,
    observedValue: observationResult
  });
  vectorSource.addFeatures([iconFeature]);
}
function removeMarkers(){
  vectorSource.clear();
}
function showObservation(location,text) {
  closer.onclick = function() {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
  };

  content.innerHTML = text;
  overlay.setPosition(location);
  map.getView().animate({
  center: location,
  zoom: 13,
  duration: 2000});
  
}
function handleResponse(ret) {
  
  if(key==1){
    writeResponse(ret);
  }
  if(key==2){
    //writeResponse(ret);
    removeMarkers();
    showrows(ret);
  }
  if(key==3){
    //writeResponse(ret);
    removeMarkers();
    showRowsSpatial(ret);
  }
  map.getView().animate({
    center: [0,0],
    zoom: 2,
    duration: 2000
  });
  closer.dispatchEvent(new MouseEvent("click"));
}
function showRowsSpatial(ret) {
  var table=document.getElementById("tableBody")
  table.innerHTML="";
    var xMin=Number(document.getElementById("xMin").value);
    var yMin=Number(document.getElementById("yMin").value);
    var xMax=Number(document.getElementById("xMax").value);
    var yMax=Number(document.getElementById("yMax").value);  
  for (var i = 0; i < ret.observations.length; i++) {
    var observationName=ret.observations[i].featureOfInterest.name.value;
    var observationIdentifier=ret.observations[i].observableProperty;
    var observationResult=ret.observations[i].result.value;
    var observationCoordinate=ret.observations[i].featureOfInterest.geometry.coordinates;  
    if(observationCoordinate[0]<=xMax&&observationCoordinate[0]>=xMin&&observationCoordinate[1]<=yMax&&observationCoordinate[1]>=yMin){
      writeIntoTable(observationName,observationIdentifier,observationResult,observationCoordinate);  
    }
  }
}
initMapControls();
initInputs();




//chart
/*var ctx = document.getElementById('myChart').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});*/