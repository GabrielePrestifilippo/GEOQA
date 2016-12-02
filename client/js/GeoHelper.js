define(['js/lib/bootbox.min'], function (bootbox) {
    var GeoHelper = function (parent) {
        this.app = parent;
    };

    GeoHelper.prototype.cleanAllMarkers = function () {
        var self = this.app;
        var i;
        for (i = 0; i < self.markers1.lMarkers.length; i++) {
            self.map1.removeLayer(self.markers1.lMarkers[i]);
        }
        for (i = 0; i < self.markers2.lMarkers.length; i++) {
            self.map2.removeLayer(self.markers2.lMarkers[i]);
        }
        self.markers1 = {
            markers: [],
            lMarkers: [],
            missing: []
        };
        self.markers2 = {
            markers: [],
            lMarkers: [],
            missing: []
        };
    };
    GeoHelper.prototype.removeMarker = function (tempMarker, mainMarkers, oppositeMarkers, map, otherMap) {
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
            } else {
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
    GeoHelper.prototype.insertMarker = function (map, lat, lng, markerNumber, mainMarkers, mapNumber) {
        var self = this;
        var m1 = new L.marker([lat, lng], {
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
        mainMarkers.markers.splice(markerNumber, 0, [lat, lng]);
        this.addMarkerToInterface(m1, markerNumber, mapNumber);
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
