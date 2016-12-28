define([
    'jquery',
    'bootstrap',
    'osmtogeojson',
    'js/GeoHelper',
    'leaflet-vector',
    'leaflet/leaflet-pip.js',
    'js/proj4',
    'leaflet-marker',
    'bootstrap-select',
    'leaflet-areaselect',
    'leaflet-MapSync',
    'bootstrapSwitch',
    'js/transformation',
    'leaflet'

], function ($, bootstrap, osmtogeojson, GeoHelper, LeafletVectorGridbundled, leafletPip, proj4) {
    var GEOQA = function (UI) {
        this.markers1 = {
            markers: [],
            lMarkers: [],
            cluster: L.markerClusterGroup({
                disableClusteringAtZoom: 18
            }),
            missing: []
        };
        this.markers2 = {
            markers: [],
            lMarkers: [],
            cluster: L.markerClusterGroup({
                disableClusteringAtZoom: 18
            }),
            missing: []
        };

        this.addLeafletMaps();
        this.map1.addLayer(this.markers1.cluster);
        this.map2.addLayer(this.markers2.cluster);
        this.helper = new GeoHelper(this);
        this.UI = UI;
        this.projection = "+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
        var self = this;

        //Temporary maps
/*
        setTimeout(function () {
            $.ajax({
                // url: 'osm.geojson',
                url: 'map2.geojson',
                type: 'POST',
                success: function (data) {
                    self.addJson(self.map1, data);
                }
            });

            $.ajax({
                // url: 'dbtr.geojson',
                url: 'map1.geojson',
                type: 'POST',
                success: function (data) {
                    self.addJson(self.map2, data);
                }
            });

        }, 2000)

*/
    };
    GEOQA.prototype.addLeafletMaps = function () {
        var omsMap1 = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            maxZoom: 25,
            maxNativeZoom: 18,
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        });
        var omsMap2 = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            maxZoom: 25,
            maxNativeZoom: 18,
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        });
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
    GEOQA.prototype.getHomologous = function (parameters, attributes) {
        var [angleParam, sigmaParam, distanceParam, iterationsParam]=parameters;
        var self = this;
        var l1 = this.toCar(this.jsonMap1, attributes, 0);
        var l2 = this.toCar(this.jsonMap2, attributes, 1);
        var p1 = this.toOmo(this.markers1.markers);
        var p2 = this.toOmo(this.markers2.markers);
        var formData = new FormData();
        formData.append('layer1', new File([new Blob([l1])], "OSM00"));
        formData.append('layer2', new File([new Blob([l2])], "DBT00"));
        formData.append('points1', new File([new Blob([p1])], "OSM00_OMO"));
        formData.append('points2', new File([new Blob([p2])], "DBT00_OMO"));
        formData.append('angolo', angleParam);
        formData.append('sigma', sigmaParam);
        formData.append('distanza', distanceParam);
        formData.append('iterazioni', iterationsParam);
        if(attributes.length) {
            formData.append('attributes', attributes);
        }

        var promise = new Promise(function (resolve) {

            $.ajax({
                url: "http://localhost:8080/getHomologus",
                type: "POST",
                data: formData,
                enctype: 'multipart/form-data',
                processData: false,
                contentType: false,
                cache: false,
                success: function (res) {
                    resolve([res.resultPoints, res.resultPoints1]);
                },
                error: function (e) {
                    console.log(e);
                }

            });
        });

        promise.then(function (res) {
                self.helper.cleanAllMarkers();
                var marker1 = self.convertPoints(res[0]);
                var marker2 = self.convertPoints(res[1]);
                var x;
                var allCoords1 = [];
                self.jsonMap1.features.forEach(function (f) {
                    f.geometry.coordinates[0].forEach(function (coords) {
                        allCoords1.push(coords);
                    })
                });
                var allCoords2 = [];
                self.jsonMap2.features.forEach(function (f) {
                    f.geometry.coordinates[0].forEach(function (coords) {
                        allCoords2.push(coords);
                    })
                });

                marker1.forEach(function (marker, i) {
                    var min = Infinity;
                    var closest = undefined;
                    allCoords1.forEach(function (coords) {
                        var distance = L.point([coords[1], coords[0]]).distanceTo(L.point(marker[0], marker[1]));
                        if (distance < min) {
                            min = distance;
                            closest = L.point(coords[1], coords[0]);
                        }
                    });
                    self.helper.insertMarker(self.map1, closest.x, closest.y, (i + 1), self.markers1, "map1");
                });
                marker2.forEach(function (marker, i) {
                    var min = Infinity;
                    var closest = undefined;
                    allCoords2.forEach(function (coords) {
                        var distance = L.point([coords[1], coords[0]]).distanceTo(L.point(marker[0], marker[1]));
                        if (distance < min) {
                            min = distance;
                            closest = L.point(coords[1], coords[0]);
                        }
                    });
                    self.helper.insertMarker(self.map2, closest.x, closest.y, (i + 1), self.markers2, "map2");
                });
                $("#loading").hide();

            }
        );

    };

    GEOQA.prototype.toCar = function (jsonData, attributes, type) {
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
            arrayList[index].myProp = type;
            search(features.geometry.coordinates, arrayList[index]);
            if (features.properties) {
                for (var objKey in features.properties) {
                    if (!features.properties[objKey]) {
                        return
                    }
                    for (var a = 0; a < attributes.length; a++) {
                        var [myKey, myVal] = attributes[a][type].split(":");
                        if (myVal && features.properties[objKey][myKey] && features.properties[objKey][myKey] == myVal) {
                            arrayList[index].myProp = myKey + ":" + myVal;
                            return;
                        } else if (!myVal && features.properties[objKey]==myKey) {
                            arrayList[index].myProp = myKey;
                            return;
                        }
                    }
                }
            }
        });
        var carString = jsonData.extent;
        arrayList.forEach(function (feature) {
            carString += "\nA " + feature.myProp;
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

            if (point.indexOf("A") !== -1 || point.indexOf("L") !== -1) {
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

    GEOQA.prototype.convertPoints = function (points) {
        var newPoints = [];
        var self = this;
        points = points.split("\n");
        points.forEach(function (p) {
            var [lat, lng] = p.split(" ");
            if (lat && lng) {
                var res = proj4(self.projection, 'WGS84', [Number(lat), Number(lng)]);
                newPoints.push([res[1], res[0]]);
            }
        });

        return newPoints;
    };

    GEOQA.prototype.sendData = function (parameters, attributes) {

        var [angleParam, sigmaParam, distanceParam, iterationsParam]=parameters;
        var self = this;


        var l1 = this.toCar(this.jsonMap1, attributes, 0);
        var l2 = this.toCar(this.jsonMap2, attributes, 1);

        var p1 = this.toOmo(this.markers1.markers);
        var p2 = this.toOmo(this.markers2.markers);


        var formData = new FormData();
        formData.append('layer1', new File([new Blob([l1])], "OSM00"));
        formData.append('layer2', new File([new Blob([l2])], "DBT00"));
        formData.append('points1', new File([new Blob([p1])], "OSM00_OMO"));
        formData.append('points2', new File([new Blob([p2])], "DBT00_OMO"));
        formData.append('angolo', angleParam);
        formData.append('sigma', sigmaParam);
        formData.append('distanza', distanceParam);
        formData.append('iterazioni', iterationsParam);
        if(attributes.length) {
            formData.append('attributes', attributes);
        }
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

    };
    GEOQA.prototype.resultMap = function (data, resultParam) {

        var omsMap3 = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'});
        var resultMap = L.map('resultMap', {center: [45.82789, 9.07617], zoom: 5, minZoom: 4});
        resultMap.addLayer(omsMap3);

        var res = L.vectorGrid.slicer(data, {

            rendererFactory: L.svg.tile,
            vectorTileLayerStyles: {
                sliced: function (properties, zoom) {
                    return {
                        fillColor: '#222',
                        fillOpacity: 0.55,
                        stroke: false,
                        fill: true
                    }
                }
            },
            interactive: true,
            getFeatureId: function (f) {
            }
        }).addTo(resultMap);
        var map1 = L.vectorGrid.slicer(this.jsonMap1, {
            rendererFactory: L.svg.tile,
            vectorTileLayerStyles: {
                sliced: function (properties, zoom) {
                    return {
                        fillColor: '#66ff66',
                        fillOpacity: 0.55,
                        stroke: false,
                        fill: true
                    }
                }
            },
            interactive: true,
            getFeatureId: function (f) {
            }
        });
        var map2 = L.vectorGrid.slicer(this.jsonMap2, {
            rendererFactory: L.svg.tile,
            vectorTileLayerStyles: {
                sliced: function (properties, zoom) {
                    return {
                        fillColor: '#ff9966',
                        fillOpacity: 0.55,
                        stroke: false,
                        fill: true
                    }
                }
            },
            interactive: true,
            getFeatureId: function (f) {
            }
        });
        var base = {
            "Base Map": omsMap3
        };
        var external = {};

        var over = new L.control.layers(base, external).addTo(resultMap);

        over.addOverlay(map1, "Map 1");
        over.addOverlay(map2, "Map 2");
        over.addOverlay(res, "Result map");

        $("#map1, #map2").hide();
        $("#resultMap,#resultData").show();
        $("#mapAfterControls").hide();
        var lat = data.features[0].geometry.coordinates[0][0][1] ? data.features[0].geometry.coordinates[0][0][1] : data.features[0].geometry.coordinates[0][1];
        var lng = data.features[0].geometry.coordinates[0][0][0] ? data.features[0].geometry.coordinates[0][0][0] : data.features[0].geometry.coordinates[0][0];
        resultMap.invalidateSize();
        resultMap.setView(new L.LatLng(lat, lng), 16);
        $("#loading").hide();


        $("#mediaDeltaX").val(String(resultParam[1]));
        $("#varianzaDeltaX").val(String(resultParam[2]));
        $("#mediaDeltaY").val(String(resultParam[3]));
        $("#mediaDistanze").val(String(resultParam[4]));
        $("#varianzaDistanze").val(String(resultParam[5]));
        $("#distanzaMinima").val(String(resultParam[6]));
        $("#distanzaMassima").val(String(resultParam[7]));


    };
    GEOQA.prototype.addJson = function (map, data) {

        if (data.features.length == 0)
            return;

        var self = this;


        var vectorGrid = L.vectorGrid.slicer(data, {
            rendererFactory: L.svg.tile,
            maxZoom: 25, maxNativeZoom: 18,
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
        var temp = L.geoJson(data);

        if (map._container.id == "map1") {
            this.jsonMap1 = data;
            this.lMap1 = vectorGrid;
            this.jsonMap1.prop = this.UI.getProp(data);
            var res = proj4('WGS84', self.projection, [temp.getBounds()._southWest.lng, temp.getBounds()._southWest.lat]);
            var res1 = proj4('WGS84', self.projection, [temp.getBounds()._northEast.lng, temp.getBounds()._northEast.lat]);
            this.jsonMap1.extent = res[0] + " " + res[1] + " " + res1[0] + " " + res1[1];
            this.UI.addPropToMenu(1, this.jsonMap1.prop);
        } else {
            this.jsonMap2 = data;
            this.lMap2 = vectorGrid;
            this.jsonMap2.prop = this.UI.getProp(data);
            var res = proj4('WGS84', self.projection, [temp.getBounds()._southWest.lng, temp.getBounds()._southWest.lat]);
            var res1 = proj4('WGS84', self.projection, [temp.getBounds()._northEast.lng, temp.getBounds()._northEast.lat]);
            this.jsonMap2.extent = res[0] + " " + res[1] + " " + res1[0] + " " + res1[1];
            this.UI.addPropToMenu(2, this.jsonMap2.prop);
        }

        if (map.listenerClick) {
            map.off('click', map.listenerClick);
        }

        map.listenerClick = function (e) {
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

                if (mainMarkers.markers.length > 3 && oppositeMarkers.markers.length > 3 && $("#sync1").bootstrapSwitch('state')) {
                    $("#sync1").bootstrapSwitch('state',true);
                }
            }
        };

        map.on('click', map.listenerClick);


        map.over.addOverlay(vectorGrid, "Vector layer" + map.over._layers.length);

        map.fitBounds(temp.getBounds());
        map.setZoom(14);
        map.fitBounds(temp.getBounds());

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
