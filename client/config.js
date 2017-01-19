var CONFIG={
    homologousURL: "http://localhost:8080/getHomologus",  // "http://131.175.143.84/geo/getHomologus",
    getMapURL: "http://localhost:8080/send", // "http://131.175.143.84/geo/send",
    OGRE: 'http://ogre.adc4gis.com/convert',
    OVERPASS: 'http://overpass-api.de/api/interpreter',

    STARTUP: function(self){
        setTimeout(function () {
            $.ajax({
                url: 'map2.geojson',
                type: 'POST',
                success: function (data) {
                    self.addJson(self.map1, data);
                }
            });

            $.ajax({
                url: 'map1.geojson',
                type: 'POST',
                success: function (data) {
                    self.addJson(self.map2, data);
                }
            });

        }, 2000);
    }
};