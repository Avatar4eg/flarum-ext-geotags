import { extend, override } from 'flarum/extend';
import app from 'flarum/app';

import Post from 'flarum/models/Post';
import Model from 'flarum/Model';

import Geotag from 'avatar4eg/geotags/models/Geotag';

import addGeotagsList from 'avatar4eg/geotags/addGeotagsList';
import extendPostData from 'avatar4eg/geotags/extendPostData';
import extendEditorControls from 'avatar4eg/geotags/extendEditorControls';

app.initializers.add('avatar4eg-geotags', app => {
    Post.prototype.geotags = Model.hasMany('geotags');
    app.store.models.geotags = Geotag;

    addGeotagsList();
    extendEditorControls();
    extendPostData();
});
