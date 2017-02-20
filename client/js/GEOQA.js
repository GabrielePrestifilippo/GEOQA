define([
    'jquery',
    'bootstrap',
    'osmtogeojson',
    'leaflet',
    'js/GeoHelper',
    'leaflet-vector',
    'js/proj4',
    'js/lib/bootbox.min',
    'js/QuadTree',
    'leaflet-marker',
    'bootstrap-select',
    'leaflet-areaselect',
    'leaflet-MapSync',
    'bootstrapSwitch',
    'js/transformation',
    'config'


], function ($, bootstrap, osmtogeojson, L, GeoHelper, LeafletVectorGridbundled, proj4, bootbox) {
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
        this.resultJSON = null;
        this.projection = "+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
        var self = this;

        //Temporary maps
        //CONFIG.STARTUP(self);


    };

    /**
     * Create two basic leaflet maps
     */
    GEOQA.prototype.addLeafletMaps = function () {
        var omsMap1 = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            maxZoom: 25,
            maxNativeZoom: 18,
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        });
        this.map1 = L.map('map1', {center: [45.82789, 9.07617], zoom: 12, minZoom: 2});


        var omsMap2 = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            maxZoom: 25,
            maxNativeZoom: 18,
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        });
        this.map2 = L.map('map2', {center: [45.82789, 9.07617], zoom: 12, minZoom: 2});

        var baseMap1 = {
            "Base Map": omsMap1
        };
        var baseMap2 = {
            "Base Map": omsMap2
        };
        var external = {};

        this.map1.over = new L.control.layers(baseMap1, external).addTo(this.map1);
        this.map1.addLayer(omsMap1);
        this.map1.boxZoom.disable();

        this.map2.over = new L.control.layers(baseMap2, external).addTo(this.map2);
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
            self.UI.successMessage("Selection performed");
        });
        this.map2.on('areaselected', function (e) {
            self.bbox2 = e.bounds._southWest.lat + "," + e.bounds._southWest.lng + "," + e.bounds._northEast.lat + "," + e.bounds._northEast.lng;
            self.UI.successMessage("Selection performed");
        });
    };

    /**
     * Retrieve the homologous points from the server and insert the markers on the map
     * @param parameters, transformation parameters
     * @param attributes, attributes for the association
     */
    GEOQA.prototype.getHomologous = function (parameters, attributes) {
        var [angleParam, sigmaParam, distanceParam, iterationsParam] = parameters;
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
        if (attributes.length) {
            formData.append('attributes', attributes);
        }

        var promise = new Promise(function (resolve) {
            $.ajax({
                url: CONFIG.homologousURL(),
                type: "POST",
                data: formData,
                enctype: 'multipart/form-data',
                processData: false,
                contentType: false,
                cache: false,
                success: function (res) {
                    resolve(res);
                },
                error: function (e) {
                    console.log(e);
                }
            });
        });

        promise.then(function (res) {
            var resultParam = res.statistics.split("\n")[1].split(";");
            self.UI.showStatistics(resultParam);
            self.helper.cleanAllMarkers();
            var marker1 = self.convertPoints(res.resultPoints); //get all points
            var marker2 = self.convertPoints(res.resultPoints1);

            var markerLeaflet1 = [], markerLeaflet2 = [];
            var minDistance = Infinity;
            var maxDistance = 0;
            var colors = [[51, 159, 255], [10, 10, 10]];

            //for each point, convert it to Leaflet Point ??
            marker1.forEach(function (m) {
                var point = L.point(m[0], m[1]);
                markerLeaflet1.push(point);
            });
            //calculate distance to color marker according to it
            marker2.forEach(function (m, i) {
                var point = L.point(m[0], m[1]);
                var distance = point.distanceTo(markerLeaflet1[i]);
                point.distance = distance;
                markerLeaflet1[i].distance = distance;
                markerLeaflet2.push(point);
                minDistance = Math.min(minDistance, distance);
                maxDistance = Math.max(maxDistance, distance);
            });

            markerLeaflet1.forEach(function (marker, i) {
                var distanceHomologous = marker.distance;
                var color = self.helper.getColor(((distanceHomologous - minDistance) / (maxDistance - minDistance)) * 100, colors);

                self.helper.insertMarker(self.map1, marker.x, marker.y, (i + 1), self.markers1, "map1", color);
            });
            markerLeaflet2.forEach(function (marker, i) {
                var distanceHomologous = marker.distance;
                var color = self.helper.getColor(((distanceHomologous - minDistance) / (maxDistance - minDistance)) * 100, colors);
                self.helper.insertMarker(self.map2, marker.x, marker.y, (i + 1), self.markers2, "map2", color);
            });

            $("#loading").hide();

        });
    };

    /**
     * Convert a JSON to a CAR format
     * @param jsonData, input JSON file
     * @param attributes, attributes to insert
     * @param type, variable to indicate if is the first or second map
     * @returns {number|string|*}
     */
    GEOQA.prototype.toCar = function (jsonData, attributes, type) {
        var self = this;

        //searchAndFill will fill an array with the coordinates of each feature
        //digging deep into the objects inside
        function searchAndFill(ob, arr, type, letterType) {
            if (typeof(ob) == "object" && typeof(ob[0]) == "number") {
                arr.push([ob[0], ob[1]]);
            } else if (typeof(ob) == "object" && typeof(ob[0]) == "object" && typeof(ob[0][0]) == "number") {
                var subArray=[];
                subArray.type=type;
                subArray.letterType=letterType;
                arr.push(subArray);
                ob.forEach(function (insideOb) {
                    searchAndFill(insideOb, subArray,  type, letterType)
                })
            } else {
                ob.forEach(function (insideOb) {
                    searchAndFill(insideOb, arr,  type, letterType)
                })
            }
        }

        var arrayList = [];
        var letterType;
        //for each feature of the json

            jsonData.features.forEach(function (features, index) {
                if (!features.geometry || !features.geometry.type) {
                    return;
                }

                //arrayList[index] = [];
                myProp = type; //assign a properties to each feature, initialize it to a number (0,1->map0, map1)

                if (features.geometry.type == "Polygon" || features.geometry.type == "MultiPolygon") {
                    letterType = "A";
                } else {
                    letterType = "L";
                }

                //retrieve all the coordinates for the selected feature and put the in the arrayList
                searchAndFill(features.geometry.coordinates, arrayList, type, letterType);

                //if the feature has properties
                if (features.properties) {
                    //for each property
                    for (var objKey in features.properties) {
                        if (!features.properties[objKey]) { //check if some properties are null
                            return
                        }
                        //for each available attribute, got from the association list:
                        for (var a = 0; a < attributes.length; a++) {
                            //try to get a key-value pair splitting the attribute over ":", it is the OSM case
                            var [myKey, myVal] = attributes[a][type].split(":");
                            //if key-val are found, so we have a OSM attributes
                            if (myVal && features.properties[objKey][myKey] && features.properties[objKey][myKey] == myVal) {
                                arrayList[index].myProp = myKey + ":" + myVal;
                                //set the property of the current feature to key:val
                                return;
                            } else if (!myVal && features.properties[objKey] == myKey) {
                                //if we have just an attribute not in the form key:val, we simply set the value
                                arrayList[index].myProp = myKey;
                                return;
                            }
                        }
                    }
                }
            });

        //we fill the car file, by putting the extent in the first line
        var carString = jsonData.extent;
        arrayList.forEach(function (feature) {
            if (feature.length) {
                //for each coordinate we put a new line with A coordinates
                carString += "\n" + feature.letterType + " " + feature.myProp;
                feature.forEach(function (coords) {
                    //we convert the coordinates into 32632
                    var res = proj4('WGS84', self.projection, [coords[0], coords[1]]);
                    carString += "\n" + res[0] + " " + res[1] + " 0";
                })
            }
        });

        return carString;
    };

    /**
     * Convert a list of points to the OMO format
     * @param points, list of points
     * @returns {string}, OMO string
     */
    GEOQA.prototype.toOmo = function (points) {
        var self = this;
        var omoString = "";
        points.forEach(function (coords) {
            var res = proj4('WGS84', self.projection, [coords[1], coords[0]]);

            omoString += res[0] + " " + res[1] + "\n";
        });
        return omoString;
    };

    /**
     * Create a JSON from a CAR string
     * @param data
     * @returns {{type: string, features: Array}}
     */
    GEOQA.prototype.createJSON = function (data) {
        var self = this;
        var g = {"type": "FeatureCollection", "features": []};
        var f = {"type": "Feature", "properties": {}, "meta": {}, "geometry": {"type": "Polygon", "coordinates": [[]]}};
        var l = {"type": "Feature", "properties": {}, "geometry": {"type": "LineString", "coordinates": []}};
        var geomPoints = data.resultMap.split("\n");
        geomPoints.shift();
        var currentFeature = JSON.parse(JSON.stringify(f));

        geomPoints.forEach(function (point) {
            if (point.indexOf("A") !== -1) {
                currentFeature = JSON.parse(JSON.stringify(f));
                g.features.push(currentFeature);
            } else if (point.indexOf("L") !== -1) {
                currentFeature = JSON.parse(JSON.stringify(l));
                g.features.push(currentFeature);
            } else {
                var currentPoint = point.split(" ");
                if (Number(currentPoint[0]) && Number(currentPoint[0] !== 0)) {
                    var res = proj4(self.projection, 'WGS84', [Number(currentPoint[0]), Number(currentPoint[1])]);
                    if (currentFeature.geometry.type == "Polygon" && currentFeature.geometry.coordinates[0]) {
                        currentFeature.geometry.coordinates[0].push(res);
                    } else {
                        currentFeature.geometry.coordinates.push(res);
                    }
                }
            }
        });

        return g;
    };

    /**
     * Transform the points from OMO format to WGS84
     * @param points
     * @returns {Array}
     */
    GEOQA.prototype.convertPoints = function (points) {
        var newPoints = [];
        var self = this;
        points = points.split("\n");
        points.forEach(function (p) {
            var [lat, lng] = p.split(" ");
            if (lat && lng) {
                var res = proj4(self.projection, 'WGS84', [Number(lat), Number(lng)]);
                res[0] = Math.round(res[0] * 1000000) / 1000000; //to remove?
                res[1] = Math.round(res[1] * 1000000) / 1000000; //to remove?
                newPoints.push([res[1], res[0]]);
            }
        });
        return newPoints;
    };

    /**
     * Send the data to the server for the transformation
     * @param parameters, parameters for the transformation
     * @param attributes, attributes for the associations
     */
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
        if (attributes.length) {
            formData.append('attributes', attributes);
        }
        var promise = new Promise(function (resolve) {
            $.ajax({
                url: CONFIG.getMapURL(),
                type: "POST",
                data: formData,
                enctype: 'multipart/form-data',
                processData: false,
                contentType: false,
                cache: false,
                success: function (res) {
                    resolve(res);
                },
                error: function (e) {
                    console.log(e);
                }

            });
        });

        promise.then(function (res) {
            var geo = self.createJSON(res);
            var resultParam = res.statistics.split("\n")[1].split(";");
            var markers = self.convertPoints(res.resultPoints);
            self.helper.cleanResultMarkers();

            self.getResultMap(geo, resultParam);
            var color = "#378bcc";
            markers.forEach(function (marker, i) {
                color = self.markers2.lMarkers[i].color;
                var m1 = new L.marker([marker[0], marker[1]], {
                    icon: new L.DivIcon({
                        className: "number-icon",
                        iconSize: [25, 41],
                        iconAnchor: [12, 43],
                        html: i + 1 + '<br><i class="fa fa-thumb-tack iconMarker" style="color:' + color + '" aria-hidden="true"></i>'
                    }),
                    message: "Marker " + Number(i + 1)
                });

                self.markersResult.push(m1);
                self.resultMap.cluster.addLayer(m1);
            });

        });

    };

    /**
     * Insert the result map on the client
     * @param data, JSON file representing the map
     * @param resultParam, result parameters from the transformation
     */
    GEOQA.prototype.getResultMap = function (data, resultParam) {

        var omsMap3 = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 25,
            maxNativeZoom: 18,
        });
        var resultMap, map1, map2;
        if (!this.resultMap) {
            resultMap = L.map('resultMap', {center: [45.82789, 9.07617], zoom: 5, minZoom: 4});
            resultMap.addLayer(omsMap3);
            this.resultMap = resultMap;
            if (this.map1.isWms) {
                var wmsLayer = L.tileLayer.wms(this.map1.wms.url, this.map1.wms.param);
                map1 = wmsLayer;
            } else {
                map1 = L.vectorGrid.slicer(this.jsonMap1, {
                    rendererFactory: L.canvas.tile,
                    maxZoom: 25,
                    maxNativeZoom: 18,
                    vectorTileLayerStyles: {
                        sliced: function (properties, zoom) {
                            return {
                                fillColor: '#66ff66',
                                fillOpacity: 1,
                                stroke: true,
                                fill: true,
                                color: 'red',
                                strokeOpacity: 2,
                                weight: 1
                            }
                        }
                    },
                    interactive: true,
                    getFeatureId: function (f) {
                    }
                })
            }
            map1.addTo(resultMap);

            if (this.map2.isWms) {
                var wmsLayer = L.tileLayer.wms(this.map2.wms.url, this.map2.wms.param);
                map2 = wmsLayer;
            } else {
                map2 = L.vectorGrid.slicer(this.jsonMap2, {
                    rendererFactory: L.canvas.tile,
                    maxZoom: 25,
                    maxNativeZoom: 18,
                    vectorTileLayerStyles: {
                        sliced: function (properties, zoom) {
                            var line = properties.highway;
                            return {
                                fillColor: '#ff9966',
                                fillOpacity: 0.65,
                                stroke: line ? true : false,
                                fill: true,
                                color: 'red',
                                strokeOpacity: line ? 2 : 0,
                                weight: line ? 4 : 0
                            }
                        }
                    },
                    interactive: true,
                    getFeatureId: function (f) {
                    }
                });
            }
            map2.addTo(resultMap);
            var base = {
                "Base Map": omsMap3
            };
            var external = {};

            var over = new L.control.layers(base, external).addTo(resultMap);
            map1.setOpacity(0);
            map2.setOpacity(0);
            over.addOverlay(map1, "Map 1");
            over.addOverlay(map2, "Map 2");
            // resultMap.removeLayer(map1);
            // resultMap.removeLayer(map2);

            this.resultMap.cluster = L.markerClusterGroup({
                disableClusteringAtZoom: 18
            });

            over.addOverlay(this.resultMap.cluster, "Points");
            this.resultMap.over = over;
            this.markersResult = [];

            this.resultMap.addLayer(this.resultMap.cluster);

        } else {
            this.resultMap.removeLayer(this.finalLayers[2]);
            resultMap = this.resultMap;
            map1 = this.finalLayers[0];
            map2 = this.finalLayers[1];
            this.resultMap.over.removeLayer(this.finalLayers[2]);
        }

        this.resultJSON = data;
        var res = L.vectorGrid.slicer(data, {
            rendererFactory: L.canvas.tile,
            maxZoom: 25,
            maxNativeZoom: 18,
            vectorTileLayerStyles: {
                sliced: function (properties, zoom) {
                    return {
                        fillColor: '#bf1c2f',
                        fillOpacity: 0.65,
                        stroke: true,
                        fill: true,
                        color: 'red',
                        strokeOpacity: 0.5,
                        weight: 2
                    }
                }
            },
            interactive: true,
            getFeatureId: function (f) {
            }
        }).addTo(resultMap);

        this.resultMap.over.addOverlay(res, "Result Map");


        this.finalLayers = [map1, map2, res];
        this.UI.doubleView(false);
        var lat = data.features[0].geometry.coordinates[0][0][1] ? data.features[0].geometry.coordinates[0][0][1] : data.features[0].geometry.coordinates[0][1];
        var lng = data.features[0].geometry.coordinates[0][0][0] ? data.features[0].geometry.coordinates[0][0][0] : data.features[0].geometry.coordinates[0][0];
        resultMap.invalidateSize();
        resultMap.setView(new L.LatLng(lat, lng), 16);
        this.UI.showStatistics(resultParam);
        $("#loading").hide();
    };


    /**
     * Add a JSON file to the map
     * @param map, map in which to insert the layer
     * @param data, JSON data to be inserted
     */
    GEOQA.prototype.addJson = function (map, data, vectorGrid) {

        if (data.features.length == 0)
            return;

        var self = this;

        if (!vectorGrid) {
            var vectorGrid = L.vectorGrid.slicer(data, {
                rendererFactory: L.canvas.tile,
                maxZoom: 25, maxNativeZoom: 18,
                vectorTileLayerStyles: {
                    sliced: function (properties, zoom) {
                        var line = properties.highway;
                        return {
                            fillColor: '#ff8f00',
                            fillOpacity: 0.65,
                            stroke: line ? true : false,
                            fill: true,
                            color: 'red',
                            strokeOpacity: line ? 2 : 0,
                            weight: line ? 4 : 0
                        }
                    }
                },
                interactive: true,
                getFeatureId: function (f) {
                }
            })
        }
        vectorGrid.addTo(map);
        var temp = L.geoJson(data);

        if (map._container.id == "map1") {
            this.jsonMap1 = data;
            this.lMap1 = vectorGrid;
            this.jsonMap1.prop = this.UI.getProp(data);
            var res = proj4('WGS84', self.projection, [temp.getBounds()._southWest.lng, temp.getBounds()._southWest.lat]);
            var res1 = proj4('WGS84', self.projection, [temp.getBounds()._northEast.lng, temp.getBounds()._northEast.lat]);
            this.jsonMap1.extent = res[0] + " " + res[1] + " " + res1[0] + " " + res1[1];
            this.UI.addPropToMenu(1, this.jsonMap1.prop);
            var allCoords = [];

            data.features.forEach(function (f) {
                if (f.geometry && f.geometry.coordinates && f.geometry.coordinates.length > 0)
                    allCoords = allCoords.concat(self.helper.pushCoords(f.geometry.coordinates));

            });

            this.jsonMap1.coords = allCoords;

        } else {
            this.jsonMap2 = data;
            this.lMap2 = vectorGrid;
            this.jsonMap2.prop = this.UI.getProp(data);
            var res = proj4('WGS84', self.projection, [temp.getBounds()._southWest.lng, temp.getBounds()._southWest.lat]);
            var res1 = proj4('WGS84', self.projection, [temp.getBounds()._northEast.lng, temp.getBounds()._northEast.lat]);
            this.jsonMap2.extent = res[0] + " " + res[1] + " " + res1[0] + " " + res1[1];
            this.UI.addPropToMenu(2, this.jsonMap2.prop);


            var allCoords = [];
            data.features.forEach(function (f) {
                if (f.geometry && f.geometry.coordinates && f.geometry.coordinates.length > 0)
                    allCoords = allCoords.concat(self.helper.pushCoords(f.geometry.coordinates));

            });
            this.jsonMap2.coords = allCoords;

        }

        if (map.listenerClick) {
            map.off('click', map.listenerClick);
        }

        map.listenerClick = function (e) {
            var myPoint = L.point([e.latlng.lat, e.latlng.lng]);
            var min = Infinity;
            var closest;
            var data;
            if (e.target._container.id == 'map1') {
                data = self.jsonMap1.coords;
            } else {
                data = self.jsonMap2.coords;
            }


            data.forEach(function (coords) {
                var distance = L.point([coords[1], coords[0]]).distanceTo(myPoint);
                if (distance < min) {
                    min = distance;
                    closest = L.point(coords[1], coords[0]);
                }
            });
            if (closest) {
                var nearest = closest;
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
                    var duplicate = false;
                    self.markers1.markers.forEach(function (m) {
                        if (m[0] == nearest.x && m[1] == nearest.y) {
                            self.UI.successMessage("Point already present");
                            duplicate = true;
                        }
                    });
                    if (duplicate) {
                        return;
                    }


                }
                else {
                    mainMarkers = self.markers2;
                    oppositeMarkers = self.markers1;
                    var duplicate = false;
                    self.markers2.markers.forEach(function (m) {
                        if (m[0] == nearest.x && m[1] == nearest.y) {
                            self.UI.successMessage("Point already present");
                            duplicate = true;
                        }
                    });
                    if (duplicate) {
                        return;
                    }
                }
                if (mainMarkers.markers.length > oppositeMarkers.markers.length) {
                    self.UI.successMessage("Please, insert first another marker in the other map");
                    return;
                }

                var markerNumber;
                if (mainMarkers.missing.length != 0) {
                    markerNumber = mainMarkers.missing.shift();
                } else {
                    markerNumber = mainMarkers.markers.length;
                }


                self.helper.insertMarker(map, nearest.x, nearest.y, markerNumber, mainMarkers, e.target._container.id);

                if (mainMarkers.markers.length > 3 && oppositeMarkers.markers.length > 3 && $("#sync1").bootstrapSwitch('state')) {
                    $("#sync1").bootstrapSwitch('state', true);
                }
            }


        };

        map.on('click', map.listenerClick);

        $("#loading").hide();
        map.over.addOverlay(vectorGrid, "Vector layer" + map.over._layers.length);

        map.fitBounds(temp.getBounds());
        map.setZoom(14);
        map.fitBounds(temp.getBounds());

    };

    /**
     * Find the closest point in an array to a specified point
     * @param coordArray, array of coordinates (can have children)
     * @param point, specified point
     * @returns {Leaflet.Point}
     */
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

    /**
     * Retrieve Buildings from Overpass and insert into a map
     * @param numberMap
     */
    GEOQA.prototype.overPass = function (bbox, map, tags) {


        var data = `[out:json][timeout:25];(`;

        for (var x = 0; x < tags.length; x++) {
            data += `way[` + tags[x] + `](` + bbox + `);
                  relation[` + tags[x] + `](` + bbox + `);`
        }
        data += `);out ;>;out skel qt;`;


        var self = this;
        $.ajax({
            url: CONFIG.OVERPASS,
            data: data,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function (data) {
                if (data.elements.length < 1) {
                    $("#loading").hide();
                    self.UI.successMessage("No features found. Try to extend the selection or add new tags");
                    return;
                }
                data = osmtogeojson(data);

                self.addJson(map, data);
            },
            error: function (e) {
                console.log("error: " + JSON.stringify(e));
            }
        });
    };
    return GEOQA;
})
;
