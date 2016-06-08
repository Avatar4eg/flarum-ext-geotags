'use strict';

System.register('avatar4eg/geotags/main', ['flarum/extend', 'flarum/app', 'flarum/components/PermissionGrid'], function (_export, _context) {
    var extend, app, PermissionGrid;
    return {
        setters: [function (_flarumExtend) {
            extend = _flarumExtend.extend;
        }, function (_flarumApp) {
            app = _flarumApp.default;
        }, function (_flarumComponentsPermissionGrid) {
            PermissionGrid = _flarumComponentsPermissionGrid.default;
        }],
        execute: function () {

            app.initializers.add('avatar4eg-geotags', function (app) {
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