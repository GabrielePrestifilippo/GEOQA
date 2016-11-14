requirejs.config({
    baseUrl: '.',
    paths: {
        'app': '../js',
        'jquery': 'js/jquery-3.1.1.min',
        'leaflet':'leaflet/leaflet',
        'leaflet-areaselect':'leaflet/leaflet-areaselect',
        'leaflet-MapSync':'leaflet/L.Map.Sync',
        'osmtogeojson':'leaflet/osmtogeojson',
        'bootstrap-switch':'js/bootstrap-switch.min'
    }
});


define(['js/GEOQA', 'jquery','leaflet'],
    function (GEOQA) {
        var geo=new GEOQA();
        var self = geo;

        $('#send').click(function (e) {
            $('#browseButton').click();
            "use strict";
            var file1 = document.getElementById('myFile1').files[0],
                fd1 = new FormData();
            fd1.append('upload', file1);
            fd1.append('skipFailures', "true");

            var numberMap = $("#selectedMap")[0].value;
            numberMap == "1" ? numberMap = self.map1 : numberMap = self.map2;
            $.ajax({
                url: 'http://ogre.adc4gis.com/convert', //URL of Conversion service
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

        $("#myFile1").change(function () {
            $("#nameFile").html(document.getElementById('myFile1').files[0].name);
        });

        $("#parameters").prop("open", false);
        $("#openParamMenu").click(function () {
            var open = $("#parameters").prop("open");
            if (!open) {
                $("#parameters").css("max-height", "140px");
                $("#parameters").prop("open", true);

                $("#shapes").css("max-height", "0px");
                $("#shapes").prop("open", false);
            } else {
                $("#parameters").css("max-height", "0px");
                $("#parameters").prop("open", false);
            }
        });

        $("#shapes").prop("open", false);
        $("#openShapeMenu").click(function () {
            var open = $("#shapes").prop("open");
            if (!open) {
                $("#shapes").css("max-height", "100px");
                $("#shapes").prop("open", true);

                $("#parameters").css("max-height", "0px");
                $("#parameters").prop("open", false);
            } else {
                $("#shapes").css("max-height", "0px");
                $("#shapes").prop("open", false);


            }
        });

        $("#m1List").prop("open", false);
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

        $("#m2List").prop("open", false);
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


        $("#menu").prop("open", false);
        $("#openMenu").click(function () {
            var open = $("#menu").prop("open");
            if (!open) {
                $("#menu").css("margin-left", "0px");
                $("#menu").prop("open", true);
            } else {
                $("#menu").css("margin-left", "-30%");
                $("#menu").prop("open", false);
            }
        });

        $("#sendMenu").click(function () {
            var angleParam = $("#angleParam").val();
            var sigmaParam = $("#sigmaParam").val();
            var distanceParam = $("#distanceParam").val();
            var iterationsParam = $("#iterationsParam").val();
            var parameters = [angleParam, sigmaParam, distanceParam, iterationsParam];
            self.sendData(parameters);
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

                if(self.markers1.markers.length<=3 || self.markers2.markers.length<=3){
                    if(!$("#sync1").bootstrapSwitch('state')){
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