define([
    'jquery',
    'js/lib/bootstrap.min',
    'osmtogeojson',
    'js/GeoHelper',
    'leaflet-vector',
    'leaflet/leaflet-pip.js',
    'js/proj4',
    'bootstrap-select',
    'leaflet-areaselect',
    'leaflet-MapSync',
    'bootstrap-switch',
    'js/transformation',
    'leaflet'

], function ($, bootstrap, osmtogeojson, GeoHelper, LeafletVectorGridbundled, leafletPip, proj4) {
    var GEOQA = function (UI) {
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
        this.helper = new GeoHelper(this);
        this.UI = UI;
        this.projection = "+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
        var self = this;

        //Temporary maps
        setTimeout(function () {
            $.ajax({
                // url: 'osm.geojson',
                // url: 'map2.geojson',
                type: 'POST',
                success: function (data) {
                    //self.addJson(self.map1, data);
                }
            });

            $.ajax({
                // url: 'dbtr.geojson',
                // url: 'map1.geojson',
                type: 'POST',
                success: function (data) {
                   // self.addJson(self.map2, data);
                }
            });

        }, 2000)
    };
    GEOQA.prototype.addLeafletMaps = function () {
        var omsMap1 = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'});
        var omsMap2 = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'});
        this.map1 = L.map('map1', {center: [45.82789, 9.07617], zoom: 12, minZoom: 2});

        var base = {
            "Base Map": omsMap1
        };
        var external = {};

        this.map1.over = new L.control.layers(base, external).addTo(this.map1);
        this.map1.addLayer(omsMap1);
        this.map1.boxZoom.disable();
        this.map2 = L.map('map2', {center: [45.82789, 9.07617], zoom: 12, minZoom: 2});
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
    GEOQA.prototype.getHomologus = function (/*pairAttribute, features*/) {


        var self = this;
        /*
         var pairs = [this.markers1.markers, this.markers2.markers];
         var toSend = {
         pairs: pairs,
         attributes: pairAttribute,
         features: features
         };
         */
        var promise = new Promise(function (resolve) {
            $.ajax({
                url: 'array.js',
                success: function (data) {
                    $("#loading").hide();
                    resolve(JSON.parse(data));
                }
            });
        });
        promise.then(function (res) {
            self.helper.cleanAllMarkers();

            var marker1 = res[0];
            var marker2 = res[1];
            var x;
            for (x = 0; x < marker1.length; x++) {
                self.helper.insertMarker(self.map1, marker1[x][0], marker1[x][1], (x + 1), self.markers1, "map1");
            }
            for (x = 0; x < marker2.length; x++) {
                self.helper.insertMarker(self.map2, marker2[x][0], marker2[x][1], (x + 1), self.markers2, "map2");
            }
        });

    };

    GEOQA.prototype.toCar = function (jsonData, type) {
        var self = this;

        function search(ob, arr) {
            if (typeof(ob) == "object" && typeof(ob[0]) == "number") {
                arr.push([ob[0], ob[1]]);
            } else {
                ob.forEach(function (insideOb) {
                    search(insideOb, arr)
                })
            }
        }

        var arrayList = [];
        jsonData.features.forEach(function (features, index) {
            arrayList[index] = [];
            search(features.geometry.coordinates, arrayList[index]);

        });
        var carString = jsonData.extent;
        arrayList.forEach(function (feature) {
            carString += "\nA " + type;
            feature.forEach(function (coords) {
                var res = proj4('WGS84', self.projection, [coords[0], coords[1]]);
                carString += "\n" + res[0] + " " + res[1] + " 0";
            })
        });

        return carString;
    };


    GEOQA.prototype.toOmo = function (points) {
        var self = this;
        var omoString = "";
        points.forEach(function (coords) {
            var res = proj4('WGS84', self.projection, [coords[1], coords[0]]);

            omoString += res[0] + " " + res[1] + "\n";
        });
        return omoString;
    };

    GEOQA.prototype.createJSON = function (data) {
        var self = this;
        var g = {"type": "FeatureCollection", "features": []};

        var f = {"type": "Feature", "properties": {}, "meta": {}, "geometry": {"type": "Polygon", "coordinates": [[]]}};


        var geompoints = data.resultMap.split("\n");
        geompoints.shift();
        var currentFeature = JSON.parse(JSON.stringify(f));

        geompoints.forEach(function (point) {

            if (point.indexOf("A") !== -1) {
                currentFeature = JSON.parse(JSON.stringify(f));
                g.features.push(currentFeature);
            } else {
                var currentPoint = point.split(" ");
                if (Number(currentPoint[0]) && Number(currentPoint[0] !== 0)) {
                    var res = proj4(self.projection, 'WGS84', [Number(currentPoint[0]), Number(currentPoint[1])]);
                    currentFeature.geometry.coordinates[0].push(res);
                }
            }
        });

        return g;
    };
    GEOQA.prototype.sendData = function (/*parameters*/) {


        var self = this;


        var l1 = this.toCar(this.jsonMap1, "OSM");
        var l2 = this.toCar(this.jsonMap2, "DBT");

        var p1 = this.toOmo(this.markers1.markers);
        var p2 = this.toOmo(this.markers2.markers);


        var formData = new FormData();
        formData.append('layer1', new File([new Blob([l1])], "OSM00"));
        formData.append('layer2', new File([new Blob([l2])], "DBT00"));
        formData.append('points1', new File([new Blob([p1])], "OSM00_OMO"));
        formData.append('points2', new File([new Blob([p2])], "DBT00_OMO"));
        formData.append('angolo', "10");
        formData.append('sigma', "3");
        formData.append('distanza', "1");
        $.ajax({
            url: "http://localhost:8080/send",
            type: "POST",
            data: formData,
            enctype: 'multipart/form-data',
            processData: false,
            contentType: false,
            cache: false,
            success: function (res) {
                var geo = self.createJSON(res);
                var resultParam = res.statistics.split("\n")[1].split(";");
                self.resultMap(geo, resultParam);
            },
            error: function (e) {
                console.log(e);
            }
        });

        /*
         $.ajax({
         url: 'http://localhost:8080/send',
         data: JSON.stringify(dataToSend),
         processData: false,
         contentType: false,
         type: 'POST',
         success: function (data) {
         console.log(data);
         // data = osmtogeojson(data);
         //numberMap == "1" ? numberMap = self.map1 : numberMap = self.map2;
         //self.addJson(numberMap, data);
         },
         error: function (e) {
         console.log("error: " + JSON.stringify(e));
         }
         });
         */
        var self = this;

        //noinspection JSUnresolvedFunction
        var promise = new Promise(function (resolve) {
            $.ajax({
                url: 'result.json',
                success: function (data) {
                    var resultParam = [0.78, 0.32, 0.11];
                    //  resolve([data, resultParam]);
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

        L.vectorGrid.slicer(data, {
            rendererFactory: L.svg.tile,
            vectorTileLayerStyles: {
                sliced: function (properties, zoom) {
                    return {
                        fillColor: '#222',
                        fillOpacity: 0.85,
                        stroke: false,
                        fill: true
                    }
                }
            },
            interactive: true,
            getFeatureId: function (f) {
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

        if (data.features.length == 0)
            return

        var self = this;


        var vectorGrid = L.vectorGrid.slicer(data, {
            rendererFactory: L.svg.tile,
            vectorTileLayerStyles: {
                sliced: function (properties, zoom) {
                    return {
                        fillColor: '#ff7800',
                        fillOpacity: 0.65,
                        stroke: false,
                        fill: true,
                        color: 'red',
                        strokeOpacity: 0,
                        weight: 0,
                    }
                }
            },
            interactive: true,
            getFeatureId: function (f) {
            }
        }).addTo(map);


        var x = vectorGrid;

        var temp = L.geoJson(data);

        if (map._container.id == "map1") {
            this.jsonMap1 = data;
            this.jsonMap1.prop = this.UI.getProp(data);
            var res = proj4('WGS84', self.projection, [temp.getBounds()._southWest.lng, temp.getBounds()._southWest.lat]);
            var res1 = proj4('WGS84', self.projection, [temp.getBounds()._northEast.lng, temp.getBounds()._northEast.lat]);
            this.jsonMap1.extent = res[0] + " " + res[1] + " " + res1[0] + " " + res1[1];
            this.UI.addPropToMenu(1, this.jsonMap1.prop);
        } else {
            this.jsonMap2 = data;
            this.jsonMap2.prop = this.UI.getProp(data);
            var res = proj4('WGS84', self.projection, [temp.getBounds()._southWest.lng, temp.getBounds()._southWest.lat]);
            var res1 = proj4('WGS84', self.projection, [temp.getBounds()._northEast.lng, temp.getBounds()._northEast.lat]);
            this.jsonMap2.extent = res[0] + " " + res[1] + " " + res1[0] + " " + res1[1];
            this.UI.addPropToMenu(2, this.jsonMap2.prop);
        }


        map.on('click', function (e) {
            var popLocation = e.latlng;
            var z = leafletPip.pointInLayer([e.latlng.lng, e.latlng.lat], temp);

            if (z[0] && z[0].feature && z[0].feature.geometry.coordinates) {
                var nearest = self.findNearest(z[0].feature.geometry.coordinates, L.point(e.latlng.lat, e.latlng.lng));
                var map = e.target._container.id;
                if (map == "map1") {
                    map = self.map1;
                } else {
                    map = self.map2;
                }
                var mainMarkers;
                var oppositeMarkers;

                if (e.target._container.id == "map1") {
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


                self.helper.insertMarker(map, nearest.y, nearest.x, markerNumber, mainMarkers, e.target._container.id);

                if (mainMarkers.markers.length > 3 && oppositeMarkers.markers.length > 3) {

                    if ($("#sync1").bootstrapSwitch("disabled")) {
                        $("#sync1").bootstrapSwitch("toggleDisabled");
                    }
                }
            }
        });

        map.over.addOverlay(x, "Vector layer" + map.over._layers.length);

        map.fitBounds(temp.getBounds());
        map.setZoom(14);

    };
    GEOQA.prototype.findNearest = function (coordArray, point) {
        var min = Infinity;
        var closest = undefined;


        var allElem = [];
        exploreChildren(coordArray);
        function elem(x) {
            if (typeof(x) !== "number" && typeof(x[0]) == "number") {
                return true;
            }
        }

        function exploreChildren(parent) {
            if (elem(parent)) {
                allElem.push(parent);
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
    };
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

        var data = '[out:json][timeout:25];(way["building"](' + bbox + ');relation["building"](' + bbox + '););out ;>;out skel qt;';
        var self = this;
        $.ajax({
            url: 'http://overpass-api.de/api/interpreter',
            data: data,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function (data) {
                data = osmtogeojson(data);
                if (numberMap == "1") {
                    numberMap = self.map1;
                } else {
                    numberMap = self.map2;
                }
                self.addJson(numberMap, data);
            },
            error: function (e) {
                console.log("error: " + JSON.stringify(e));
            }
        });
    };
    return GEOQA;
})
;
