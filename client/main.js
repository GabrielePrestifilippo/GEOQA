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
    // waitSeconds: 0,
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
        'leaflet-vector': 'js/Leaflet.VectorGrid.bundled',
        'leaflet-marker': 'leaflet/leaflet.markercluster'
    }
});

var geo;
define(['js/GEOQA', 'jquery', 'leaflet', 'js/GeoUI', 'js/lib/bootbox.min'],
    function (GEOQA, $, L, GeoUI, bootbox) {
        this.UI = new GeoUI();
        var self = new GEOQA(this.UI);
        geo = self;
        $("#menu, #m2List, #m1List, #shapes, #parameters, #featuresMenu").prop("open", false);
        $('#send').click(function () {
            closeMenu();
            $('#browseButton').click();
            "use strict";
            var file1 = document.getElementById('myFile1').files[0],
                fd1 = new FormData();
            fd1.append('upload', file1);
            fd1.append('skipFailures', "true");
            $("#nameFile").text("Browse")
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
                    numberMap == "1" ? layerMap = self.lMap1 : layerMap = self.lMap2;
                    numberMap == "1" ? numberMap = self.map1 : numberMap = self.map2;
                    numberMap == "1" ? overMap = self.map1.over : overMap = self.map2.over;
                    if (layerMap) {
                        numberMap.removeLayer(layerMap);
                        overMap.removeLayer(layerMap);
                    }

                    $("#loading").show();
                    $.ajax({
                        url: 'http://ogre.adc4gis.com/convert',
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
        $("#sendOverpass").click(function () {
            closeMenu();
            var numberMap = $("#selectedMap")[0].value;
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
                self.helper.cleanAllMarkers();
                var numberMap = $("#selectedMap")[0].value;
                var layerMap;
                var mapToUse;
                var overMap;
                if (result == true) {
                    numberMap == "1" ? layerMap = self.lMap1 : layerMap = self.lMap2;
                    numberMap == "1" ? mapToUse = self.map1 : mapToUse = self.map2;
                    numberMap == "1" ? overMap = self.map1.over : overMap = self.map2.over;
                    if (layerMap) {
                        mapToUse.removeLayer(layerMap);
                        overMap.removeLayer(layerMap)
                    }
                    self.overPass(numberMap);
                }
            }
        });
        //noinspection JSUnresolvedFunction
        $("#myFile1").on('change', function () {
            $("#nameFile").html(document.getElementById('myFile1').files[0].name);
        });
        $("#openParamMenu").click(function () {
            var open = $("#parameters").prop("open");
            closeAllMenu();
            if (!open) {
                $("#parameters").css("max-height", "140px");
                $("#parameters").prop("open", true);

            }
        });
        $("#openShapeMenu").click(function () {
            var open = $("#shapes").prop("open");
            closeAllMenu();
            if (!open) {
                $("#shapes").css("max-height", "100px");
                $("#shapes").prop("open", true);
            }
        });
        $("#buttonM1").click(function () {
            var open = $("#m1List").prop("open");
            if (!open) {
                $("#m1List").css("max-height", "100%");
                $("#m1List").prop("open", true);
            } else {
                $("#m1List").css("max-height", "0px");
                $("#m1List").prop("open", false);
            }
        });
        $("#buttonM2").click(function () {
            var open = $("#m2List").prop("open");
            if (!open) {
                $("#m2List").css("max-height", "100%");
                $("#m2List").prop("open", true);
            } else {
                $("#m2List").css("max-height", "0px");
                $("#m2List").prop("open", false);
            }
        });
        $("#openMenu").click(function () {
            var open = $("#menu").prop("open");
            if (!open) {
                $("#menu").css("margin-left", "0px");
                $("#menu").prop("open", true);
            } else {
                closeMenu();
            }
        });
        $("#sendMenu").click(function () {
            closeMenu();
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
                pairAttribute.push([l[key].value, r[key].value]);
            }
            self.sendData(parameters, pairAttribute);


        });
        $("#findMenu").click(function () {
            var open = $("#featuresMenu").prop("open");
            closeAllMenu();
            if (!open) {
                $("#featuresMenu").css("min-height", "100vh");
                $("#featuresMenu").css("max-height", "1000px");
                $("#featuresMenu").prop("open", true);
            }
        });
        $("#addAssociation").click(function () {
            var btn = $(".featuresAssociation:last").clone();
            btn.appendTo("#groupAssociation");
            var select = btn.find('select');
            btn.find('.bootstrap-select').remove();

            btn.prepend(select);
            btn.find('select').selectpicker();


            btn.children()[2].addEventListener("click", function () {
                $(this).parent().remove();
            })
        });
        $("#getHomologus").click(function () {
            closeMenu();
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
            closeMenu();
            $("#loading").show();
            var angleParam = $("#angleParam").val();
            var sigmaParam = $("#sigmaParam").val();
            var distanceParam = $("#distanceParam").val();
            var iterationsParam = $("#iterationsParam").val();
            var parameters = [angleParam, sigmaParam, distanceParam, iterationsParam];

            self.getHomologous(parameters, pairAttribute, features);
        });
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


function closeMenu() {
    $("#menu").css("margin-left", "-40%");
    $("#menu").prop("open", false);
}
function successMessage(string) {
    $("#messageContainer").show();
    $("#messageContainer").html(string);
    $("#messageContainer").css("opacity", "1");
    setTimeout(function () {
        $("#messageContainer").css("opacity", "0");
        $("#messageContainer").hide();
    }, 3000);
}
function closeAllMenu() {
    $("#shapes").css("max-height", "0px");
    $("#shapes").prop("open", false);
    $("#parameters").css("max-height", "0px");
    $("#parameters").prop("open", false);
    $("#featuresMenu").css("max-height", "0px");
    $("#featuresMenu").css("min-height", "0px");
    $("#featuresMenu").prop("open", false);
}


function download(data, filename, type) {
    var a = document.createElement("a"),
        file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

//download(carString,"file.car","text")