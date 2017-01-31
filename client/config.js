var CONFIG={
    homologousURL: 'http://131.175.59.195:8080/GEOQA-0.1.0/getHomologus',//"http://localhost:8080/getHomologus",  // "http://131.175.143.84/geo/getHomologus",
    getMapURL: 'http://131.175.59.195:8080/GEOQA-0.1.0/send',//"http://localhost:8080/send", // "http://131.175.143.84/geo/send",
    OGRE: 'http://ogre.adc4gis.com/convert',
    OVERPASS: 'http://overpass-api.de/api/interpreter',
    GEOSERVER: 'http://131.175.59.195/geoserver/',//http://131.175.143.51/geoserver/',//,http://127.0.0.1/geoserver/'
    GEONODE:  'http://131.175.59.195/',//'http://131.175.143.51/',//'http://127.0.0.1/',//'http://131.175.143.51/'

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
