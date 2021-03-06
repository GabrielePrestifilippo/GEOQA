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
define(['js/GEOQA', 'jquery', 'leaflet', 'js/GeoUI', 'bootstrapSlider', 'js/lib/bootbox.min', 'config'],
    function (GEOQA, $, L, GeoUI, slider, bootbox) {
        this.UI = new GeoUI();
        var self = new GEOQA(this.UI);
        this.UI.setParent(self);
        geo = self;

        /**
         * Create the slider for the opacity on the result map
         */
        var [s1, s2, s3] = $('.rangeSliderOpacity').slider();
        var sliderList = [s1, s2, s3];
        sliderList.forEach(function (slider) {
            slider.on('slide', function (ev) {
                var map = geo.finalLayers[Number(ev.currentTarget.getAttribute("map"))];
                self.resultMap.dragging.disable();
                var sliderVal = ev.value;
                map.setOpacity(sliderVal / 100);
                self.resultMap.dragging.enable();
            });
        });


        $("#menu, #m2List, #m1List, #shapes, #parameters, #featuresMenu").prop("open", false);
        /**
         * All the click listener for the events related to the UI and the main functionalities
         */

        $("#verifyPoints").click(function () {
            var res = self.verifyPoints();
            if (res <= 0)
                return
            var tempDiv = "Distance of points over Affine transformation:<br>";
            var index = 1;
            for (var x = 0; x < res.length; x = x + 2) {
                tempDiv += "<div class ='cardinality'>Point " + index + ": </div>" +
                    "<div class='percentage'>" + res[x] + "% - " + res[x + 1] + "%</div><br>";
                index++;
            }
            $("#pointsVerification").html(tempDiv);
        });

        $('#importFile').click(function () {

            self.UI.closeMenu();
            var selectLayers = $(".selectDropDownLayers");
            var numberMap = $("#selectedMap")[0].value;
            var selected = selectLayers.find("option:selected").val().split("/layers/geonode%3A")[1];

            var url = CONFIG.geoserverURL() + 'wfs?srsName=EPSG%3A4326&typename=geonode%3A' + selected + '&outputFormat=text/javascript&version=1.0.0&service=WFS&request=GetFeature';
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
                        $("#selectedMap").val(2);
                    } else {
                        layerMap = self.lMap2;
                        numberMap = self.map2;
                        overMap = self.map2.over;
                        $("#selectedMap").val(1);
                    }

                    if (layerMap) {
                        numberMap.removeLayer(layerMap);
                        overMap.removeLayer(layerMap);
                    }

                    $("#loading").show();
                    var rootUrl = CONFIG.geoserverURL() + 'wms';
                    var defaultParameters = {
                        service: 'WMS',
                        layers: 'geonode:' + selected,
                        format: 'image/png',
                        transparent: true,
                        tiled: true,
                        maxZoom: 25,
                        maxNativeZoom: 25
                    };


                    $.ajax({
                        url: url,
                        dataType: "jsonp",
                        jsonpCallback: 'parseResponse',
                        type: 'GET',
                        success: function (data) {
                            $("#loading").hide();
                            self.addJson(numberMap, data, wmsLayer);

                        },
                        error: function () {
                            $("#loading").hide();
                            bootbox.alert("The selected layer is not supported (is it a vector?)", function () {
                            });
                        }
                    });


                    var wmsLayer = L.tileLayer.wms(rootUrl, defaultParameters);
                    wmsLayer.setOpacity(0.65);
                    numberMap.isWms = true;
                    numberMap.wms = {url: rootUrl, param: defaultParameters};


                }
            }

        });

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
                        url: CONFIG.OGRE,
                        data: fd1,
                        processData: false,
                        contentType: false,
                        type: 'POST',
                        success: function (data) {
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
            var len = $(".osmTag").length;

            var tags = [];
            for (var x = 0; x < len; x++) {
                tags.push($(".osmTag")[x].value);
            }


            var messageNumber;
            if (self.map1.over._layers.length > 1 && numberMap == String(1)) {
                messageNumber = "1st";
            } else if (self.map2.over._layers.length > 1 && numberMap == String(2)) {
                messageNumber = "2nd"
            } else {
                continueAdd(true);
            }

            if (messageNumber) {
                bootbox.confirm({
                    title: "Attention!",
                    message: "You have already uploaded a shape on the " + messageNumber + " map",
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
                if (result == true) {
                    self.helper.cleanAllMarkers();
                    var numberMap = $("#selectedMap")[0].value;
                    var layerMap, mapToUse, overMap, bbox;
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
                        bootbox.alert("Please perform a selection on map " + numberMap + " before", function () {
                        });
                        return;
                    }

                    $("#loading").show();
                    self.overPass(bbox, mapToUse, tags);
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
            try {
                self.sendData(parameters, pairAttribute);
            } catch (e) {
                $("#loading").hide();
                self.UI.successMessage(e);
            }

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

