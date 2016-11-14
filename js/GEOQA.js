define([
    'js/bootstrap.min',
    'js/bootbox.min',
    'osmtogeojson',
    'leaflet-areaselect',
    'leaflet-MapSync',
    'bootstrap-switch',
    'js/transformation'

], function (bootstrap, bootbox, osmtogeojson) {

    var GEOQA = function () {

        this.markers1 = {
            markers: [],
            lMarkers: [],
            missing: []
        };
        this.markers2 = {
            markers: [],
            lMarkers: [],
            missing: []
        };
        this.addLeafletMaps();
        var self = this;
        $.ajax({
            url: 'map.json',
            type: 'POST',
            success: function (data) {
                self.addJson(self.map1, data);
                self.addJson(self.map2, data);
            }
        });
    };


    GEOQA.prototype.addLeafletMaps = function () {
        var omsMap1 = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'});
        var omsMap2 = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'});

        this.map1 = L.map('map1', {center: [45.82789, 9.07617], zoom: 5, minZoom: 4});

        var base = {
            "Base Map": omsMap1
        };
        var external = {};


        this.map1.over = new L.control.layers(base, external).addTo(this.map1);


        this.map1.addLayer(omsMap1);
        this.map1.boxZoom.disable();
        this.map2 = L.map('map2', {center: [45.82789, 9.07617], zoom: 5, minZoom: 4});

        this.map2.over = new L.control.layers(base, external).addTo(this.map2);
        this.map2.addLayer(omsMap2);
        this.map2.boxZoom.disable();
        this.map1.selectArea.enable();
        this.map1.selectArea.setControlKey(true);
        this.map1.selectArea.setShiftKey(true);
        this.map2.selectArea.enable();
        this.map2.selectArea.setControlKey(true);
        this.map2.selectArea.setShiftKey(true);
        var self = this;
        this.map1.on('areaselected', function (e) {
            self.bbox1 = e.bounds._southWest.lat + "," + e.bounds._southWest.lng + "," + e.bounds._northEast.lat + "," + e.bounds._northEast.lng;
            successMessage("Selection performed");
        });
        this.map2.on('areaselected', function (e) {
            self.bbox2 = e.bounds._southWest.lat + "," + e.bounds._southWest.lng + "," + e.bounds._northEast.lat + "," + e.bounds._northEast.lng;
            successMessage("Selection performed");
        });
    };

    GEOQA.prototype.sendData = function (parameters) {

        var pairs = [this.markers1.markers, this.markers2.markers];

        var dataToSend = {
            map1: this.jsonMap1,
            map2: this.jsonMap2,
            pairs: pairs,
            parameters: parameters
        };


        $("#menu").css("margin-left", "-30%");
        $("#menu").prop("open", false);
        $("#loading").show();

        //$.ajax({
        //url: 'server',
        //data: data,
        //processData: false,
        //contentType: false,
        //type: 'POST',
        //success: function (data) {
        //console.log("overpass ready");
        //data = osmtogeojson(data);
        //numberMap == "1" ? numberMap = self.map1 : numberMap = self.map2;
        // self.addJson(numberMap, data);
        // },
        // error: function (e) {
        //console.log("error: " + JSON.stringify(e));
        // }
        // });

        var self = this;

        var promise = new Promise(function (resolve) {
            $.ajax({
                url: 'result.json',
                success: function (data) {
                    var resultParam = [0.78, 0.32, 0.11];
                    resolve([data, resultParam]);
                }
            });
        });
        promise.then(function (res) {
            var data = res[0];
            var resultParam = res[1];
            self.resultMap(data, resultParam);
        });
    };
    GEOQA.prototype.resultMap = function (data, resultParam) {

        var omsMap3 = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'});
        var resultMap = L.map('resultMap', {center: [45.82789, 9.07617], zoom: 5, minZoom: 4});
        resultMap.addLayer(omsMap3);

        L.geoJSON(data, {
            style: {
                "color": "#222",
                "weight": 1,
                "opacity": 0.85
            }
        }).addTo(resultMap);


        $("#map1, #map2").hide();
        $("#resultMap,#resultData").show();
        var lat = data.features[0].geometry.coordinates[0][0][1] ? data.features[0].geometry.coordinates[0][0][1] : data.features[0].geometry.coordinates[0][1];
        var lng = data.features[0].geometry.coordinates[0][0][0] ? data.features[0].geometry.coordinates[0][0][0] : data.features[0].geometry.coordinates[0][0];
        resultMap.invalidateSize();
        resultMap.setView(new L.LatLng(lat, lng), 16);
        $("#loading").hide();

        $("#precision").val(resultParam[0]);
        $("#stdev").val(resultParam[1]);
        $("#meanerror").val(resultParam[2]);


    };
    GEOQA.prototype.addJson = function (map, data) {

        var x = L.geoJSON(data, {
            onEachFeature: onEachFeature,
            style: {
                "color": "#ff7800",
                "weight": 1,
                "opacity": 0.65
            }
        }).addTo(map);


        map.over.addOverlay(x, "Vector layer" + map.over._layers.length);

        var lat = data.features[0].geometry.coordinates[0][0][1] ? data.features[0].geometry.coordinates[0][0][1] : data.features[0].geometry.coordinates[0][1];
        var lng = data.features[0].geometry.coordinates[0][0][0] ? data.features[0].geometry.coordinates[0][0][0] : data.features[0].geometry.coordinates[0][0];
        map.setView(new L.LatLng(lat, lng), 16);

        if (map == "map1") {
            this.jsonMap1 = data;
        } else {
            this.jsonMap2 = data;
        }

        var self = this;

        function onEachFeature(feature, layer) {
            layer.on({
                    click: function (e) {
                        if (e.target.feature.geometry.coordinates) {
                            var nearest = self.findNearest(e.target.feature.geometry.coordinates, L.point(e.latlng.lat, e.latlng.lng));
                            var map = e.target._map._container.id;
                            map == "map1" ? map = self.map1 : map = self.map2;
                            var mainMarkers;
                            var oppositeMarkers;

                            if (e.target._map._container.id == "map1") {
                                mainMarkers = self.markers1;
                                oppositeMarkers = self.markers2;

                            }
                            else {
                                mainMarkers = self.markers2;
                                oppositeMarkers = self.markers1;
                            }
                            if (mainMarkers.markers.length > oppositeMarkers.markers.length) {
                                successMessage("Please, insert first another marker in the other map");
                                return;
                            }

                            var markerNumber;
                            if (mainMarkers.missing.length != 0) {
                                markerNumber = mainMarkers.missing.shift();
                            } else {
                                markerNumber = mainMarkers.markers.length;
                            }

                            var m1 = new L.marker([nearest.y, nearest.x], {
                                    icon: new L.DivIcon({
                                        className: "number-icon",
                                        iconSize: [25, 41],
                                        iconAnchor: [12, 41],
                                        html: markerNumber + 1
                                    }),
                                    message: "Marker " + Number(markerNumber + 1)
                                }
                            ).addTo(map).bindPopup("Marker " + Number(markerNumber + 1) + "<br><input type='button' value='Remove' class='btn btn-danger marker-delete-button'/>");
                            m1.on("popupopen", onPopupOpen);
                            m1.indexMarker = Number(markerNumber + 1);

                            mainMarkers.lMarkers.splice(markerNumber, 0, m1);
                            // mainMarkers.lMarkers.push(m1);
                            mainMarkers.markers.splice(markerNumber, 0, [nearest.y, nearest.x]);
                            //mainMarkers.markers.push([nearest.y, nearest.x]);

                            self.addMarkerToInterface(m1, markerNumber, e.target._map._container.id);

                            if (mainMarkers.markers.length > 3 && oppositeMarkers.markers.length > 3) {

                                if ($("#sync1").bootstrapSwitch("disabled")) {
                                    $("#sync1").bootstrapSwitch("toggleDisabled");
                                }
                            }
                        }
                    }
                }
            );
        }

        function onPopupOpen() {
            var mainMarkers;
            var map;
            var otherMap;
            var oppositeMarkers;
            if (this._map._container.id == "map1") {
                mainMarkers = self.markers1;
                oppositeMarkers = self.markers2;
                map = self.map1;
                otherMap = self.map2;
            } else {
                mainMarkers = self.markers2;
                oppositeMarkers = self.markers1;
                map = self.map2;
                otherMap = self.map1;
            }
            var tempMarker = this;
            var markerNum = this.indexMarker;

            $(".marker-delete-button:visible").click(function () {
                self.removeMarker(tempMarker, mainMarkers, oppositeMarkers, map, otherMap);
                $(".marker").filter(function () {
                    if ($(this).data("num") == markerNum) {
                        $(this).remove();
                    }
                })
            });
        };
    };
    GEOQA.prototype.removeMarker = function (tempMarker, mainMarkers, oppositeMarkers, map, otherMap) {
        map.removeLayer(tempMarker);
        mainMarkers.markers.forEach(function (marker, index) {
            if (marker[0] == tempMarker._latlng.lat && marker[1] == tempMarker._latlng.lng) {
                if (index !== mainMarkers.markers.length - 1) {

                    mainMarkers.missing.push(mainMarkers.lMarkers[index].indexMarker - 1);
                    mainMarkers.missing.sort();
                }
                mainMarkers.markers.splice(index, 1);
                mainMarkers.lMarkers.splice(index, 1);
                if (oppositeMarkers.lMarkers[index]) {
                    bootbox.confirm({
                        title: "Attention!",
                        message: "Do you want to remove the homologus point?",
                        buttons: {
                            cancel: {
                                label: '<i class="fa fa-times"></i> No'
                            },
                            confirm: {
                                label: '<i class="fa fa-check"></i> Yes'
                            }
                        },
                        callback: function (result) {
                            if (result == true) {
                                oppositeMarkers.markers.splice(index, 1);

                                oppositeMarkers.missing.push(oppositeMarkers.lMarkers[index].indexMarker - 1);
                                oppositeMarkers.missing.sort();
                                var r = oppositeMarkers.lMarkers.splice(index, 1);
                                if (r.length !== 0) {
                                    otherMap.removeLayer(r[0]);
                                }
                            }
                        }

                    });
                }
            }
            if (mainMarkers.markers.length <= 3 || oppositeMarkers.markers.length <= 3) {
                if (!$("#sync1").bootstrapSwitch("state") && !$("#sync1").bootstrapSwitch("disabled")) {
                    $("#sync1").bootstrapSwitch("toggleDisabled");
                }

            }
        });
    };
    GEOQA.prototype.addMarkerToInterface = function (tempMarker, markerNum, map) {
        var mapNumber = map.split("map")[1];

        var newMarker = $("<div data-num='" + (markerNum + 1) + "' class=marker>" +
            "<div class='nameMarker'>" +
            "<div class='btn btn-danger btn-responsive'> #" + (markerNum + 1) + "  <i class='fa fa-trash-o' aria-hidden='true'></i></div>" +
            "</div></div>");
        var deleteMarker = $("<div class='buttonMarker'>" +
            "<div class='btn btn-danger btn-responsive'><i class='fa fa-trash-o' aria-hidden='true'></i></div>" +
            "</div>");
        $("#m" + mapNumber + "List").append(newMarker);
        //newMarker.append(deleteMarker);

        var self = this;
        var mainMarkers;
        var otherMap;
        var oppositeMarkers;
        newMarker.click(function () {

            if (mapNumber == "1") {
                mainMarkers = self.markers1;
                oppositeMarkers = self.markers2;
                map = self.map1;
                otherMap = self.map2;
            } else {
                mainMarkers = self.markers2;
                oppositeMarkers = self.markers1;
                map = self.map2;
                otherMap = self.map1;
            }
            self.removeMarker(tempMarker, mainMarkers, oppositeMarkers, map, otherMap);
            $(".marker").filter(function () {
                if ($(this).data("num") == markerNum + 1) {
                    $(this).remove();
                }
            })
        });

    };
    GEOQA.prototype.findNearest = function (coordArray, point) {
        var min = Infinity;
        var closest;


        var allElem = [];
        exploreChildren(coordArray);
        function elem(x) {
            if (typeof(x) !== "number" && typeof(x[0]) == "number") {
                return true;
            }
        }

        function exploreChildren(parent) {
            if (elem(parent)) {
                allElem.push(parent)
                var distance = point.distanceTo(L.point(parent[1], parent[0]));
                if (distance < min) {
                    min = distance;
                    closest = L.point(parent);
                }
            } else {
                for (var x = 0; x < parent.length; x++) {
                    exploreChildren(parent[x]);
                }
            }
        }


        return closest;
    }
    GEOQA.prototype.overPass = function (numberMap) {
        var bbox;
        if (numberMap == "1") {
            bbox = this.bbox1;
        } else {
            bbox = this.bbox2;
        }
        if (!bbox) {
            alert("Please perform a selection on map " + numberMap + " before");
            return;
        }

        var data = '[out:json][timeout:25];(way["building"](' + bbox + ');relation["building"](' + bbox + '););out skel;>;out skel qt;';
        var self = this;
        $.ajax({
            url: 'http://overpass-api.de/api/interpreter',
            data: data,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function (data) {
                data = osmtogeojson(data);
                numberMap == "1" ? numberMap = self.map1 : numberMap = self.map2;
                self.addJson(numberMap, data);
            },
            error: function (e) {
                console.log("error: " + JSON.stringify(e));
            }
        });
    }


    return GEOQA;
})
;