// create the map
var map = L.map('map').setView([40, -95], 3);

    L.tileLayer('https://api.mapbox.com/styles/v1/katezellmer/ciuyj1kpx00hd2js59nk6alff/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2F0ZXplbGxtZXIiLCJhIjoiY2l1dDZpMHhkMDBrMTJ0bjBkNThmcDRtcCJ9.a7-sXy-HPat2xCkGnlKmJw', {
    maxZoom: 10
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

function pointToLayer(feature, latlng, attributes) {
     // assign current attribute based on the first index of the attributes array
    var attribute = attributes[0];
    console.log(attribute);
    
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

    createPopup(feature.properties, attribute, layer, geojsonMarkerOptions.radius);

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
}

// Step 3: Add circle markers for point features to the map
function createPropSymbols(data, map, attributes){
   //create a Leaflet GeoJSON layer and add it to the map
    var featuresLayer = L.geoJson(data, {
        pointToLayer: function(feature, latlng){

            return pointToLayer(feature, latlng, attributes);
        } 
    }).addTo(map);
    implementSearch(data, map, featuresLayer);
}

function createSequenceControls(map, attributes){
        var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function (map) {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

            //create range input element (slider)
            $(container).append('<input class="range-slider" type="range">');
            //add skip buttons
            $(container).append('<button class="skip" id="reverse" title="Reverse">Reverse</button>');
            $(container).append('<button class="skip" id="forward" title="Forward">Skip</button>');

            //kill any mouse event listeners on the map
            $(container).on('mousedown dblclick', function(e){
                L.DomEvent.stopPropagation(e);
            });

            return container;
        }
    });

    map.addControl(new SequenceControl());

    $('#reverse').html('<img src="img/rewind.png">');
    $('#forward').html('<img src="img/forward.png">');
        //set slider attributes
    $('.range-slider').attr({
        max: 6,
        min: 0,
        value: 0,
        step: 1
    });

    //Below Example 3.6 in createSequenceControls()
    //Step 5: click listener for buttons
    $('.skip').click(function(){
        //get the old index value
        var index = $('.range-slider').val();

        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 6 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 6 : index;
        };

        //Step 8: update slider
        $('.range-slider').val(index);
        //Called in both skip button and slider event listener handlers
        //Step 9: pass new attribute to update symbols
        updatePropSymbols(map, attributes[index]);
    });

    //Step 5: input listener for slider
    $('.range-slider').on('input', function(){
        //Step 6: get the new index value
        var index = $(this).val();
        //Called in both skip button and slider event listener handlers
        //Step 9: pass new attribute to update symbols
        updatePropSymbols(map, attributes[index]);
    });
};

function createLegend(map, attributes) {
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            //add temporal legend div to container
            $(container).append('<div id="temporal-legend">')

            //Step 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="160px" height="60px">';

            //array of circle names to base loop on
            var circles = ["max", "mean", "min"];

            //Step 2: loop to add each circle and text to svg string
            for (var i=0; i<circles.length; i++){
                //circle string
                svg += '<circle class="legend-circle" id="' + circles[i] + 
                '" fill="#F47821" fill-opacity="0.8" stroke="#000000" cx="30"/>';
            };

            //close svg string
            svg += "</svg>";

            //add attribute legend svg to container
            $(container).append(svg);

            return container;
        }
    });

    map.addControl(new LegendControl());

    updateLegend(map, attributes[0]);
}

//Calculate the max, mean, and min values for a given attribute
function getCircleValues(map, attribute){
    //start with min at highest possible and max at lowest possible number
    var min = Infinity,
        max = -Infinity;

    map.eachLayer(function(layer){
        //get the attribute value
        if (layer.feature){
            var attributeValue = Number(layer.feature.properties[attribute]);

            //test for min
            if (attributeValue < min){
                min = attributeValue;
            };

            //test for max
            if (attributeValue > max){
                max = attributeValue;
            };
        };
    });

    //set mean
    var mean = (max + min) / 2;

    //return values as an object
    return {
        max: max,
        mean: mean,
        min: min
    };
};

//Update the legend with new attribute
function updateLegend(map, attribute){
    //create content for legend
    var year = attribute.split("_")[1];
    var content = "<b>Number Homeless in " + year;

    //replace legend content
    $('#temporal-legend').html(content);

    //get the max, mean, and min values as an object
    var circleValues = getCircleValues(map, attribute);

    for (var key in circleValues){
        //get the radius
        var radius = calcPropRadius(circleValues[key]);

        //Step 3: assign the cy and r attributes
        $('#'+key).attr({
            cy: 59 - radius,
            r: radius
        });
    }
};
//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);
            
            createPopup(props, attribute, layer, radius);
            updateLegend(map, attribute);

        };
    });
};

function createPopup(properties, attribute, layer, radius){
    //add city to popup content string
    var popupContent = "<p><b>City:</b> " + properties.City + "</p>";

    //add formatted attribute to panel content string
    var year = attribute.split("_")[1];
    popupContent += "<p><b>Homeless Population " + year + ":</b> " + properties[attribute] + " homeless</p>";

    //replace the layer popup
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-radius)
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

function implementSearch(data, map, currLayer) {
        var searchControl = new L.Control.Search({
                layer: currLayer,
                propertyName: 'City',
                marker: false,
                moveToLocation: function(latlng, title, mymap) {
                    //map.fitBounds( latlng.layer.getBounds() );
                    var zoom = mymap.getBoundsZoom(latlng.layer.getBounds());
                    map.setView(latlng, zoom); // access the zoom
                }
        });

        searchControl.on('search:locationfound', function(e) {
            e.layer.setStyle({fillColor: '#3f0', color: '#0f0'});
                if(e.layer._popup)
                        e.layer.openPopup();
                }).on('search:collapsed', function(e) {
                    currLayer.eachLayer(function(layer) {   //restore feature color
                        currLayer.resetStyle(layer);
                });
        });
             
        map.addControl(searchControl);  //inizialize search control
}

//Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/HomelessPopulation.geojson", {
        dataType: "json",
        success: function(response){
            var attributes = processData(response);
            //call function to create proportional symbols
            createPropSymbols(response, map, attributes);
            createSequenceControls(map, attributes);
            createLegend(map, attributes);
            
        }
    });
};