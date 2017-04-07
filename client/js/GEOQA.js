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
                    try {
                        resolve(res);
                    }catch(e){
                        $("#loading").hide();
                        alert("Error occurred:"+e);
                    }
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
            var tooManyMarkers = false;
            if (marker1.length > 2000) {
                tooManyMarkers = true;
                marker1 = marker1.slice(0, 2000);
                marker2 = marker2.slice(0, 2000);
            }
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
                var min = Infinity;
                var closest = undefined;
                //get the closes point to this marker
                var arrayClosest = self.jsonMap1.quad.retrieve({x: marker.x, y: marker.y});

                //if not found: bruteforce the search
                if (!arrayClosest.length) {
                    self.jsonMap1.coords.forEach(function (coord) {
                        var distance = L.point([coord[1], coord[0]]).distanceTo(marker);
                        if (distance < min) {
                            min = distance;
                            closest = L.point(coord[1], coord[0]);
                        }
                    });
                } else {
                    //if the closest list is found: bruteforce among the list
                    arrayClosest.forEach(function (coords) {
                        var distance = L.point([coords.x, coords.y]).distanceTo(marker);
                        if (distance < min) {
                            min = distance;
                            closest = L.point(coords.x, coords.y);
                        }
                    })
                }
                var distanceHomologous = marker.distance;
                var color = self.helper.getColor(((distanceHomologous - minDistance) / (maxDistance - minDistance)) * 100, colors);

                self.helper.insertMarker(self.map1, closest.x, closest.y, (i + 1), self.markers1, "map1", color);
            });
            markerLeaflet2.forEach(function (marker, i) {
                var min = Infinity;
                var closest = undefined;
                //get the closes point to this marker
                var arrayClosest = self.jsonMap2.quad.retrieve({x: marker.x, y: marker.y});

                //if not found: bruteforce the search
                if (!arrayClosest.length) {
                    self.jsonMap2.coords.forEach(function (coord) {
                        var distance = L.point([coord[1], coord[0]]).distanceTo(marker);
                        if (distance < min) {
                            min = distance;
                            closest = L.point(coord[1], coord[0]);
                        }
                    });
                } else {
                    //if the closest list is found: bruteforce among the list
                    arrayClosest.forEach(function (coords) {
                        var distance = L.point([coords.x, coords.y]).distanceTo(marker);
                        if (distance < min) {
                            min = distance;
                            closest = L.point(coords.x, coords.y);
                        }
                    })
                }
                var distanceHomologous = marker.distance;
                var color = self.helper.getColor(((distanceHomologous - minDistance) / (maxDistance - minDistance)) * 100, colors);

                self.helper.insertMarker(self.map2, closest.x, closest.y, (i + 1), self.markers2, "map2", color);
            });
            $("#loading").hide();

            if (tooManyMarkers) {

                bootbox.confirm({
                    message: "Too many points found. Only the first 2000 will be considered. " +
                    "For a better warping, contact us",
                    buttons: {
                        cancel: {
                            label: 'Ok',
                            className: 'btn-default'
                        },
                        confirm: {
                            label: 'Contact-Us',
                            className: 'btn-info'
                        }
                    },
                    callback: function (result) {
                        if (result) {
                            location.href = "mailto:gabriele.prestifilippo@polimi.it";
                        }
                    }
                });


            }
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
        var letterType;
        //for each feature of the json
        jsonData.features.forEach(function (features, index) {
            if (!features.geometry || !features.geometry.type) {
                return;
            }
            arrayList[index] = [];
            arrayList[index].myProp = type; //assign a properties to each feature, initialize it to a number (0,1->map0, map1)

            if (features.geometry.type == "Polygon" || features.geometry.type == "MultiPolygon") {
                letterType = "A";
            } else {
                letterType = "L";
            }
            arrayList[index].letterType = letterType;
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
                    try {
                        resolve(res);
                    }catch(e){
                        $("#loading").hide();
                        alert("Error occurred:"+e);
                    }
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
                                fillOpacity: 0.65,
                                stroke: true,
                                fill: true,
                                color: 'red',
                                strokeOpacity: 2,
                                weight: 4
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

        var allCoords=this.getCoords(data);

        if(allCoords.length>250000){
            bootbox.confirm({
                message: "Too many nodes were found on this layer. Please try with a smaller one",
                buttons: {
                    cancel: {
                        label: 'Ok',
                        className: 'btn-default'
                    },
                    confirm: {
                        label: 'Contact-Us',
                        className: 'btn-info'
                    }
                },
                callback: function (result) {
                    if (result) {
                        location.href = "mailto:gabriele.prestifilippo@polimi.it";
                    }
                }
            });
            return;
        }

        if (map._container.id == "map1") {
            this.jsonMap1 = data;
            this.lMap1 = vectorGrid;
            this.jsonMap1.prop = this.UI.getProp(data);

            var lng = temp.getBounds()._northEast.lng;
            var zone = ((Math.floor((lng + 180) / 6) % 60) + 1);
            self.projection=self.projection.split("32").join(zone);
            var res = proj4('WGS84', self.projection, [temp.getBounds()._southWest.lng, temp.getBounds()._southWest.lat]);
            var res1 = proj4('WGS84', self.projection, [temp.getBounds()._northEast.lng, temp.getBounds()._northEast.lat]);
            this.jsonMap1.extent = res[0] + " " + res[1] + " " + res1[0] + " " + res1[1];
            this.UI.addPropToMenu(1, this.jsonMap1.prop);
            /*
             var allCoords = [];
             data.features.forEach(function (f) {
             if (f.geometry && f.geometry.coordinates && f.geometry.coordinates.length > 0)
             allCoords = allCoords.concat(self.helper.pushCoords(f.geometry.coordinates));

             });

             */
            var minLat = allCoords.reduce(function (min, arr) {
                return min <= arr[0] ? min : arr[0];
            }, Infinity);

            var maxLat = allCoords.reduce(function (max, arr) {
                return max >= arr[0] ? max : arr[0];
            }, -Infinity);

            var minLng = allCoords.reduce(function (min, arr) {
                return min <= arr[1] ? min : arr[1];
            }, Infinity);

            var maxLng = allCoords.reduce(function (max, arr) {
                return max >= arr[1] ? max : arr[1];
            }, -Infinity);

            var bounds = {
                x: minLng,
                y: minLat,
                width: maxLng - minLng,
                height: maxLat - minLat
            };
            var quad = new QuadTree(bounds, true, 1);


            allCoords.forEach(function (coord) {
                quad.insert({x: coord[1], y: coord[0]});
            });
            this.jsonMap1.quad = quad;
            this.jsonMap1.coords = allCoords;

        } else {
            this.jsonMap2 = data;
            this.lMap2 = vectorGrid;
            this.jsonMap2.prop = this.UI.getProp(data);
            var res = proj4('WGS84', self.projection, [temp.getBounds()._southWest.lng, temp.getBounds()._southWest.lat]);
            var res1 = proj4('WGS84', self.projection, [temp.getBounds()._northEast.lng, temp.getBounds()._northEast.lat]);
            this.jsonMap2.extent = res[0] + " " + res[1] + " " + res1[0] + " " + res1[1];
            this.UI.addPropToMenu(2, this.jsonMap2.prop);

            /*
             var allCoords = [];
             data.features.forEach(function (f) {
             if (f.geometry && f.geometry.coordinates && f.geometry.coordinates.length > 0)
             allCoords = allCoords.concat(self.helper.pushCoords(f.geometry.coordinates));

             });
             */
            this.jsonMap2.coords = allCoords;

            var minLat = allCoords.reduce(function (min, arr) {
                return min <= arr[0] ? min : arr[0];
            }, Infinity);

            var maxLat = allCoords.reduce(function (max, arr) {
                return max >= arr[0] ? max : arr[0];
            }, -Infinity);

            var minLng = allCoords.reduce(function (min, arr) {
                return min <= arr[1] ? min : arr[1];
            }, Infinity);

            var maxLng = allCoords.reduce(function (max, arr) {
                return max >= arr[1] ? max : arr[1];
            }, -Infinity);

            var bounds = {
                x: minLng,
                y: minLat,
                width: maxLng - minLng,
                height: maxLat - minLat
            };
            var quad = new QuadTree(bounds, true, 2);


            allCoords.forEach(function (coord) {
                quad.insert({x: coord[1], y: coord[0]});
            });
            this.jsonMap2.quad = quad;

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
                data = self.jsonMap1.quad;
            } else {
                data = self.jsonMap2.quad;
            }


            var arrayClosest = data.retrieve({x: e.latlng.lat, y: e.latlng.lng});

            arrayClosest.forEach(function (coords) {
                var distance = L.point([coords.x, coords.y]).distanceTo(myPoint);
                if (distance < min) {
                    min = distance;
                    closest = L.point(coords.x, coords.y);
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

    GEOQA.prototype.getCoords = function (i) {
        i = JSON.stringify(i);
        i = i.match(/\[([*-9]+)\]/g);
        i = i.join();
        i = i.replace(/\[/g, '');
        i = i.replace(/\]/g, '');
        i = i.split(",");

        var c = [];
        for (var x = 0; x < i.length; x = x + 2) {
            c.push([Number(i[x]), Number(i[x + 1])])
        }
        return c;
    };

    GEOQA.prototype.loadCoords = function (a, b) {
        //  var a=[[45.49771957212775,9.112296786462249],[45.49787501891305,9.112893293539399],[45.497956467792406,9.112984970881437],[45.51269469238803,9.254884354425768],[45.51259087154552,9.254897736870701],[45.51273779946706,9.254677401757101],[45.43175401236009,9.248292293979846],[45.43149944990296,9.248719707183495],[45.431343725977165,9.248531400036715],[45.43849521561157,9.127848821239239],[45.43867648052525,9.127704893880166],[45.43876018074679,9.12788148909149],[45.46477981036893,9.19132451519824],[45.46478442319138,9.19081293306342],[45.46490950532482,9.190671842332836],[45.452929056968685,9.143290585475107],[45.45305095687032,9.14455782657621],[45.45284513335531,9.144469630638627],[45.500228184226835,9.18850485516794],[45.50034102525048,9.187978800943],[45.47209289756637,9.235755330576627],[45.47162527228278,9.236019236857613],[45.47220552617896,9.235642572052036],[45.434996633987005,9.184929440697836],[45.43499809161478,9.184713949119578]];

        // var b=[[45.49772073240106,9.112298067515155],[45.49787554615267,9.11288404636602],[45.497977973009455,9.112982030814123],[45.512703468142746,9.254900894948747],[45.512581176175445,9.254915479460266],[45.512755687399505,9.254693945759385],[45.43175833954871,9.248296458162201],[45.431503026778046,9.248723767585972],[45.43134628518868,9.24853349838395],[45.43848615794997,9.127863680803529],[45.43868195920808,9.127700066053592],[45.43876091673599,9.127855634176484],[45.464783289509455,9.191340168812701],[45.46478857010845,9.190828034528778],[45.464922596740195,9.190696773925083],[45.45293136224112,9.143300883335286],[45.45305457621777,9.144562359762915],[45.45285374581775,9.144478289274076],[45.50022683763089,9.188508929558736],[45.50033915513342,9.187986820810067],[45.472095326561885,9.235752856244005],[45.47162476651772,9.236030632515167],[45.472208733711824,9.23561958398355],[45.43498595900374,9.184950727842562],[45.43498973086017,9.184700947127993]];

        var self = this;
        a.forEach(function (coords, index) {

            var e1 = {};
            e1.latlng = {};
            e1.latlng.lat = a[index][0];
            e1.latlng.lng = a[index][1];
            e1.target = {};
            e1.target._container = {};
            e1.target._container.id = "map1";


            var e2 = {};
            e2.latlng = {};
            e2.latlng.lat = b[index][0];
            e2.latlng.lng = b[index][1];
            e2.target = {};
            e2.target._container = {};
            e2.target._container.id = "map2";

            self.map1.listenerClick(e1);
            self.map2.listenerClick(e2);
        });

    };

    GEOQA.prototype.verifyPoints = function () {
        var self = this;
        var diffs = [];
        var coord_sx = [], coord_dx = [];
        if (self.markers1.markers.length >= 4 && self.markers2.markers.length >= 4) {
            if(self.markers1.markers.length > 100){
                bootbox.confirm({
                    message: "Too many points found. Only the first 100 will be considered. " +
                    "For a better warping, contact us",
                    buttons: {
                        cancel: {
                            label: 'Ok',
                            className: 'btn-default'
                        },
                        confirm: {
                            label: 'Contact-Us',
                            className: 'btn-info'
                        }
                    },
                    callback: function (result) {
                        if (result) {
                            location.href = "mailto:gabriele.prestifilippo@polimi.it";
                        }
                    }
                });
            }
            var diff, x1a, x1b, y1a, y1b, x2a, x2b, y2a, y2b;

            var min=Math.min(self.markers1.markers.length,100);
            for (var x = 0; x < min; x++) { //for each markers
                for (var y = 0; y < min; y++) { //push all coords
                    if (y != x) { //avoid 1 per time 1,2,3,4 etc..
                        coord_sx.push(self.markers1.markers[y]);
                        coord_dx.push(self.markers2.markers[y]);
                    }
                }
                var t = Transformation;

                t.setPoints(coord_dx, coord_sx);


                x1a = self.markers1.markers[x][0];
                y1a = self.markers1.markers[x][1];
                [x2a, y2a] = t.transform([x1a, y1a]);
                diff = Math.sqrt(Math.pow(x2a - x1a, 2) + Math.pow(y2a - y1a, 2));

                diffs.push(diff);

                x1b = self.markers2.markers[x][0];
                y1b = self.markers2.markers[x][1];
                [x2b, y2b] = t.transform([x1b, y1b]);
                diff = Math.sqrt(Math.pow(x2b - x1b, 2) + Math.pow(y2b - y1b, 2));

                diffs.push(diff);
            }

        }
        var min = Math.min.apply(Math, diffs);
        var max = Math.max.apply(Math, diffs);
        var n;
        var normalized = [];
        for (var x = 0; x < diffs.length; x++) {
            n = (diffs[x] - min) / (max - min)*100;
            normalized.push(Number(n.toFixed(3)));
        }

        return normalized;
    };
    return GEOQA;
});

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
