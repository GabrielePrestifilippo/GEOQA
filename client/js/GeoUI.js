define([], function () {

    var GeoUI = function (parent) {
    };

    GeoUI.prototype.getProp = function (data) {
        var prop = {};
        data.features.forEach(function (feature) {
            for (var key in feature.properties) {

                if (feature.properties.hasOwnProperty(key) && prop[key]) {
                    if (prop[key].indexOf(feature.properties[key]) == -1) {
                        prop[key].push(feature.properties[key]);
                    }
                } else {
                    prop[key] = [];
                    prop[key].push(feature.properties[key]);
                }
            }
        });
        return prop;
    };
    GeoUI.prototype.addPropToMenu = function (map, prop) {
        var selectMenu;

        if (map == 1) {
            selectMenu = $(".selectDropDownLeft");
        } else if (map == 2) {
            selectMenu = $(".selectDropDownRight");
        } else {
            return;
        }
        var group = "";
        for (var key in prop) {
            if (prop.hasOwnProperty(key) && key !== "id") {
                group += "<optgroup label='" + key + "'>";
                var listOfVal = [];
                prop[key].forEach(function (val) {
                    if (typeof(val) == "string") {
                        if (listOfVal.indexOf(val) == -1) {
                            listOfVal.push(val);
                            group += "<option>" + val + "</option>";
                        }
                    } else if (Object.prototype.toString.call(val) === '[object Array]' && !val[0]) {
                        //not defined yet
                    } else if (typeof(val) == "object" && val !== null && Object.keys(val).length > 0) {
                        var element = Object.keys(val)[0] + ": " + val[Object.keys(val)[0]];
                        if (listOfVal.indexOf(element) == -1) {
                            listOfVal.push(element);
                            group += "<option>" + element + "</option>"
                        }
                    }
                });

                group += "</optgroup>";
            }
        }

        //selectMenu.selectpicker('refresh');
        if (map == 1) {
            $(".selectionFeatures").find('select').append(group);
            selectMenu.find('select').append(group);
            $(".selectionFeatures").selectpicker('refresh');

        } else {
            selectMenu.find('select').append(group);
        }
        selectMenu.selectpicker('refresh');

    };
    return GeoUI;
})
;
