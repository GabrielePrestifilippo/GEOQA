requirejs.config({
    baseUrl: '.',
    shim: {
        'bootstrap': {
            deps: ['jquery']
        },
        'leaflet-canvas': {
            deps: ['leaflet']
        },
        'leaflet-vector': {
            deps: ['leaflet']
        }
    },
    waitSeconds: 0,
    paths: {
        'app': '../js',
        'jquery': 'js/lib/jquery-3.1.1.min',
        'leaflet': 'leaflet/leaflet',
        'bootstrap': 'js/lib/bootstrap.min',
        'bootstrap-select': 'js/lib/bootstrap-select.min',
        'leaflet-areaselect': 'leaflet/leaflet-areaselect',
        'leaflet-MapSync': 'leaflet/L.Map.Sync',
        'osmtogeojson': 'leaflet/osmtogeojson',
        'bootstrap-switch': 'js/lib/bootstrap-switch.min',
        'leaflet-vector': 'js/Leaflet.VectorGrid.bundled'
    }
});

var geo;
define(['js/GEOQA', 'jquery', 'leaflet', 'js/GeoUI'],
    function (GEOQA, $, L, GeoUI) {
        this.UI = new GeoUI();
        var self = new GEOQA(this.UI);
        geo = self;
        $("#menu, #m2List, #m1List, #shapes, #parameters, #featuresMenu").prop("open", false);
        $('#send').click(function () {
            $('#browseButton').click();
            "use strict";
            var file1 = document.getElementById('myFile1').files[0],
                fd1 = new FormData();
            fd1.append('upload', file1);
            fd1.append('skipFailures', "true");

            var numberMap = $("#selectedMap")[0].value;
            numberMap == "1" ? numberMap = self.map1 : numberMap = self.map2;
            $.ajax({
                url: 'http://ogre.adc4gis.com/convert',
                data: fd1,
                processData: false,
                contentType: false,
                type: 'POST',
                success: function (data) {
                    self.addJson(numberMap, data);
                }
            });
        });
        $("#sendOverpass").click(function () {
            var numberMap = $("#selectedMap")[0].value;
            self.overPass(numberMap);
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
                $("#menu").css("margin-left", "-40%");
                $("#menu").prop("open", false);
            }
        });
        $("#sendMenu").click(function () {
            var angleParam = $("#angleParam").val();
            var sigmaParam = $("#sigmaParam").val();
            var distanceParam = $("#distanceParam").val();
            var iterationsParam = $("#iterationsParam").val();
            var parameters = [angleParam, sigmaParam, distanceParam, iterationsParam];
            $("#menu").css("margin-left", "-40%");
            $("#menu").prop("open", false);
            $("#loading").show();
            self.sendData(parameters);


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
            var pairAttribute = [];
            var l = $(".selectDropdownLeft").find("select");
            var r = $(".selectDropdownRight").find("select");
            for (var key = 0; key < l.length; key++) {
                pairAttribute.push([l[key].value, r[key].value]);
            }
            var features = $('select.selectionFeatures').val();
            $("#menu").css("margin-left", "-40%");
            $("#menu").prop("open", false);
            $("#loading").show();
            self.getHomologus(pairAttribute, features);
        });
        $("#sync1").bootstrapSwitch('state', false);
        $("#sync1").on('switchChange.bootstrapSwitch', function (event, state) {
            var coord_sx = [];
            var coord_dx = [];
            for (var x = 0; x < 4; x++) {
                coord_sx.push(self.markers1.markers[x]);
                coord_dx.push(self.markers2.markers[x]);
            }
            if (state == true) {
                self.map1.sync(self.map2, null, coord_sx, coord_dx);
            } else {
                self.map1.unsync(self.map2);
                $("#sync1").bootstrapSwitch('state', false);

                if (self.markers1.markers.length <= 3 || self.markers2.markers.length <= 3) {
                    if (!$("#sync1").bootstrapSwitch('state')) {
                        $("#sync1").bootstrapSwitch("toggleDisabled");
                    }

                }
            }
        });
    });

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