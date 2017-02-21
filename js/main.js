// create the map
var map = L.map('mapid').setView([40, -80], 4);

    L.tileLayer('https://api.mapbox.com/styles/v1/katezellmer/ciuyj1kpx00hd2js59nk6alff/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2F0ZXplbGxtZXIiLCJhIjoiY2l1dDZpMHhkMDBrMTJ0bjBkNThmcDRtcCJ9.a7-sXy-HPat2xCkGnlKmJw', {
    maxZoom: 15
}).addTo(map);

    //call getData function
    getData(map);

function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };

    L.geoJson(response, {
        onEachFeature: onEachFeature,
    }).addTo(map);
};

// Step 3: Add circle markers for point features to the map
function createPropSymbols(data, map){
    // create marker options
    var attribute = "PopHomeless_2016";
    var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#AE3BFF",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.9
    };

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

    // create a Leaflet GeoJSON layer and add it to the map
    L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            onEachFeature: onEachFeature

            //Step 5: For each feature, determine its value for the selected attribute
            var attValue = Number(feature.properties[attribute]);

            //examine the attribute value to check that it is correct
            geojsonMarkerOptions.radius = calcPropRadius(attValue);

            //create circle markers
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    }).addTo(map);
}

function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};

//Step 2: Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/HomelessPopulation.geojson", {
        dataType: "json",
        success: function(response){
            //call function to create proportional symbols
            createPropSymbols(response, map);
        }
    });
};
