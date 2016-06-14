/*! jquery-locationpicker - v0.12.0 - 2015-01-05 */
(function($) {
    function GMapContext(domElement, options) {
        var _map = new google.maps.Map(domElement, options);
        var _marker = new google.maps.Marker({
            position: new google.maps.LatLng(54.19335, -3.92695),
            map: _map,
            title: "Drag Me",
            draggable: options.draggable
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
                gMapContext.geodecoder.geocode({
                    latLng: gMapContext.location
                }, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK && results.length > 0) {
                        gMapContext.locationName = results[0].formatted_address;
                        gMapContext.addressComponents = GmUtility.address_component_from_google_geocode(results[0].address_components);
                    }
                    if (callback) {
                        callback.call(this, gMapContext);
                    }
                });
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
        var currentLocation = GmUtility.locationFromLatLng(gmapContext.location);
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
                    if (!e.originalEvent) {
                        return;
                    }
                    gmapContext.radius = $(this).val();
                    GmUtility.setPosition(gmapContext, gmapContext.location, function(context) {
                        context.settings.onchanged.apply(gmapContext.domContainer, [ GmUtility.locationFromLatLng(context.location), context.radius, false ]);
                    });
                });
            }
            if (inputBinding.locationNameInput && gmapContext.settings.enableAutocomplete) {
                gmapContext.autocomplete = new google.maps.places.Autocomplete(inputBinding.locationNameInput.get(0));
                google.maps.event.addListener(gmapContext.autocomplete, "place_changed", function() {
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
            }
            if (inputBinding.latitudeInput) {
                inputBinding.latitudeInput.on("change", function(e) {
                    if (!e.originalEvent) {
                        return;
                    }
                    GmUtility.setPosition(gmapContext, new google.maps.LatLng($(this).val(), gmapContext.location.lng()), function(context) {
                        context.settings.onchanged.apply(gmapContext.domContainer, [ GmUtility.locationFromLatLng(context.location), context.radius, false ]);
                    });
                });
            }
            if (inputBinding.longitudeInput) {
                inputBinding.longitudeInput.on("change", function(e) {
                    if (!e.originalEvent) {
                        return;
                    }
                    GmUtility.setPosition(gmapContext, new google.maps.LatLng(gmapContext.location.lat(), $(this).val()), function(context) {
                        context.settings.onchanged.apply(gmapContext.domContainer, [ GmUtility.locationFromLatLng(context.location), context.radius, false ]);
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
            if (isPluginApplied(this)) return;
            var settings = $.extend({}, $.fn.locationpicker.defaults, options);
            var gmapContext = new GMapContext(this, {
                zoom: settings.zoom,
                center: new google.maps.LatLng(settings.location.latitude, settings.location.longitude),
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                mapTypeControl: false,
                disableDoubleClickZoom: false,
                scrollwheel: settings.scrollwheel,
                streetViewControl: false,
                radius: settings.radius,
                locationName: settings.locationName,
                settings: settings,
                draggable: settings.draggable
            });
            $target.data("locationpicker", gmapContext);
            google.maps.event.addListener(gmapContext.marker, "dragend", function(event) {
                GmUtility.setPosition(gmapContext, gmapContext.marker.position, function(context) {
                    var currentLocation = GmUtility.locationFromLatLng(gmapContext.location);
                    context.settings.onchanged.apply(gmapContext.domContainer, [ currentLocation, context.radius, true ]);
                    updateInputValues(gmapContext.settings.inputBinding, gmapContext);
                });
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
            longitude: -73.82480799999996
        },
        locationName: "",
        radius: 500,
        zoom: 15,
        scrollwheel: true,
        inputBinding: {
            latitudeInput: null,
            longitudeInput: null,
            radiusInput: null,
            locationNameInput: null
        },
        enableAutocomplete: false,
        enableReverseGeocode: true,
        draggable: true,
        onchanged: function(currentLocation, radius, isMarkerDropped) {},
        onlocationnotfound: function(locationName) {},
        oninitialized: function(component) {}
    };
})(jQuery);;
'use strict';

System.register('avatar4eg/geotags/addGeotagsList', ['flarum/extend', 'flarum/app', 'flarum/components/CommentPost', 'flarum/helpers/icon', 'flarum/helpers/punctuateSeries', 'avatar4eg/geotags/models/Geotag', 'avatar4eg/geotags/components/GeotagModal'], function (_export, _context) {
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

                items.add('geotags', [m('div', { className: 'Post-geotags' }, [icon('map-marker'), app.translator.trans('avatar4eg-geotags.forum.post.geotags') + ': ', punctuateSeries(titles)])]);
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
                    return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(GeotagCreateModal).apply(this, arguments));
                }

                babelHelpers.createClass(GeotagCreateModal, [{
                    key: 'init',
                    value: function init() {
                        this.textAreaObj = this.props.textAreaObj;
                        this.loading = false;

                        this.geotag = app.store.createRecord('geotags');

                        this.itemTitle = m.prop(app.translator.trans('avatar4eg-geotags.forum.map.default.title')[0]);
                        this.lat = m.prop(59.950179);
                        this.lng = m.prop(30.316147);
                        this.country = m.prop('RU');
                    }
                }, {
                    key: 'className',
                    value: function className() {
                        return 'GeotagCreateModal Modal--large';
                    }
                }, {
                    key: 'title',
                    value: function title() {
                        var title = this.itemTitle();
                        return title ? title : app.translator.trans('avatar4eg-geotags.forum.edit.headtitle');
                    }
                }, {
                    key: 'content',
                    value: function content() {
                        return [m('div', { className: 'Modal-body' }, [m('div', { className: 'map-form-container' }, [m('form', { onsubmit: this.onsubmit.bind(this), config: this.loadLocationPicker.bind(this) }, [m('div', { className: 'Map-address' }, [FieldSet.component({
                            label: app.translator.trans('avatar4eg-geotags.forum.map.labels.location'),
                            children: [m('label', {}, app.translator.trans('avatar4eg-geotags.forum.map.labels.title')), m('input', {
                                className: 'FormControl Map-address-title',
                                value: this.itemTitle(),
                                oninput: m.withAttr('value', this.itemTitle)
                            }), m('label', {}, app.translator.trans('avatar4eg-geotags.forum.map.labels.address')), m('input', {
                                className: 'FormControl Map-address-search'
                            })]
                        })]), m('div', { className: 'Map-field', style: { 'width': '100%', 'height': '400px' } }), m('div', { className: 'Map-coordinates' }, [FieldSet.component({
                            label: app.translator.trans('avatar4eg-geotags.forum.map.labels.coordinates'),
                            children: [m('label', {}, app.translator.trans('avatar4eg-geotags.forum.map.labels.latitude')), m('input', {
                                className: 'FormControl Map-coordinates-lat'
                            }), m('label', {}, app.translator.trans('avatar4eg-geotags.forum.map.labels.longitude')), m('input', {
                                className: 'FormControl Map-coordinates-lng'
                            })]
                        })]), Button.component({
                            type: 'submit',
                            className: 'Button Button--primary',
                            children: app.translator.trans('avatar4eg-geotags.forum.buttons.save'),
                            loading: this.loading
                        })])])])];
                    }
                }, {
                    key: 'onsubmit',
                    value: function onsubmit(e) {
                        e.preventDefault();
                        if (this.loading) return;
                        this.loading = true;

                        var markdownString = '**' + this.itemTitle() + '**';

                        this.textAreaObj.insertAtCursor(markdownString);
                        if (this.textAreaObj.props.preview) {
                            this.textAreaObj.props.preview();
                        }

                        var data = {
                            title: this.itemTitle(),
                            lat: this.lat(),
                            lng: this.lng(),
                            country: this.country()
                        };

                        var parent = this;
                        this.geotag.save(data).then(function (value) {
                            parent.hide();
                            parent.textAreaObj.relationValue.geotags.push(value);
                        }, function (response) {
                            parent.loading = false;
                            parent.handleErrors(response);
                        });
                    }
                }, {
                    key: 'getLocation',
                    value: function getLocation(map_field) {
                        if ('geolocation' in navigator) {
                            navigator.geolocation.getCurrentPosition(function (position) {
                                map_field.locationpicker('location', { latitude: position.coords.latitude, longitude: position.coords.longitude });
                            });
                        }
                    }
                }, {
                    key: 'loadLocationPicker',
                    value: function loadLocationPicker(element) {
                        var parent = this;
                        var map_field = $(element).find('.Map-field');
                        map_field.locationpicker({
                            location: { latitude: parent.lat(), longitude: parent.lng() },
                            radius: 0,
                            inputBinding: {
                                locationNameInput: $(element).find('.Map-address-search'),
                                latitudeInput: $(element).find('.Map-coordinates-lat'),
                                longitudeInput: $(element).find('.Map-coordinates-lng')
                            },
                            enableAutocomplete: true,
                            onchanged: function onchanged(currentLocation, isMarkerDropped) {
                                parent.lat(currentLocation.latitude);
                                parent.lng(currentLocation.longitude);
                                var addressComponents = $(this).locationpicker('map').location.addressComponents;
                                parent.country(addressComponents.country);
                            }
                        });

                        $('#modal').on('shown.bs.modal', function () {
                            map_field.locationpicker('autosize');
                        });

                        this.getLocation(map_field);
                    }
                }]);
                return GeotagCreateModal;
            }(Modal);

            _export('default', GeotagCreateModal);
        }
    };
});;
'use strict';

System.register('avatar4eg/geotags/components/GeotagModal', ['flarum/components/Modal'], function (_export, _context) {
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
                    return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(GeotagModal).apply(this, arguments));
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

System.register('avatar4eg/geotags/extendEditorControls', ['flarum/extend', 'flarum/app', 'flarum/helpers/icon', 'flarum/components/TextEditor', 'flarum/components/Button', 'avatar4eg/geotags/models/Geotag', 'avatar4eg/geotags/components/GeotagCreateModal', 'avatar4eg/geotags/components/GeotagModal'], function (_export, _context) {
    var extend, app, icon, TextEditor, Button, Geotag, GeotagCreateModal, GeotagModal;

    _export('default', function () {
        extend(TextEditor.prototype, 'init', function () {
            this.relationValue = this.relationValue || {};
            this.relationValue.geotags = [];
        });

        extend(TextEditor.prototype, 'controlItems', function (items) {
            if (!app.forum.attribute('canAddGeotags')) return;
            var textAreaObj = this;

            items.add('avatar4eg-geotags', m('div', {
                className: 'Button hasIcon avatar4eg-geotags-button Button--icon',
                onclick: function onclick(e) {
                    e.preventDefault();
                    app.modal.show(new GeotagCreateModal({ textAreaObj: textAreaObj }));
                }
            }, [icon('map-marker', { className: 'Button-icon' }), m('span', { className: 'Button-label' }, app.translator.trans('avatar4eg-geotags.forum.post.geotag-add'))]), -1);

            $('.Button-label', '.item-avatar4eg-geotags > div').hide();
            $('.item-avatar4eg-geotags > div').hover(function () {
                $('.Button-label', this).show();$(this).removeClass('Button--icon');
            }, function () {
                $('.Button-label', this).hide();$(this).addClass('Button--icon');
            });

            var geotags = this.relationValue.geotags;
            if (geotags && geotags.length) {
                var titles = geotags.map(function (geotag, i) {
                    if (geotag instanceof Geotag) {
                        return [m('a', {
                            href: '#',
                            onclick: function onclick(e) {
                                e.preventDefault();
                                app.modal.show(new GeotagModal({ geotag: geotag }));
                            }
                        }, geotag.title()), Button.component({
                            className: 'Button Button--icon Button--link',
                            icon: 'times',
                            title: app.translator.trans('avatar4eg-geotags.forum.post.geotag-delete'),
                            onclick: function onclick() {
                                geotag.delete();
                                geotags.splice(i, 1);
                            }
                        })];
                    }
                });

                items.add('geotags', m('div', { className: 'Post-geotags-editing' }, titles), -1000);
            }
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
        }, function (_flarumComponentsButton) {
            Button = _flarumComponentsButton.default;
        }, function (_avatar4egGeotagsModelsGeotag) {
            Geotag = _avatar4egGeotagsModelsGeotag.default;
        }, function (_avatar4egGeotagsComponentsGeotagCreateModal) {
            GeotagCreateModal = _avatar4egGeotagsComponentsGeotagCreateModal.default;
        }, function (_avatar4egGeotagsComponentsGeotagModal) {
            GeotagModal = _avatar4egGeotagsComponentsGeotagModal.default;
        }],
        execute: function () {}
    };
});;
'use strict';

System.register('avatar4eg/geotags/extendPostData', ['flarum/extend', 'flarum/components/ReplyComposer', 'flarum/components/EditPostComposer', 'flarum/components/DiscussionComposer'], function (_export, _context) {
    var extend, ReplyComposer, EditPostComposer, DiscussionComposer;

    _export('default', function () {
        extend(EditPostComposer.prototype, 'init', function () {
            this.editor.relationValue.geotags = this.props.post.geotags();
        });

        extend(EditPostComposer.prototype, 'data', function (data) {
            data.relationships = data.relationships || {};
            data.relationships.geotags = this.editor.relationValue.geotags;
        });

        extend(ReplyComposer.prototype, 'data', function (data) {
            data.relationships = data.relationships || {};
            data.relationships.geotags = this.editor.relationValue.geotags;
        });

        extend(DiscussionComposer.prototype, 'data', function (data) {
            data.relationships = data.relationships || {};
            data.relationships.geotags = this.editor.relationValue.geotags;
        });
    });

    return {
        setters: [function (_flarumExtend) {
            extend = _flarumExtend.extend;
        }, function (_flarumComponentsReplyComposer) {
            ReplyComposer = _flarumComponentsReplyComposer.default;
        }, function (_flarumComponentsEditPostComposer) {
            EditPostComposer = _flarumComponentsEditPostComposer.default;
        }, function (_flarumComponentsDiscussionComposer) {
            DiscussionComposer = _flarumComponentsDiscussionComposer.default;
        }],
        execute: function () {}
    };
});;
'use strict';

System.register('avatar4eg/geotags/main', ['flarum/extend', 'flarum/app', 'flarum/models/Post', 'flarum/Model', 'avatar4eg/geotags/models/Geotag', 'avatar4eg/geotags/addGeotagsList', 'avatar4eg/geotags/extendPostData', 'avatar4eg/geotags/extendEditorControls'], function (_export, _context) {
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
                    return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Geotag).apply(this, arguments));
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