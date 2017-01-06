requirejs.config({
    baseUrl: '.',
    shim: {
        bootstrap: {
            deps: ['jquery']
        },
        'bootstrapSwitch': {
            deps: ['bootstrap']
        },
        'js/lib/bootstrap-select.min': {
            deps: ['js/lib/bootstrap.min']
        },
        'leaflet-canvas': {
            deps: ['leaflet']
        },
        'leaflet-vector': {
            deps: ['leaflet']
        },
        'leaflet-marker': {
            deps: ['leaflet']
        }
    },
    paths: {
        'app': '../js',
        'jquery': 'js/lib/jquery-3.1.1.min',
        'leaflet': 'leaflet/leaflet',
        'leaflet-pip': 'leaflet/leaflet-pip',
        'bootstrap': 'js/lib/bootstrap.min',
        'bootstrap-select': 'js/lib/bootstrap-select.min',
        'leaflet-areaselect': 'leaflet/leaflet-areaselect',
        'leaflet-MapSync': 'leaflet/L.Map.Sync',
        'osmtogeojson': 'leaflet/osmtogeojson',
        'bootstrapSwitch': 'js/lib/bootstrap-switch.min',
        'bootstrapSlider': 'js/lib/bootstrap-slider.min',
        'leaflet-vector': 'js/Leaflet.VectorGrid.bundled',
        'leaflet-marker': 'leaflet/leaflet.markercluster'
    }
});

var geo; //debugging variable to access all the methods from the console

/**
 * Main method that creates the UI and the core of the program GEOQA
 */
define(['js/GEOQA', 'jquery', 'leaflet', 'js/GeoUI', 'bootstrapSlider', 'js/lib/bootbox.min'],
    function (GEOQA, $, L, GeoUI, slider, bootbox) {
        this.UI = new GeoUI();
        var self = new GEOQA(this.UI);
        geo = self;

        /**
         * Create the slider for the opacity on the result map
         */
        var [s1,s2,s3] = $('.rangeSliderOpacity').slider();
        var sliderList = [s1, s2, s3];
        sliderList.forEach(function (slider) {
            slider.on('slide', function (ev) {
                var map = geo.finalLayers[Number(ev.currentTarget.getAttribute("map"))];
                self.resultlMap.dragging.disable();
                var sliderVal = ev.value;
                map.setOpacity(sliderVal / 100);
                self.resultlMap.dragging.enable();
            });
        });


        $("#menu, #m2List, #m1List, #shapes, #parameters, #featuresMenu").prop("open", false);
        /**
         * All the click listener for the events related to the UI and the main functionalities
         */

        /**
         * Upload button to upload the map from the client
         */
        $('#uploadFile').click(function () {
            self.UI.closeMenu();
            $('#browseButton').click();
            "use strict";
            var file1 = document.getElementById('myFile1').files[0],
                fd1 = new FormData();
            fd1.append('upload', file1);
            fd1.append('skipFailures', "true");
            fd1.append('targetSrs', "EPSG:4326");
            $("#nameFile").text("Browse");
            var numberMap = $("#selectedMap")[0].value;
            var layerMap;
            if (self.map1.over._layers.length > 1 && numberMap == String(1)) {
                bootbox.confirm({
                    title: "Attention!",
                    message: "You have already uploaded a shape on the 1st map",
                    buttons: {
                        cancel: {
                            label: '<i class="fa fa-times"></i> Go back'
                        },
                        confirm: {
                            label: '<i class="fa fa-check"></i> Delete old shape and reset markers'
                        }
                    },
                    callback: function (result) {
                        continueAdd(result);
                    }

                });
            } else if (self.map2.over._layers.length > 1 && numberMap == String(2)) {
                bootbox.confirm({
                    title: "Attention!",
                    message: "You have already uploaded a shape on the 2nd map",
                    buttons: {
                        cancel: {
                            label: '<i class="fa fa-times"></i> Go back'
                        },
                        confirm: {
                            label: '<i class="fa fa-check"></i> Delete old shape and reset markers'
                        }
                    },
                    callback: function (result) {
                        continueAdd(result);
                    }

                });
            } else {
                continueAdd(true);
            }
            function continueAdd(result) {
                if (result == true) {
                    self.helper.cleanAllMarkers();
                    var overMap;
                    if (numberMap == "1") {
                        layerMap = self.lMap1;
                        numberMap = self.map1;
                        overMap = self.map1.over;
                    } else {
                        layerMap = self.lMap2;
                        numberMap = self.map2;
                        overMap = self.map2.over;
                    }

                    if (layerMap) {
                        numberMap.removeLayer(layerMap);
                        overMap.removeLayer(layerMap);
                    }

                    $("#loading").show();
                    $.ajax({
                       // url: 'http://ogre.adc4gis.com/convert',
					    url:'http://localhost:8081/users/uploadMap',
                        data: fd1,
                        processData: false,
                        contentType: false,
                        type: 'POST',
                        success: function (data) {
					        if(typeof(data) == "string"){
					            data=JSON.parse(data);
                            }
                            self.addJson(numberMap, data);
                            $("#loading").hide();
                        }
                    });
                }
            }
        });

        /**
         * Retrieve the data from Overpass API
         */
        $("#sendOverpass").click(function () {
            self.UI.closeMenu();
            var numberMap = $("#selectedMap")[0].value;
            var messageNumber;
            if (self.map1.over._layers.length > 1 && numberMap == String(1)) {
                messageNumber="1st";
            } else if (self.map2.over._layers.length > 1 && numberMap == String(2)) {
                messageNumber = "2nd"
            } else {
                continueAdd(true);
            }

            if(messageNumber){
                bootbox.confirm({
                    title: "Attention!",
                    message: "You have already uploaded a shape on the "+messageNumber+" map",
                    buttons: {
                        cancel: {
                            label: '<i class="fa fa-times"></i> Go back'
                        },
                        confirm: {
                            label: '<i class="fa fa-check"></i> Delete old shape and reset markers'
                        }
                    },
                    callback: function (result) {
                        continueAdd(result);
                    }
                });

            }
            function continueAdd(result) {
                self.helper.cleanAllMarkers();
                var numberMap = $("#selectedMap")[0].value;
                var layerMap, mapToUse, overMap, bbox;
                if (result == true) {
                    if (numberMap == "1") {
                        layerMap = self.lMap1;
                        mapToUse = self.map1;
                        overMap = self.map1.over;
                        bbox = self.bbox1;
                    } else {
                        layerMap = self.lMap2;
                        mapToUse = self.map2;
                        overMap = self.map2.over;
                        bbox = self.bbox2;
                    }

                    if (layerMap) {
                        mapToUse.removeLayer(layerMap);
                        overMap.removeLayer(layerMap)
                    }

                    if (!bbox) {
                        alert("Please perform a selection on map " + numberMap + " before");
                        return;
                    }
                    self.overPass(bbox, mapToUse);
                }
            }
        });

        /**
         * Send the data to the server to get the result map
         */
        $("#sendMenu").click(function () {
            self.UI.closeMenu();
            if (self.markers1.markers.length < 5 || self.markers2.markers.length < 5) {
                bootbox.alert("Minimum 5 points required", function () {
                });
                return;
            }
            if (self.markers1.markers.length !== self.markers2.markers.length) {
                bootbox.alert("The number of homologous should be the same on the first and second map.<br>" +
                    "Points on first map: " + self.markers1.markers.length + "<br> Points on second map: " + self.markers2.markers.length, function () {
                });
                return;
            }

            var angleParam = $("#angleParam").val();
            var sigmaParam = $("#sigmaParam").val();
            var distanceParam = $("#distanceParam").val();
            var iterationsParam = $("#iterationsParam").val();
            var parameters = [angleParam, sigmaParam, distanceParam, iterationsParam];

            $("#loading").show();
            var pairAttribute = [];

            var l = $(".selectDropDownLeft").find("select");
            var r = $(".selectDropDownRight").find("select");
            for (var key = 0; key < l.length; key++) {
                if (l[key].value != 0 && r[key].value != 0) {
                    pairAttribute.push([l[key].value, r[key].value]);
                }
            }
            self.sendData(parameters, pairAttribute);


        });

        /**
         * Download button to get the resulting map
         */
        $("#downloadButton").click(function () {
            self.helper.download(JSON.stringify(self.resultJSON), "resultMap.geojson", "json");
        });

        /**
         * Retrieve the homologous points from the server
         */
        $("#getHomologus").click(function () {
            self.UI.closeMenu();
            if (self.markers1.markers.length < 5 || self.markers2.markers.length < 5) {
                bootbox.alert("Minimum 5 points required", function () {
                });
                return;
            }
            if (self.markers1.markers.length !== self.markers2.markers.length) {
                bootbox.alert("The number of homologous should be the same on the first and second map.<br>" +
                    "Points on first map: " + self.markers1.markers.length + "<br> Points on second map: " + self.markers2.markers.length, function () {
                });
                return;
            }

            var pairAttribute = [];
            var l = $(".selectDropDownLeft").find("select");
            var r = $(".selectDropDownRight").find("select");
            for (var key = 0; key < l.length; key++) {
                if (l[key].value != 0 && r[key].value != 0) {
                    pairAttribute.push([l[key].value, r[key].value]);
                }
            }
            var features = $('select.selectionFeatures').val();
            self.UI.closeMenu();
            $("#loading").show();
            var angleParam = $("#angleParam").val();
            var sigmaParam = $("#sigmaParam").val();
            var distanceParam = $("#distanceParam").val();
            var iterationsParam = $("#iterationsParam").val();
            var parameters = [angleParam, sigmaParam, distanceParam, iterationsParam];

            self.getHomologous(parameters, pairAttribute, features);
        });

        /**
         * Synchronization switch to sync the 2 maps
         */
        $("#sync1").bootstrapSwitch('state', false);
        $("#sync1").on('switchChange.bootstrapSwitch', function (event, state) {
            var coord_sx = [];
            var coord_dx = [];

            if (state == true) {
                if (self.markers1.markers.length >= 4 && self.markers2.markers.length >= 4) {
                    for (var x = 0; x < 4; x++) {
                        coord_sx.push(self.markers1.markers[x]);
                        coord_dx.push(self.markers2.markers[x]);
                    }
                    self.map1.sync(self.map2, null, coord_sx, coord_dx, true);
                } else {
                    self.map1.sync(self.map2, null, coord_sx, coord_dx, false);
                }
                $("#sync1").bootstrapSwitch('state', true);

            } else {
                self.map1.unsync(self.map2);
                $("#sync1").bootstrapSwitch('state', false);

            }
        });
    });

