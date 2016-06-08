import { extend } from 'flarum/extend';
import app from 'flarum/app';
import PermissionGrid from 'flarum/components/PermissionGrid';

app.initializers.add('avatar4eg-geotags', app => {
    extend(PermissionGrid.prototype, 'startItems', items => {
        items.add('addGeotags', {
            icon: 'map-marker',
            label: app.translator.trans('avatar4eg-geotags.admin.permissions.add_geotags_label'),
            permission: 'avatar4eg.geotags.create'
        });
    });
});
