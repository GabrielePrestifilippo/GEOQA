var CONFIG={
    homologous: 'http://131.175.59.195:8080/GEOQA-0.1.0/getHomologus',
    homologous_local: "http://localhost:8080/getHomologus",
    getMap: 'http://131.175.59.195:8080/GEOQA-0.1.0/send/',
    getMap_local: "http://localhost:8080/send",
    OGRE: 'http://ogre.adc4gis.com/convert',
    OVERPASS: 'http://overpass-api.de/api/interpreter',
    GEOSERVER: 'http://131.175.59.195/geoserver/',
    GEOSERVER_local: 'http://131.175.59.195/geoserver/',//'http://127.0.0.1/geoserver/',
    GEONODE:  'http://131.175.59.195',
    GEONODE_local: 'http://131.175.59.195',//'http://127.0.0.1/',
    DEVELOPMENT:true,

    homologousURL: function() {
        if(this.DEVELOPMENT){
            return this.homologous_local;
        }
        return this.homologous;
    },

    geonodeURL: function() {
        if(this.DEVELOPMENT){
            return this.GEONODE_local;
        }
        return this.GEONODE;
    },
    geoserverURL: function() {
        if(this.DEVELOPMENT){
            return this.GEOSERVER_local;
        }
        return this.GEOSERVER;
    },

    getMapURL: function() {
        if(this.DEVELOPMENT){
            return this.getMap_local;
        }
        return this.getMap;
    }
};
