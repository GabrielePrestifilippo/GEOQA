define(['jquery'], function ($) {

    var GeoUI = function () {
        var self = this;

        /**
         * Insert the name of the selected file on the button
         */
        $("#myFile1").on('change', function () {
            $("#nameFile").html(document.getElementById('myFile1').files[0].name);
        });

        /**
         * Open the menu for the parameters for the transformation
         */
        $("#openParamMenu").click(function () {
            var open = $("#parameters").prop("open");
            self.closeAllMenu();
            if (!open) {
                $("#parameters").css("max-height", "140px");
                $("#parameters").prop("open", true);
            }
        });

        /**
         * Open the menu to upload the shapes
         */
        $("#openShapeMenu").click(function () {
            var open = $("#shapes").prop("open");
            self.closeAllMenu();
            if (!open) {
                $("#shapes").prop("open", true);
                $("#shapes").css("min-height", "100vh");
                $("#shapes").css("max-height", "1000px");
            }
        });

        /**
         * Not documented - to be removed
         */
        $("#buttonM1").click(function () {
            var open = $("#m1List").prop("open");
            if (!open) {
                $("#m1List").css("max-height", "80%");
                $("#m1List").prop("open", true);
            } else {
                $("#m1List").css("max-height", "0px");
                $("#m1List").prop("open", false);
            }
        });
        $("#buttonM2").click(function () {
            var open = $("#m2List").prop("open");
            if (!open) {
                $("#m2List").css("max-height", "80%");
                $("#m2List").prop("open", true);
            } else {
                $("#m2List").css("max-height", "0px");
                $("#m2List").prop("open", false);
            }
        });


        /**
         * Button to show the opacity menu
         */
        $("#buttonOpacity").click(function () {
            var open = $("#opacityList").prop("open");
            if (!open) {
                $("#opacityList").css("height", "170px");
                $("#opacityList").prop("open", true);
            } else {
                $("#opacityList").css("height", "0px");
                $("#opacityList").prop("open", false);
            }
        });

        /**
         * Open the left menu
         */
        $("#openMenu").click(function () {
            var open = $("#menu").prop("open");
            if (!open) {
                $("#menu").css("margin-left", "0px");
                $("#menu").prop("open", true);
            } else {
                self.closeMenu();
            }
        });

        /**
         * Go back to double view
         */
        $("#doubleViewButton").click(function () {
            if (this.childNodes[0].classList[1] == "fa-forward") {
                self.doubleView(false);
            } else {
                self.doubleView(true);
            }
        });

        /**
         * Open the menu to find the Homolgous points
         */
        $("#findMenu").click(function () {
            var open = $("#featuresMenu").prop("open");
            self.closeAllMenu();
            if (!open) {
                $("#featuresMenu").css("min-height", "100vh");
                $("#featuresMenu").css("max-height", "1000px");
                $("#featuresMenu").prop("open", true);
            }
        });


        /**
         * Open the menu to verify the points
         */
        $("#runMenuButton").click(function () {
            var open = $("#runMenu").prop("open");
            self.closeAllMenu();
            if (!open) {
                $("#runMenu").css("min-height", "100vh");
                $("#runMenu").css("max-height", "1000px");
                $("#runMenu").prop("open", true);
            }
        });

        /**
         * Clone a new tag menu to insert a new tag
         */
        $("#addTag").click(function () {
            var btn = $(".featuresTag:last").clone();
            btn.appendTo("#groupTag");
            var select = btn.find('select');
            btn.find('.bootstrap-select').remove();

            btn.prepend(select);
            btn.find('select').selectpicker();


            btn.children()[1].addEventListener("click", function () {
                $(this).parent().remove();
            })
        });

        /**
         * Clone a new association menu to insert a new association
         */
        $("#addAssociation").click(function () {
            var btn = $(".featuresAssociation:last").clone();
            btn.appendTo("#groupAssociation");
            var select = btn.find('select');
            btn.find('.bootstrap-select').remove();

            btn.prepend(select);
            btn.find('select').selectpicker();


            btn.children()[2].addEventListener("click", function () {
                $(this).parent().remove();
            })
        });

        this.fillLayersList();
    };

    /**
     * Close the left menu
     */
    GeoUI.prototype.closeMenu = function () {
        $("#menu").css("margin-left", "-40%");
        $("#menu").prop("open", false);
    };

    /**
     * Close the left menu
     */
    GeoUI.prototype.closeAllMenu = function () {
        $("#shapes").css("max-height", "0px");
        $("#shapes").css("min-height", "0px");
        $("#shapes").prop("open", false);
        $("#parameters").css("max-height", "0px");
        $("#parameters").prop("open", false);
        $("#featuresMenu").css("max-height", "0px");
        $("#featuresMenu").css("min-height", "0px");
        $("#featuresMenu").prop("open", false);
        $("#runMenu").css("max-height", "0px");
        $("#runMenu").css("min-height", "0px");
        $("#runMenu").prop("open", false);
    };

    /**
     * Show a success message
     * @param string input to show the success message
     */
    GeoUI.prototype.successMessage = function (string) {
        $("#messageContainer").show();
        $("#messageContainer").html(string);
        $("#messageContainer").css("opacity", "1");
        setTimeout(function () {
            $("#messageContainer").css("opacity", "0");
            $("#messageContainer").hide();
        }, 2000);
    };

    /**
     * Retrieve all the properties from a geoJSON
     * @param data, input geoJSON file
     * @returns {{properties}}
     */
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

    /**
     * Insert the properties on the corresponding dropdown menu
     * @param map, map to indicate the dropdown menu
     * @param prop, properties to include
     */
    GeoUI.prototype.addPropToMenu = function (map, prop) {
        var selectMenu;
        this.availableProperties = [];
        var self = this;
        if (map == 1) {
            selectMenu = $(".selectDropDownLeft");
        } else if (map == 2) {
            selectMenu = $(".selectDropDownRight");
        } else {
            return;
        }
        var group = "";
        for (var key in prop) {
            if (prop.hasOwnProperty(key) && key !== "id" && key != "@id" && key != "id_1") {
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
                        var element = Object.keys(val)[0] + ":" + val[Object.keys(val)[0]];
                        if (listOfVal.indexOf(element) == -1) {
                            listOfVal.push(element);
                            self.availableProperties.push(element);
                            group += "<option>" + element + "</option>"
                        }
                    }
                });

                group += "</optgroup>";
            }
        }

        if (map == 1) {
            $(".selectionFeatures").find('select').append(group);
            selectMenu.find('select').append(group);
            $(".selectionFeatures").selectpicker('refresh');

        } else {
            selectMenu.find('select').append(group);
        }
        selectMenu.selectpicker('refresh');

    };

    GeoUI.prototype.setParent = function (parent) {
        this.parent = parent;
    };

    GeoUI.prototype.fillLayersList = function () {

        var selectUsers = $(".selectDropDownUsers");
        var selectLayers = $(".selectDropDownLayers");
        selectUsers.selectpicker();
        selectLayers.selectpicker();

        $.ajax({
            url: CONFIG.geonodeURL() + "/api/profiles/",
            dataType: "jsonp",
            jsonpCallback: 'callback',
            type: 'GET',
            success: function (data) {
                var group = "";
                var names = Object.keys(data.objects).map(function (name) {
                    return data.objects[name].username;
                });

                names.forEach(function (name) {

                    group += "<option>" + name + "</option>";

                });
                selectUsers.append(group);
                selectUsers.selectpicker('refresh');
            }
        });

        selectUsers.on("change", function (e) {
            var selectedUser = $(this).find("option:selected").text();
            $.ajax({
                url: CONFIG.geonodeURL() + "/api/layers/?owner__username=" + selectedUser,
                dataType: "jsonp",
                jsonpCallback: 'callback',
                type: 'GET',
                success: function (data) {
                    var group = "";
                    var titles = Object.keys(data.objects).map(function (title) {
                        return data.objects[title].title;
                    });
                    var url = Object.keys(data.objects).map(function (title) {
                        return data.objects[title].detail_url;
                    });
                    titles.forEach(function (title, i) {
                        group += "<option value='" + url[i] + "'>" + title + "</option>";
                    });
                    selectLayers.html(group);
                    selectLayers.attr('disabled', false);
                    selectLayers.selectpicker('refresh');
                }
            });
        });


    };

    /**
     * Switch between view with two maps or result map
     * @param on
     */
    GeoUI.prototype.doubleView = function (on) {
        if (on) {
            $("#map1, #map2").show();
            $("#resultMap").hide();
            $("#downloadButton").hide();
            $("#mapAfterControls").show();
            $(".fa-backward").addClass("fa-forward").removeClass("fa-backward")
        } else {
            $("#map1, #map2").hide();
            $("#resultMap").show();
            if (self.parent.resultJSON) {
                $("#downloadButton").show();
            }
            $("#mapAfterControls").hide();
            $("#doubleViewButton").show();
            $(".fa-forward").addClass("fa-backward").removeClass("fa-forward");
        }
    };

    /**
     * Show the statistics obtained from the server
     * @param resultParam, array containing all the values
     */
    GeoUI.prototype.showStatistics = function (resultParam) {
        $("#resultData").show();
        $("#mediaDeltaX").val(String(resultParam[1]));
        $("#varianzaDeltaX").val(String(resultParam[2]));
        $("#mediaDeltaY").val(String(resultParam[3]));
        $("#mediaDistanze").val(String(resultParam[4]));
        $("#varianzaDistanze").val(String(resultParam[5]));
        $("#distanzaMinima").val(String(resultParam[6]));
        $("#distanzaMassima").val(String(resultParam[7]));
    };

    return GeoUI;
})
;
