/*! jquery-locationpicker - v0.1.15 - 2016-09-26 */
(function($) {
    function GMapContext(domElement, options) {
        var _map = new google.maps.Map(domElement, options);
        var _marker = new google.maps.Marker({
            position: new google.maps.LatLng(54.19335, -3.92695),
            map: _map,
            title: "Drag Me",
            visible: options.markerVisible,
            draggable: options.markerDraggable,
            icon: options.markerIcon !== undefined ? options.markerIcon : undefined
        });
        return {
            map: _map,
            marker: _marker,
            circle: null,
            location: _marker.position,
            radius: options.radius,
            locationName: options.locationName,
            addressComponents: {
                formatted_address: null,
                addressLine1: null,
                addressLine2: null,
                streetName: null,
                streetNumber: null,
                city: null,
                district: null,
                state: null,
                stateOrProvince: null
            },
            settings: options.settings,
            domContainer: domElement,
            geodecoder: new google.maps.Geocoder()
        };
    }
    var GmUtility = {
        drawCircle: function(gmapContext, center, radius, options) {
            if (gmapContext.circle != null) {
                gmapContext.circle.setMap(null);
            }
            if (radius > 0) {
                radius *= 1;
                options = $.extend({
                    strokeColor: "#0000FF",
                    strokeOpacity: .35,
                    strokeWeight: 2,
                    fillColor: "#0000FF",
                    fillOpacity: .2
                }, options);
                options.map = gmapContext.map;
                options.radius = radius;
                options.center = center;
                gmapContext.circle = new google.maps.Circle(options);
                return gmapContext.circle;
            }
            return null;
        },
        setPosition: function(gMapContext, location, callback) {
            gMapContext.location = location;
            gMapContext.marker.setPosition(location);
            gMapContext.map.panTo(location);
            this.drawCircle(gMapContext, location, gMapContext.radius, {});
            if (gMapContext.settings.enableReverseGeocode) {
                this.updateLocationName(gMapContext, callback);
            } else {
                if (callback) {
                    callback.call(this, gMapContext);
                }
            }
        },
        locationFromLatLng: function(lnlg) {
            return {
                latitude: lnlg.lat(),
                longitude: lnlg.lng()
            };
        },
        addressByFormat: function(addresses, format) {
            var result = null;
            for (var i = addresses.length - 1; i >= 0; i--) {
                if (addresses[i].types.indexOf(format) >= 0) {
                    result = addresses[i];
                }
            }
            return result || addresses[0];
        },
        updateLocationName: function(gmapContext, callback) {
            gmapContext.geodecoder.geocode({
                latLng: gmapContext.marker.position
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK && results.length > 0) {
                    var address = GmUtility.addressByFormat(results, gmapContext.settings.addressFormat);
                    gmapContext.locationName = address.formatted_address;
                    gmapContext.addressComponents = GmUtility.address_component_from_google_geocode(address.address_components);
                } else if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                    return setTimeout(function() {
                        GmUtility.updateLocationName(gmapContext, callback);
                    }, 1e3);
                }
                if (callback) {
                    callback.call(this, gmapContext);
                }
            });
        },
        address_component_from_google_geocode: function(address_components) {
            var result = {};
            for (var i = address_components.length - 1; i >= 0; i--) {
                var component = address_components[i];
                if (component.types.indexOf("postal_code") >= 0) {
                    result.postalCode = component.short_name;
                } else if (component.types.indexOf("street_number") >= 0) {
                    result.streetNumber = component.short_name;
                } else if (component.types.indexOf("route") >= 0) {
                    result.streetName = component.short_name;
                } else if (component.types.indexOf("locality") >= 0) {
                    result.city = component.short_name;
                } else if (component.types.indexOf("sublocality") >= 0) {
                    result.district = component.short_name;
                } else if (component.types.indexOf("administrative_area_level_1") >= 0) {
                    result.stateOrProvince = component.short_name;
                } else if (component.types.indexOf("country") >= 0) {
                    result.country = component.short_name;
                }
            }
            result.addressLine1 = [ result.streetNumber, result.streetName ].join(" ").trim();
            result.addressLine2 = "";
            return result;
        }
    };
    function isPluginApplied(domObj) {
        return getContextForElement(domObj) != undefined;
    }
    function getContextForElement(domObj) {
        return $(domObj).data("locationpicker");
    }
    function updateInputValues(inputBinding, gmapContext) {
        if (!inputBinding) return;
        var currentLocation = GmUtility.locationFromLatLng(gmapContext.marker.position);
        if (inputBinding.latitudeInput) {
            inputBinding.latitudeInput.val(currentLocation.latitude).change();
        }
        if (inputBinding.longitudeInput) {
            inputBinding.longitudeInput.val(currentLocation.longitude).change();
        }
        if (inputBinding.radiusInput) {
            inputBinding.radiusInput.val(gmapContext.radius).change();
        }
        if (inputBinding.locationNameInput) {
            inputBinding.locationNameInput.val(gmapContext.locationName).change();
        }
    }
    function setupInputListenersInput(inputBinding, gmapContext) {
        if (inputBinding) {
            if (inputBinding.radiusInput) {
                inputBinding.radiusInput.on("change", function(e) {
                    var radiusInputValue = $(this).val();
                    if (!e.originalEvent || isNaN(radiusInputValue)) {
                        return;
                    }
                    gmapContext.radius = radiusInputValue;
                    GmUtility.setPosition(gmapContext, gmapContext.location, function(context) {
                        context.settings.onchanged.apply(gmapContext.domContainer, [ GmUtility.locationFromLatLng(context.location), context.radius, false ]);
                    });
                });
            }
            if (inputBinding.locationNameInput && gmapContext.settings.enableAutocomplete) {
                var blur = false;
                gmapContext.autocomplete = new google.maps.places.Autocomplete(inputBinding.locationNameInput.get(0), gmapContext.settings.autocompleteOptions);
                google.maps.event.addListener(gmapContext.autocomplete, "place_changed", function() {
                    blur = false;
                    var place = gmapContext.autocomplete.getPlace();
                    if (!place.geometry) {
                        gmapContext.settings.onlocationnotfound(place.name);
                        return;
                    }
                    GmUtility.setPosition(gmapContext, place.geometry.location, function(context) {
                        updateInputValues(inputBinding, context);
                        context.settings.onchanged.apply(gmapContext.domContainer, [ GmUtility.locationFromLatLng(context.location), context.radius, false ]);
                    });
                });
                if (gmapContext.settings.enableAutocompleteBlur) {
                    inputBinding.locationNameInput.on("change", function(e) {
                        if (!e.originalEvent) {
                            return;
                        }
                        blur = true;
                    });
                    inputBinding.locationNameInput.on("blur", function(e) {
                        if (!e.originalEvent) {
                            return;
                        }
                        setTimeout(function() {
                            var address = $(inputBinding.locationNameInput).val();
                            if (address.length > 5 && blur) {
                                blur = false;
                                gmapContext.geodecoder.geocode({
                                    address: address
                                }, function(results, status) {
                                    if (status == google.maps.GeocoderStatus.OK && results && results.length) {
                                        GmUtility.setPosition(gmapContext, results[0].geometry.location, function(context) {
                                            updateInputValues(inputBinding, context);
                                            context.settings.onchanged.apply(gmapContext.domContainer, [ GmUtility.locationFromLatLng(context.location), context.radius, false ]);
                                        });
                                    }
                                });
                            }
                        }, 1e3);
                    });
                }
            }
            if (inputBinding.latitudeInput) {
                inputBinding.latitudeInput.on("change", function(e) {
                    var latitudeInputValue = $(this).val();
                    if (!e.originalEvent || isNaN(latitudeInputValue)) {
                        return;
                    }
                    GmUtility.setPosition(gmapContext, new google.maps.LatLng(latitudeInputValue, gmapContext.location.lng()), function(context) {
                        context.settings.onchanged.apply(gmapContext.domContainer, [ GmUtility.locationFromLatLng(context.location), context.radius, false ]);
                        updateInputValues(gmapContext.settings.inputBinding, gmapContext);
                    });
                });
            }
            if (inputBinding.longitudeInput) {
                inputBinding.longitudeInput.on("change", function(e) {
                    var longitudeInputValue = $(this).val();
                    if (!e.originalEvent || isNaN(longitudeInputValue)) {
                        return;
                    }
                    GmUtility.setPosition(gmapContext, new google.maps.LatLng(gmapContext.location.lat(), longitudeInputValue), function(context) {
                        context.settings.onchanged.apply(gmapContext.domContainer, [ GmUtility.locationFromLatLng(context.location), context.radius, false ]);
                        updateInputValues(gmapContext.settings.inputBinding, gmapContext);
                    });
                });
            }
        }
    }
    function autosize(gmapContext) {
        google.maps.event.trigger(gmapContext.map, "resize");
        setTimeout(function() {
            gmapContext.map.setCenter(gmapContext.marker.position);
        }, 300);
    }
    function updateMap(gmapContext, $target, options) {
        var settings = $.extend({}, $.fn.locationpicker.defaults, options), latNew = settings.location.latitude, lngNew = settings.location.longitude, radiusNew = settings.radius, latOld = gmapContext.settings.location.latitude, lngOld = gmapContext.settings.location.longitude, radiusOld = gmapContext.settings.radius;
        if (latNew == latOld && lngNew == lngOld && radiusNew == radiusOld) return;
        gmapContext.settings.location.latitude = latNew;
        gmapContext.settings.location.longitude = lngNew;
        gmapContext.radius = radiusNew;
        GmUtility.setPosition(gmapContext, new google.maps.LatLng(gmapContext.settings.location.latitude, gmapContext.settings.location.longitude), function(context) {
            setupInputListenersInput(gmapContext.settings.inputBinding, gmapContext);
            context.settings.oninitialized($target);
        });
    }
    $.fn.locationpicker = function(options, params) {
        if (typeof options == "string") {
            var _targetDomElement = this.get(0);
            if (!isPluginApplied(_targetDomElement)) return;
            var gmapContext = getContextForElement(_targetDomElement);
            switch (options) {
              case "location":
                if (params == undefined) {
                    var location = GmUtility.locationFromLatLng(gmapContext.location);
                    location.radius = gmapContext.radius;
                    location.name = gmapContext.locationName;
                    return location;
                } else {
                    if (params.radius) {
                        gmapContext.radius = params.radius;
                    }
                    GmUtility.setPosition(gmapContext, new google.maps.LatLng(params.latitude, params.longitude), function(gmapContext) {
                        updateInputValues(gmapContext.settings.inputBinding, gmapContext);
                    });
                }
                break;

              case "subscribe":
                if (params == undefined) {
                    return null;
                } else {
                    var event = params.event;
                    var callback = params.callback;
                    if (!event || !callback) {
                        console.error('LocationPicker: Invalid arguments for method "subscribe"');
                        return null;
                    }
                    google.maps.event.addListener(gmapContext.map, event, callback);
                }
                break;

              case "map":
                if (params == undefined) {
                    var locationObj = GmUtility.locationFromLatLng(gmapContext.location);
                    locationObj.formattedAddress = gmapContext.locationName;
                    locationObj.addressComponents = gmapContext.addressComponents;
                    return {
                        map: gmapContext.map,
                        marker: gmapContext.marker,
                        location: locationObj
                    };
                } else {
                    return null;
                }

              case "autosize":
                autosize(gmapContext);
                return this;
            }
            return null;
        }
        return this.each(function() {
            var $target = $(this);
            if (isPluginApplied(this)) {
                updateMap(getContextForElement(this), $(this), options);
                return;
            }
            var settings = $.extend({}, $.fn.locationpicker.defaults, options);
            var gmapContext = new GMapContext(this, $.extend({}, settings.mapOptions, {
                zoom: settings.zoom,
                center: new google.maps.LatLng(settings.location.latitude, settings.location.longitude),
                mapTypeId: settings.mapTypeId,
                mapTypeControl: false,
                styles: settings.styles,
                disableDoubleClickZoom: false,
                scrollwheel: settings.scrollwheel,
                streetViewControl: false,
                radius: settings.radius,
                locationName: settings.locationName,
                settings: settings,
                autocompleteOptions: settings.autocompleteOptions,
                addressFormat: settings.addressFormat,
                draggable: settings.draggable,
                markerIcon: settings.markerIcon,
                markerDraggable: settings.markerDraggable,
                markerVisible: settings.markerVisible
            }));
            $target.data("locationpicker", gmapContext);
            function displayMarkerWithSelectedArea() {
                GmUtility.setPosition(gmapContext, gmapContext.marker.position, function(context) {
                    var currentLocation = GmUtility.locationFromLatLng(gmapContext.location);
                    updateInputValues(gmapContext.settings.inputBinding, gmapContext);
                    context.settings.onchanged.apply(gmapContext.domContainer, [ currentLocation, context.radius, true ]);
                });
            }
            if (settings.markerInCenter) {
                gmapContext.map.addListener("bounds_changed", function() {
                    if (!gmapContext.marker.dragging) {
                        gmapContext.marker.setPosition(gmapContext.map.center);
                        updateInputValues(gmapContext.settings.inputBinding, gmapContext);
                    }
                });
                gmapContext.map.addListener("idle", function() {
                    if (!gmapContext.marker.dragging) {
                        displayMarkerWithSelectedArea();
                    }
                });
            }
            google.maps.event.addListener(gmapContext.marker, "drag", function(event) {
                updateInputValues(gmapContext.settings.inputBinding, gmapContext);
            });
            google.maps.event.addListener(gmapContext.marker, "dragend", function(event) {
                displayMarkerWithSelectedArea();
            });
            GmUtility.setPosition(gmapContext, new google.maps.LatLng(settings.location.latitude, settings.location.longitude), function(context) {
                updateInputValues(settings.inputBinding, gmapContext);
                setupInputListenersInput(settings.inputBinding, gmapContext);
                context.settings.oninitialized($target);
            });
        });
    };
    $.fn.locationpicker.defaults = {
        location: {
            latitude: 40.7324319,
            longitude: -73.82480777777776
        },
        locationName: "",
        radius: 500,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [],
        mapOptions: {},
        scrollwheel: true,
        inputBinding: {
            latitudeInput: null,
            longitudeInput: null,
            radiusInput: null,
            locationNameInput: null
        },
        enableAutocomplete: false,
        enableAutocompleteBlur: false,
        autocompleteOptions: null,
        addressFormat: "postal_code",
        enableReverseGeocode: true,
        draggable: true,
        onchanged: function(currentLocation, radius, isMarkerDropped) {},
        onlocationnotfound: function(locationName) {},
        oninitialized: function(component) {},
        markerIcon: undefined,
        markerDraggable: true,
        markerVisible: true
    };
})(jQuery);;
'use strict';

System.register('avatar4eg/geotags/addGeotagsList', ['flarum/extend', 'flarum/app', 'flarum/components/CommentPost', 'flarum/helpers/icon', 'flarum/helpers/punctuateSeries', 'avatar4eg/geotags/models/Geotag', 'avatar4eg/geotags/components/GeotagModal'], function (_export, _context) {
    "use strict";

    var extend, app, CommentPost, icon, punctuateSeries, Geotag, GeotagModal;

    _export('default', function () {
        extend(CommentPost.prototype, 'footerItems', function (items) {
            var post = this.props.post;
            var geotags = post.geotags();

            if (geotags && geotags.length) {
                var titles = geotags.map(function (geotag) {
                    if (geotag instanceof Geotag) {
                        return [m('a', {
                            href: '#',
                            onclick: function onclick(e) {
                                e.preventDefault();
                                app.modal.show(new GeotagModal({ geotag: geotag }));
                            }
                        }, geotag.title())];
                    }
                });

                items.add('geotags', [m('div', { className: 'Post-geotags' }, [icon('map-marker'), app.translator.trans('avatar4eg-geotags.forum.post.geotags_title') + ': ', punctuateSeries(titles)])]);
            }
        });
    });

    return {
        setters: [function (_flarumExtend) {
            extend = _flarumExtend.extend;
        }, function (_flarumApp) {
            app = _flarumApp.default;
        }, function (_flarumComponentsCommentPost) {
            CommentPost = _flarumComponentsCommentPost.default;
        }, function (_flarumHelpersIcon) {
            icon = _flarumHelpersIcon.default;
        }, function (_flarumHelpersPunctuateSeries) {
            punctuateSeries = _flarumHelpersPunctuateSeries.default;
        }, function (_avatar4egGeotagsModelsGeotag) {
            Geotag = _avatar4egGeotagsModelsGeotag.default;
        }, function (_avatar4egGeotagsComponentsGeotagModal) {
            GeotagModal = _avatar4egGeotagsComponentsGeotagModal.default;
        }],
        execute: function () {}
    };
});;
'use strict';

System.register('avatar4eg/geotags/components/GeotagCreateModal', ['flarum/app', 'flarum/components/Modal', 'flarum/components/FieldSet', 'flarum/components/Button'], function (_export, _context) {
    "use strict";

    var app, Modal, FieldSet, Button, GeotagCreateModal;
    return {
        setters: [function (_flarumApp) {
            app = _flarumApp.default;
        }, function (_flarumComponentsModal) {
            Modal = _flarumComponentsModal.default;
        }, function (_flarumComponentsFieldSet) {
            FieldSet = _flarumComponentsFieldSet.default;
        }, function (_flarumComponentsButton) {
            Button = _flarumComponentsButton.default;
        }],
        execute: function () {
            GeotagCreateModal = function (_Modal) {
                babelHelpers.inherits(GeotagCreateModal, _Modal);

                function GeotagCreateModal() {
                    babelHelpers.classCallCheck(this, GeotagCreateModal);
                    return babelHelpers.possibleConstructorReturn(this, (GeotagCreateModal.__proto__ || Object.getPrototypeOf(GeotagCreateModal)).apply(this, arguments));
                }

                babelHelpers.createClass(GeotagCreateModal, [{
                    key: 'init',
                    value: function init() {
                        this.textAreaObj = this.props.textAreaObj;
                        this.loading = false;
                        this.mapField = null;

                        this.geotagData = {
                            title: m.prop(app.translator.trans('avatar4eg-geotags.forum.create_modal.default_title')[0]),
                            lat: m.prop(59.950179),
                            lng: m.prop(30.316147),
                            country: m.prop('RU')
                        };

                        this.geotag = app.store.createRecord('geotags');
                    }
                }, {
                    key: 'className',
                    value: function className() {
                        return 'GeotagCreateModal Modal--large';
                    }
                }, {
                    key: 'title',
                    value: function title() {
                        var title = this.geotagData.title();
                        return title ? title : app.translator.trans('avatar4eg-geotags.forum.create_modal.default_title');
                    }
                }, {
                    key: 'content',
                    value: function content() {
                        return [m('div', { className: 'Modal-body' }, [m('div', { className: 'map-form-container' }, [m('form', { onsubmit: this.onsubmit.bind(this), config: this.loadLocationPicker.bind(this) }, [m('div', { className: 'Form-group' }, [m('label', {}, app.translator.trans('avatar4eg-geotags.forum.create_modal.title_label')), m('input', {
                            className: 'FormControl Map-title',
                            value: this.geotagData.title(),
                            oninput: m.withAttr('value', this.geotagData.title)
                        })]), m('div', { className: 'Form-group' }, [m('label', {}, app.translator.trans('avatar4eg-geotags.forum.create_modal.address_label')), m('input', {
                            className: 'FormControl Map-address-search'
                        })]), m('div', { className: 'Map-field', style: { 'width': '100%', 'height': '400px', 'margin-bottom': '20px' } }), FieldSet.component({
                            className: 'Map-coordinates',
                            label: app.translator.trans('avatar4eg-geotags.forum.create_modal.coordinates_label') + ':',
                            children: [m('div', { className: 'Form-group' }, [m('label', {}, app.translator.trans('avatar4eg-geotags.forum.create_modal.latitude_label')), m('input', {
                                className: 'FormControl Map-coordinates-lat'
                            })]), m('div', { className: 'Form-group' }, [m('label', {}, app.translator.trans('avatar4eg-geotags.forum.create_modal.longitude_label')), m('input', {
                                className: 'FormControl Map-coordinates-lng'
                            })])]
                        }), FieldSet.component({
                            className: 'Buttons',
                            children: [Button.component({
                                type: 'submit',
                                className: 'Button Button--primary',
                                children: app.translator.trans('avatar4eg-geotags.forum.create_modal.save_button'),
                                loading: this.loading,
                                disabled: this.geotagData.title() === '' || this.geotagData.title() === null
                            }), Button.component({
                                className: 'Button Map-address-locate',
                                icon: 'map-marker',
                                children: app.translator.trans('avatar4eg-geotags.forum.create_modal.locate_button'),
                                onclick: this.getLocation.bind(this)
                            })]
                        })])])])];
                    }
                }, {
                    key: 'onsubmit',
                    value: function onsubmit(e) {
                        e.preventDefault();
                        if (this.loading) return;
                        this.loading = true;

                        var markdownString = '**' + this.geotagData.title() + '**';

                        this.textAreaObj.insertAtCursor(markdownString);
                        if (this.textAreaObj.props.preview) {
                            this.textAreaObj.props.preview();
                        }

                        this.geotag.pushAttributes({
                            title: this.geotagData.title(),
                            lat: this.geotagData.lat(),
                            lng: this.geotagData.lng(),
                            country: this.geotagData.country()
                        });
                        this.textAreaObj.geotags.push(this.geotag);
                        this.loading = false;
                        this.hide();
                    }
                }, {
                    key: 'getLocation',
                    value: function getLocation() {
                        var parent = this;
                        if ('geolocation' in navigator) {
                            navigator.geolocation.getCurrentPosition(function (position) {
                                parent.mapField.locationpicker('location', { latitude: position.coords.latitude, longitude: position.coords.longitude });
                                parent.geotagData.lat(position.coords.latitude);
                                parent.geotagData.lng(position.coords.longitude);
                                var addressComponents = parent.mapField.locationpicker('map').location.addressComponents;
                                parent.geotagData.country(addressComponents.country);
                            });
                        }
                    }
                }, {
                    key: 'loadLocationPicker',
                    value: function loadLocationPicker(element) {
                        var parent = this;
                        parent.mapField = $(element).find('.Map-field');
                        parent.mapField.locationpicker({
                            location: { latitude: parent.geotagData.lat(), longitude: parent.geotagData.lng() },
                            radius: 0,
                            inputBinding: {
                                locationNameInput: $(element).find('.Map-address-search'),
                                latitudeInput: $(element).find('.Map-coordinates-lat'),
                                longitudeInput: $(element).find('.Map-coordinates-lng')
                            },
                            enableAutocomplete: true,
                            onchanged: function onchanged(currentLocation, isMarkerDropped) {
                                parent.geotagData.lat(currentLocation.latitude);
                                parent.geotagData.lng(currentLocation.longitude);
                                var addressComponents = $(this).locationpicker('map').location.addressComponents;
                                parent.geotagData.country(addressComponents.country);
                            }
                        });

                        $('#modal').on('shown.bs.modal', function () {
                            parent.mapField.locationpicker('autosize');
                        });
                    }
                }]);
                return GeotagCreateModal;
            }(Modal);

            _export('default', GeotagCreateModal);
        }
    };
});;
'use strict';

System.register('avatar4eg/geotags/components/GeotagListModal', ['flarum/app', 'flarum/components/Modal', 'flarum/components/Button', 'flarum/components/FieldSet', 'avatar4eg/geotags/components/GeotagModal', 'avatar4eg/geotags/components/GeotagCreateModal'], function (_export, _context) {
    "use strict";

    var app, Modal, Button, FieldSet, GeotagModal, GeotagCreateModal, GeotagListModal;
    return {
        setters: [function (_flarumApp) {
            app = _flarumApp.default;
        }, function (_flarumComponentsModal) {
            Modal = _flarumComponentsModal.default;
        }, function (_flarumComponentsButton) {
            Button = _flarumComponentsButton.default;
        }, function (_flarumComponentsFieldSet) {
            FieldSet = _flarumComponentsFieldSet.default;
        }, function (_avatar4egGeotagsComponentsGeotagModal) {
            GeotagModal = _avatar4egGeotagsComponentsGeotagModal.default;
        }, function (_avatar4egGeotagsComponentsGeotagCreateModal) {
            GeotagCreateModal = _avatar4egGeotagsComponentsGeotagCreateModal.default;
        }],
        execute: function () {
            GeotagListModal = function (_Modal) {
                babelHelpers.inherits(GeotagListModal, _Modal);

                function GeotagListModal() {
                    babelHelpers.classCallCheck(this, GeotagListModal);
                    return babelHelpers.possibleConstructorReturn(this, (GeotagListModal.__proto__ || Object.getPrototypeOf(GeotagListModal)).apply(this, arguments));
                }

                babelHelpers.createClass(GeotagListModal, [{
                    key: 'init',
                    value: function init() {
                        this.textAreaObj = this.props.textAreaObj;
                    }
                }, {
                    key: 'className',
                    value: function className() {
                        return 'GeotagListModal Modal--small';
                    }
                }, {
                    key: 'title',
                    value: function title() {
                        return app.translator.trans('avatar4eg-geotags.forum.list_modal.geotags_title');
                    }
                }, {
                    key: 'content',
                    value: function content() {
                        var parent = this;
                        var geotags = parent.textAreaObj.geotags;

                        return [m('div', { className: 'Modal-body' }, [FieldSet.component({
                            className: 'Geotags-list',
                            label: app.translator.trans('avatar4eg-geotags.forum.list_modal.geotags_list_title') + ':',
                            children: [geotags.map(function (geotag, i) {
                                return [m('li', { className: 'Geotags-item' }, [m('a', {
                                    href: '#',
                                    onclick: function onclick(e) {
                                        e.preventDefault();
                                        parent.hide();
                                        app.modal.show(new GeotagModal({ geotag: geotag }));
                                    }
                                }, geotag.title()), Button.component({
                                    className: 'Button Button--icon Button--link',
                                    icon: 'times',
                                    title: app.translator.trans('avatar4eg-geotags.forum.post.geotag_delete_tooltip'),
                                    onclick: function onclick() {
                                        geotags.splice(i, 1);
                                    }
                                })])];
                            })]
                        }), Button.component({
                            className: 'Button Button--primary',
                            children: app.translator.trans('avatar4eg-geotags.forum.list_modal.geotags_add_title'),
                            onclick: function onclick(e) {
                                e.preventDefault();
                                parent.hide();
                                app.modal.show(new GeotagCreateModal({ 'textAreaObj': parent.textAreaObj }));
                            }
                        })])];
                    }
                }]);
                return GeotagListModal;
            }(Modal);

            _export('default', GeotagListModal);
        }
    };
});;
'use strict';

System.register('avatar4eg/geotags/components/GeotagModal', ['flarum/components/Modal'], function (_export, _context) {
    "use strict";

    var Modal, GeotagModal;
    return {
        setters: [function (_flarumComponentsModal) {
            Modal = _flarumComponentsModal.default;
        }],
        execute: function () {
            GeotagModal = function (_Modal) {
                babelHelpers.inherits(GeotagModal, _Modal);

                function GeotagModal() {
                    babelHelpers.classCallCheck(this, GeotagModal);
                    return babelHelpers.possibleConstructorReturn(this, (GeotagModal.__proto__ || Object.getPrototypeOf(GeotagModal)).apply(this, arguments));
                }

                babelHelpers.createClass(GeotagModal, [{
                    key: 'init',
                    value: function init() {
                        this.geotag = this.props.geotag;
                    }
                }, {
                    key: 'className',
                    value: function className() {
                        return 'GeotagModal Modal--large';
                    }
                }, {
                    key: 'title',
                    value: function title() {
                        return this.geotag.title();
                    }
                }, {
                    key: 'content',
                    value: function content() {
                        return [m('div', { className: 'Modal-body' }, [m('div', {
                            className: 'Map-field',
                            style: { 'width': '100%', 'height': '400px' },
                            config: this.loadMap.bind(this)
                        })])];
                    }
                }, {
                    key: 'loadMap',
                    value: function loadMap(element) {
                        var latitude = this.geotag.lat();
                        var longitude = this.geotag.lng();
                        var coords = new google.maps.LatLng(latitude, longitude);
                        var mapOptions = {
                            zoom: 15,
                            center: coords,
                            mapTypeControl: true,
                            navigationControlOptions: {
                                style: google.maps.NavigationControlStyle.SMALL
                            },
                            mapTypeId: google.maps.MapTypeId.ROADMAP
                        };
                        var map = new google.maps.Map(element, mapOptions);
                        var marker = new google.maps.Marker({
                            position: coords,
                            map: map,
                            title: this.geotag.title()
                        });

                        $('#modal').on('shown.bs.modal', function () {
                            google.maps.event.trigger(map, 'resize');
                            map.setCenter(coords);
                        });
                    }
                }]);
                return GeotagModal;
            }(Modal);

            _export('default', GeotagModal);
        }
    };
});;
'use strict';

System.register('avatar4eg/geotags/extendEditorControls', ['flarum/extend', 'flarum/app', 'flarum/helpers/icon', 'flarum/components/TextEditor', 'avatar4eg/geotags/components/GeotagListModal', 'avatar4eg/geotags/components/GeotagCreateModal'], function (_export, _context) {
    "use strict";

    var extend, app, icon, TextEditor, GeotagListModal, GeotagCreateModal;

    _export('default', function () {
        TextEditor.prototype.geotags = [];
        TextEditor.prototype.originalGeotags = [];

        extend(TextEditor.prototype, 'init', function () {
            this.geotags = [];
            this.originalGeotags = [];
        });

        extend(TextEditor.prototype, 'controlItems', function (items) {
            if (!app.forum.attribute('canAddGeotags')) return;

            var textAreaObj = this;
            var geotagsNum = textAreaObj.geotags && textAreaObj.geotags.length ? textAreaObj.geotags.length : 0;

            items.add('avatar4eg-geotags', m('div', {
                className: 'Button hasIcon avatar4eg-geotags-button Button--icon',
                onclick: function onclick(e) {
                    e.preventDefault();
                    if (geotagsNum > 0) {
                        app.modal.show(new GeotagListModal({ textAreaObj: textAreaObj }));
                    } else {
                        app.modal.show(new GeotagCreateModal({ textAreaObj: textAreaObj }));
                    }
                }
            }, [icon('map-marker', { className: 'Button-icon' }), geotagsNum > 0 ? m('span', { className: 'Button-label-num' }, geotagsNum) : '', m('span', { className: 'Button-label' }, app.translator.trans('avatar4eg-geotags.forum.post.geotag_editor_tooltip'))]), -1);

            $('.Button-label', '.item-avatar4eg-geotags > div').hide();
            $('.item-avatar4eg-geotags > div').hover(function () {
                $('.Button-label', this).show();$('.Button-label-num', this).hide();$(this).removeClass('Button--icon');
            }, function () {
                $('.Button-label', this).hide();$('.Button-label-num', this).show();$(this).addClass('Button--icon');
            });
        });
    });

    return {
        setters: [function (_flarumExtend) {
            extend = _flarumExtend.extend;
        }, function (_flarumApp) {
            app = _flarumApp.default;
        }, function (_flarumHelpersIcon) {
            icon = _flarumHelpersIcon.default;
        }, function (_flarumComponentsTextEditor) {
            TextEditor = _flarumComponentsTextEditor.default;
        }, function (_avatar4egGeotagsComponentsGeotagListModal) {
            GeotagListModal = _avatar4egGeotagsComponentsGeotagListModal.default;
        }, function (_avatar4egGeotagsComponentsGeotagCreateModal) {
            GeotagCreateModal = _avatar4egGeotagsComponentsGeotagCreateModal.default;
        }],
        execute: function () {}
    };
});;
'use strict';

System.register('avatar4eg/geotags/extendPostData', ['flarum/extend', 'flarum/components/ComposerBody', 'flarum/components/EditPostComposer', 'flarum/components/ReplyComposer', 'flarum/components/DiscussionComposer'], function (_export, _context) {
    "use strict";

    var extend, override, ComposerBody, EditPostComposer, ReplyComposer, DiscussionComposer;

    _export('default', function () {
        ComposerBody.prototype.submitGeotags = function (originalSubmit) {
            var geotags = this.editor.geotags;
            var originalGeotags = this.editor.originalGeotags;

            var deferreds = [];
            this.loading = true;
            $.each(originalGeotags, function (index, geotag) {
                if (!geotags.includes(geotag)) {
                    deferreds.push(geotag.delete());
                }
            });
            $.each(geotags, function (index, geotag) {
                if (!geotag.id() && !originalGeotags.includes(geotag)) {
                    deferreds.push(geotag.save(geotag.data.attributes));
                }
            });
            m.sync(deferreds).then(function () {
                originalSubmit();
            });
        };

        extend(EditPostComposer.prototype, 'init', function () {
            this.editor.geotags = this.props.post.geotags();
            this.editor.originalGeotags = this.props.post.geotags();
        });

        extend(EditPostComposer.prototype, 'data', function (data) {
            data.relationships = data.relationships || {};
            data.relationships.geotags = this.editor.geotags;
        });

        extend(ReplyComposer.prototype, 'data', function (data) {
            data.relationships = data.relationships || {};
            data.relationships.geotags = this.editor.geotags;
        });

        extend(DiscussionComposer.prototype, 'data', function (data) {
            data.relationships = data.relationships || {};
            data.relationships.geotags = this.editor.geotags;
        });

        override(EditPostComposer.prototype, 'onsubmit', function (original) {
            this.submitGeotags(original);
        });

        override(ReplyComposer.prototype, 'onsubmit', function (original) {
            this.submitGeotags(original);
        });

        override(DiscussionComposer.prototype, 'onsubmit', function (original) {
            this.submitGeotags(original);
        });
    });

    return {
        setters: [function (_flarumExtend) {
            extend = _flarumExtend.extend;
            override = _flarumExtend.override;
        }, function (_flarumComponentsComposerBody) {
            ComposerBody = _flarumComponentsComposerBody.default;
        }, function (_flarumComponentsEditPostComposer) {
            EditPostComposer = _flarumComponentsEditPostComposer.default;
        }, function (_flarumComponentsReplyComposer) {
            ReplyComposer = _flarumComponentsReplyComposer.default;
        }, function (_flarumComponentsDiscussionComposer) {
            DiscussionComposer = _flarumComponentsDiscussionComposer.default;
        }],
        execute: function () {}
    };
});;
'use strict';

System.register('avatar4eg/geotags/main', ['flarum/extend', 'flarum/app', 'flarum/models/Post', 'flarum/Model', 'avatar4eg/geotags/models/Geotag', 'avatar4eg/geotags/addGeotagsList', 'avatar4eg/geotags/extendPostData', 'avatar4eg/geotags/extendEditorControls'], function (_export, _context) {
    "use strict";

    var extend, override, app, Post, Model, Geotag, addGeotagsList, extendPostData, extendEditorControls;
    return {
        setters: [function (_flarumExtend) {
            extend = _flarumExtend.extend;
            override = _flarumExtend.override;
        }, function (_flarumApp) {
            app = _flarumApp.default;
        }, function (_flarumModelsPost) {
            Post = _flarumModelsPost.default;
        }, function (_flarumModel) {
            Model = _flarumModel.default;
        }, function (_avatar4egGeotagsModelsGeotag) {
            Geotag = _avatar4egGeotagsModelsGeotag.default;
        }, function (_avatar4egGeotagsAddGeotagsList) {
            addGeotagsList = _avatar4egGeotagsAddGeotagsList.default;
        }, function (_avatar4egGeotagsExtendPostData) {
            extendPostData = _avatar4egGeotagsExtendPostData.default;
        }, function (_avatar4egGeotagsExtendEditorControls) {
            extendEditorControls = _avatar4egGeotagsExtendEditorControls.default;
        }],
        execute: function () {

            app.initializers.add('avatar4eg-geotags', function (app) {
                Post.prototype.geotags = Model.hasMany('geotags');
                app.store.models.geotags = Geotag;

                addGeotagsList();
                extendEditorControls();
                extendPostData();
            });
        }
    };
});;
'use strict';

System.register('avatar4eg/geotags/models/Geotag', ['flarum/Model', 'flarum/utils/mixin'], function (_export, _context) {
    "use strict";

    var Model, mixin, Geotag;
    return {
        setters: [function (_flarumModel) {
            Model = _flarumModel.default;
        }, function (_flarumUtilsMixin) {
            mixin = _flarumUtilsMixin.default;
        }],
        execute: function () {
            Geotag = function (_mixin) {
                babelHelpers.inherits(Geotag, _mixin);

                function Geotag() {
                    babelHelpers.classCallCheck(this, Geotag);
                    return babelHelpers.possibleConstructorReturn(this, (Geotag.__proto__ || Object.getPrototypeOf(Geotag)).apply(this, arguments));
                }

                return Geotag;
            }(mixin(Model, {
                title: Model.attribute('title'),
                country: Model.attribute('country'),
                lat: Model.attribute('lat'),
                lng: Model.attribute('lng')
            }));

            _export('default', Geotag);
        }
    };
});