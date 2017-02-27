
// create the map
var map = L.map('map').setView([40, -95], 3);

    L.tileLayer('https://api.mapbox.com/styles/v1/katezellmer/ciuyj1kpx00hd2js59nk6alff/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2F0ZXplbGxtZXIiLCJhIjoiY2l1dDZpMHhkMDBrMTJ0bjBkNThmcDRtcCJ9.a7-sXy-HPat2xCkGnlKmJw', {
    maxZoom: 15
}).addTo(map);

//call getData function
getData(map);

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = .1;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};



function pointToLayer(feature, latlng) {
     // create marker options
    var attribute = "PopHomeless_2016";
    var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#AE3BFF",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    geojsonMarkerOptions.radius = calcPropRadius(attValue);

      //create circle marker layer
    var layer = L.circleMarker(latlng, geojsonMarkerOptions);

    //build popup content string starting with city...Example 2.1 line 24
    var popupContent = "<p><b>City:</b> " + feature.properties.City + "</p>";

    //add formatted attribute to popup content string
    var year = attribute.split("_")[1];
    popupContent += "<p><b>Population in " + year + ":</b> " + feature.properties[attribute] + " million</p>";
    //bind the popup to the circle marker
    layer.bindPopup(popupContent);

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;

}
// Step 3: Add circle markers for point features to the map
function createPropSymbols(data, map){
   //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: pointToLayer
    }).addTo(map);
}

//Step 1: Create new sequence controls
function createSequenceControls(map){
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');
    //$('#panel').append('<button class="skip" id="reverse">Reverse</button>');
    //$('#panel').append('<button class="skip" id="forward">Skip</button>');
    //$('#reverse').html('<img src="img/rewind.png">');
    //$('#forward').html('<img src="img/forward.png">');
        //set slider attributes
    $('.range-slider').attr({
        max: 20000,
        min: 0,
        value: 0,
        step: 100
    });

};

function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("Pop") > -1){
            attributes.push(attribute);
        };
    };

    //check result
    console.log(attributes);

    return attributes;
};

//Step 2: Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/HomelessPopulation.geojson", {
        dataType: "json",
        success: function(response){
            var attributes = processData(response);
            //call function to create proportional symbols
            createPropSymbols(response, map);
            createSequenceControls(map, attributes);

        }
    });
};