define(['js/lib/bootbox.min'], function (bootbox) {
    var GeoHelper = function (parent) {
        this.app = parent;
    };

    GeoHelper.prototype.cleanAllMarkers = function () {
        var self = this.app;
        var i;

        $("#m1List").html("");
        $("#m2List").html("");
        for (i = 0; i < self.markers1.lMarkers.length; i++) {
            var removed = self.map1.removeLayer(self.markers1.lMarkers[i]);
            self.markers1.cluster.removeLayer(removed);
        }
        for (i = 0; i < self.markers2.lMarkers.length; i++) {
            var removed = self.map2.removeLayer(self.markers2.lMarkers[i]);
            self.markers2.cluster.removeLayer(removed);
        }


        self.markers1.markers = [];
        self.markers1.lMarkers = [];
        self.markers1.missing = [];
        self.map1.removeLayer(self.markers1.cluster);
        self.markers1.cluster = L.markerClusterGroup({
            disableClusteringAtZoom: 18
        });
        self.map1.addLayer(self.markers1.cluster);


        self.markers2.markers = [];
        self.markers2.lMarkers = [];
        self.markers2.missing = [];
        self.map2.removeLayer(self.markers2.cluster);
        self.markers2.cluster = L.markerClusterGroup({
            disableClusteringAtZoom: 18
        });
        self.map2.addLayer(self.markers2.cluster);
    };

    GeoHelper.prototype.cleanResultMarkers = function () {
        var self = this.app;
        var i;

        if (self.markersResult) {


            for (i = 0; i < self.markersResult.length; i++) {
                var removed = self.resultMap.removeLayer(self.markersResult[i]);
                self.resultMap.cluster.removeLayer(removed);
            }

            self.markersResult = [];

            self.resultMap.cluster = L.markerClusterGroup({
                disableClusteringAtZoom: 18
            });

        }
    };

    GeoHelper.prototype.download = function (strData, strFileName, strMimeType) {
        var createObjectURL = (window.URL || window.webkitURL || {}).createObjectURL || function(){};
        var blob = null;
        var content = strData;
        var mimeString = "application/octet-stream";
        window.BlobBuilder = window.BlobBuilder ||
            window.WebKitBlobBuilder ||
            window.MozBlobBuilder ||
            window.MSBlobBuilder;


        if(window.BlobBuilder){
            var bb = new BlobBuilder();
            bb.append(content);
            blob = bb.getBlob(mimeString);
        }else{
            blob = new Blob([content], {type : mimeString});
        }
        var url = createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url
        a.download = "resultMap.geojson";
        a.innerHTML = "Download Ready!";
        $("#downloadButton").appendChild(a);
        return true;
    };
    GeoHelper.prototype.removeMarker = function (tempMarker, mainMarkers, oppositeMarkers, map, otherMap) {
        map.removeLayer(tempMarker);
        mainMarkers.markers.forEach(function (marker, index) {
            var numberOfMissing = 0;
            if (marker[0] == tempMarker._latlng.lat && marker[1] == tempMarker._latlng.lng) {
                if (index !== mainMarkers.markers.length - 1) {
                    numberOfMissing = mainMarkers.missing.length;
                    mainMarkers.missing.push(mainMarkers.lMarkers[index].indexMarker - 1);
                    mainMarkers.missing.sort();
                }
                mainMarkers.markers.splice(index, 1);
                var removed = mainMarkers.lMarkers.splice(index, 1);
                mainMarkers.cluster.removeLayer(removed[0]);
                if (oppositeMarkers.lMarkers[index - numberOfMissing]) {
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
                                oppositeMarkers.cluster.removeLayer(r[0]);
                                if (r.length !== 0) {
                                    otherMap.removeLayer(r[0]);
                                }
                            }
                        }

                    });
                }
            }
        });
    };

    GeoHelper.prototype.pushCoords = function (coords){
        var allCoords=[];
       for(var x=0;x<coords.length;x++){
            if (typeof(coords[x][0]) == "object") {
                allCoords=allCoords.concat(this.pushCoords(coords[x]));
            } else {
                coords[x][0]=Math.round(coords[x][0]*1000000)/1000000; //to remove?
                coords[x][1]=Math.round(coords[x][1]*1000000)/1000000; //to remove?
                allCoords.push(coords[x]);

            }
        }
        return allCoords;
    };
    GeoHelper.prototype.addMarkerToInterface = function (tempMarker, markerNum, map) {
        var mapNumber = map.split("map")[1];

        var newMarker = $("<div data-num='" + (markerNum + 1) + "' class=marker>" +
            "<div class='nameMarker'>" +
            "<div class='btn btn-danger btn-responsive'> #" + (markerNum + 1) + "  <i class='fa fa-trash-o' aria-hidden='true'></i></div>" +
            "</div></div>");

        $("#m" + mapNumber + "List").append(newMarker);


        var self = this;
        var mainMarkers;
        var otherMap;
        var oppositeMarkers;
        newMarker.click(function () {
            if (mapNumber == "1") {
                mainMarkers = self.app.markers1;
                oppositeMarkers = self.app.markers2;
                map = self.app.map1;
                otherMap = self.app.map2;
            } else if (mapNumber == "2") {
                mainMarkers = self.app.markers2;
                oppositeMarkers = self.app.markers1;
                map = self.app.map2;
                otherMap = self.app.map1;
            }
            self.removeMarker(tempMarker, mainMarkers, oppositeMarkers, map, otherMap);
            $(".marker").filter(function () {
                if ($(this).data("num") == markerNum + 1) {
                    $(this).remove();
                }
            })
        });


    };

    GeoHelper.prototype.getColor = function (weight, inputColors) {
        var p, colors = [];

        colors[1] = inputColors[0];
        colors[0] = inputColors[1];
        p = weight / 50;

        var w = p * 2 - 1;
        var w1 = (w / 1 + 1) / 2;
        var w2 = 1 - w1;
        var rgb = [Math.round(colors[0][0] * w1 + colors[1][0] * w2),
            Math.round(colors[0][1] * w1 + colors[1][1] * w2),
            Math.round(colors[0][2] * w1 + colors[1][2] * w2)
        ];
        return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
    };

    GeoHelper.prototype.insertMarker = function (map, lat, lng, markerNumber, mainMarkers, mapNumber, color, fast) {
        var self = this;
        if (!color) {
            color = 'rgb(14, 88, 202)';
        }
        var m1 = new L.marker([lat, lng], {
                icon: new L.DivIcon({
                    className: "number-icon",
                    iconSize: [25, 41],
                    iconAnchor: [12, 43],
                    html: markerNumber + 1 + '<br><i class="fa fa-thumb-tack iconMarker" style="color:' + color + '" aria-hidden="true"></i>'
                }),
                message: "Marker " + Number(markerNumber + 1)
            }
        );

        if (mainMarkers) {
            mainMarkers.cluster.addLayer(m1);
            m1.indexMarker = Number(markerNumber + 1);
            m1.color = color;
            if(!fast) {
                m1.bindPopup("Marker " + Number(markerNumber + 1) + "<br><input type='button' value='Remove' class='btn btn-danger marker-delete-button'/>");
                m1.on("popupopen", onPopupOpen);
                mainMarkers.lMarkers.splice(markerNumber, 0, m1);
                mainMarkers.markers.splice(markerNumber, 0, [lat, lng]);
            }
        }

        if (mapNumber && !fast) {
            this.addMarkerToInterface(m1, markerNumber, mapNumber);
        }
        function onPopupOpen() {
            var mainMarkers;
            var map;
            var otherMap;
            var oppositeMarkers;
            if (this._map._container.id == "map1") {
                mainMarkers = self.app.markers1;
                oppositeMarkers = self.app.markers2;
                map = self.app.map1;
                otherMap = self.app.map2;
            } else {
                mainMarkers = self.app.markers2;
                oppositeMarkers = self.app.markers1;
                map = self.app.map2;
                otherMap = self.app.map1;
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
        }

    };
    return GeoHelper;
});
