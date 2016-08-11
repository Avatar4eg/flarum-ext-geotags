'use strict';

System.register('avatar4eg/geotags/components/GeotagsSettingsModal', ['flarum/app', 'flarum/components/SettingsModal'], function (_export, _context) {
    var app, SettingsModal, GeotagsSettingsModal;
    return {
        setters: [function (_flarumApp) {
            app = _flarumApp.default;
        }, function (_flarumComponentsSettingsModal) {
            SettingsModal = _flarumComponentsSettingsModal.default;
        }],
        execute: function () {
            GeotagsSettingsModal = function (_SettingsModal) {
                babelHelpers.inherits(GeotagsSettingsModal, _SettingsModal);

                function GeotagsSettingsModal() {
                    babelHelpers.classCallCheck(this, GeotagsSettingsModal);
                    return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(GeotagsSettingsModal).apply(this, arguments));
                }

                babelHelpers.createClass(GeotagsSettingsModal, [{
                    key: 'className',
                    value: function className() {
                        return 'Modal--small';
                    }
                }, {
                    key: 'title',
                    value: function title() {
                        return app.translator.trans('avatar4eg-geotags.admin.settings.modal_title');
                    }
                }, {
                    key: 'form',
                    value: function form() {
                        return [m('div', { className: 'Form-group' }, [m('label', {}, app.translator.trans('avatar4eg-geotags.admin.settings.api_label')), m('input', {
                            className: 'FormControl',
                            bidi: this.setting('avatar4eg.geotags-gmaps-key')
                        })])];
                    }
                }]);
                return GeotagsSettingsModal;
            }(SettingsModal);

            _export('default', GeotagsSettingsModal);
        }
    };
});;
'use strict';

System.register('avatar4eg/geotags/main', ['flarum/extend', 'flarum/app', 'flarum/components/PermissionGrid', 'avatar4eg/geotags/components/GeotagsSettingsModal'], function (_export, _context) {
    var extend, app, PermissionGrid, GeotagsSettingsModal;
    return {
        setters: [function (_flarumExtend) {
            extend = _flarumExtend.extend;
        }, function (_flarumApp) {
            app = _flarumApp.default;
        }, function (_flarumComponentsPermissionGrid) {
            PermissionGrid = _flarumComponentsPermissionGrid.default;
        }, function (_avatar4egGeotagsComponentsGeotagsSettingsModal) {
            GeotagsSettingsModal = _avatar4egGeotagsComponentsGeotagsSettingsModal.default;
        }],
        execute: function () {

            app.initializers.add('avatar4eg-geotags', function (app) {
                app.extensionSettings['avatar4eg-geotags'] = function () {
                    return app.modal.show(new GeotagsSettingsModal());
                };

                extend(PermissionGrid.prototype, 'startItems', function (items) {
                    items.add('addGeotags', {
                        icon: 'map-marker',
                        label: app.translator.trans('avatar4eg-geotags.admin.permissions.add_geotags_label'),
                        permission: 'avatar4eg.geotags.create'
                    });
                });
            });
        }
    };
});