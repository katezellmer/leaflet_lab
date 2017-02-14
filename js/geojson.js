var map = L.map('mapid').setView([40, 20], 3);

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
};

//function to retrieve the data and place it on the map
function getData(map){
    //load the data
    $.ajax("data/MegaCities.geojson", {
        dataType: "json",
        success: function(response){

        	// declaring the marker options
        	var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#AE3BFF",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.9
            };

            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(response, {
            	// adding the feature details
            	onEachFeature: onEachFeature,
            	// adding the stylized markers
            	pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);
        }
    });
};

