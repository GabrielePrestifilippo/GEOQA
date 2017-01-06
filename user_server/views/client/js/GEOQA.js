define([
    'jquery',
    'bootstrap',
    'osmtogeojson',
    'leaflet',
    'js/GeoHelper',
    'leaflet-vector',
    'leaflet-pip',
    'js/proj4',
    'leaflet-marker',
    'bootstrap-select',
    'leaflet-areaselect',
    'leaflet-MapSync',
    'bootstrapSwitch',
    'js/transformation'


], function ($, bootstrap, osmtogeojson, L, GeoHelper, LeafletVectorGridbundled, leafletPip, proj4) {
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
                url: "http://localhost:8080/getHomologus",
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
                var marker1 = self.convertPoints(res.resultPoints);
                var marker2 = self.convertPoints(res.resultPoints1);
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
        function searchAndFill(ob, arr) {
            if (typeof(ob) == "object" && typeof(ob[0]) == "number") {
                arr.push([ob[0], ob[1]]);
            } else {
                ob.forEach(function (insideOb) {
                    searchAndFill(insideOb, arr)
                })
            }
        }

        var arrayList = [];

        //for each feature of the json
        jsonData.features.forEach(function (features, index) {
            arrayList[index] = [];
            arrayList[index].myProp = type; //assign a properties to each feature, initialize it to a number (0,1->map0, map1)

            //retrieve all the coordinates for the selected feature and put the in the arrayList
            searchAndFill(features.geometry.coordinates, arrayList[index]);

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
            //for each coordinate we put a new line with A coordinates
            carString += "\nA " + feature.myProp;
            feature.forEach(function (coords) {
                //we convert the coordinates into 32632
                var res = proj4('WGS84', self.projection, [coords[0], coords[1]]);
                carString += "\n" + res[0] + " " + res[1] + " 0";
            })
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

        var geomPoints = data.resultMap.split("\n");
        geomPoints.shift();
        var currentFeature = JSON.parse(JSON.stringify(f));

        geomPoints.forEach(function (point) {
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
                url: "http://localhost:8080/send",
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
            self.resultMap(geo, resultParam);
        });

    };

    /**
     * Insert the result map on the client
     * @param data, JSON file representing the map
     * @param resultParam, result parameters from the transformation
     */
    GEOQA.prototype.resultMap = function (data, resultParam) {

        var omsMap3 = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'});
        var resultMap = L.map('resultMap', {center: [45.82789, 9.07617], zoom: 5, minZoom: 4});
        resultMap.addLayer(omsMap3);
        this.resultlMap = resultMap;
        this.resultJSON = data;
        var res = L.vectorGrid.slicer(data, {
            rendererFactory: L.svg.tile,
            vectorTileLayerStyles: {
                sliced: function (properties, zoom) {
                    return {
                        fillColor: '#222',
                        fillOpacity: 1,
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
                        fillOpacity: 1,
                        stroke: false,
                        fill: true
                    }
                }
            },
            interactive: true,
            getFeatureId: function (f) {
            }
        }).addTo(resultMap);
        var map2 = L.vectorGrid.slicer(this.jsonMap2, {
            rendererFactory: L.svg.tile,
            vectorTileLayerStyles: {
                sliced: function (properties, zoom) {
                    return {
                        fillColor: '#ff9966',
                        fillOpacity: 1,
                        stroke: false,
                        fill: true
                    }
                }
            },
            interactive: true,
            getFeatureId: function (f) {
            }
        }).addTo(resultMap);
        var base = {
            "Base Map": omsMap3
        };
        var external = {};

        var over = new L.control.layers(base, external).addTo(resultMap);
        map1.setOpacity(0);
        map2.setOpacity(0);
        over.addOverlay(map1, "Map 1");
        over.addOverlay(map2, "Map 2");
        over.addOverlay(res, "Result map");
        this.finalLayers = [map1, map2, res];
        $("#map1, #map2").hide();
        $("#resultMap").show();
        $("#downloadButton").show();
        $("#mapAfterControls").hide();

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
                    self.UI.successMessage("Please, insert first another marker in the other map");
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
                    $("#sync1").bootstrapSwitch('state', true);
                }
            }
        };

        map.on('click', map.listenerClick);


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
    GEOQA.prototype.overPass = function (bbox,map) {



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
