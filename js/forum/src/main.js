import { extend, override } from 'flarum/extend';
import app from 'flarum/app';
import punctuateSeries from 'flarum/helpers/punctuateSeries';

import TextEditor from 'flarum/components/TextEditor';
import ReplyComposer from 'flarum/components/ReplyComposer';
import EditPostComposer from 'flarum/components/EditPostComposer';
import DiscussionComposer from 'flarum/components/DiscussionComposer';
import Button from 'flarum/components/Button';
import Post from 'flarum/models/Post';
import Model from 'flarum/Model';

import Geotag from 'avatar4eg/geotags/models/Geotag';
import GeotagCreateModal from 'avatar4eg/geotags/components/GeotagCreateModal';
import addGeotagsList from 'avatar4eg/geotags/addGeotagsList';
import GeotagModal from 'avatar4eg/geotags/components/GeotagModal';

app.initializers.add('avatar4eg-geotags', app => {
    Post.prototype.geotags = Model.hasMany('geotags');
    app.store.models.geotags = Geotag;

    addGeotagsList();

    extend(TextEditor.prototype, 'init', function()
    {
        this.relationValue = this.relationValue || {};
        this.relationValue.geotags = [];
    });

    extend(TextEditor.prototype, 'controlItems', function(items)
    {
        if (!app.forum.attribute('canAddGeotags')) return;
        var text_editor = this;

        items.add('avatar4eg-geotags',
            Button.component({
                className: "Button Button--icon hasIcon",
                icon: 'map-marker',
                label: app.translator.trans('avatar4eg-geotags.forum.buttons.add'),
                onclick: () => {
                    var map_modal = new GeotagCreateModal();
                    map_modal.textAreaObj = text_editor;
                    app.modal.show(map_modal);
                }
            })
        , -1);

        var geotags = this.relationValue.geotags;
        if (geotags && geotags.length) {
            const titles = geotags.map((geotag, i) => {
                if (geotag instanceof Geotag) {
                    return [
                        m('a', {
                            href: '#',
                            onclick: function (e) {
                                e.preventDefault();
                                app.modal.show(new GeotagModal({geotag}));
                            }
                        }, geotag.title()),
                        Button.component({
                            className: 'Button Button--icon Button--link',
                            icon: 'times',
                            title: app.translator.trans('avatar4eg-geotags.forum.post.geotag-delete'),
                            onclick: function () {
                                geotag.delete();
                                geotags.splice(i, 1);
                            }
                        })
                    ];
                }
            });

            items.add('geotags', m('div', {className: 'Post-geotags-editing'}, punctuateSeries(titles)), -1000)
        }
    });

    extend(EditPostComposer.prototype, 'init', function()
    {
        this.editor.relationValue.geotags = this.props.post.geotags();
    });

    extend(EditPostComposer.prototype, 'data', function(data)
    {
        data.relationships = data.relationships || {};
        data.relationships.geotags = this.editor.relationValue.geotags;
    });

    extend(EditPostComposer.prototype, 'onsubmit', function()
    {
        // console.log(this.data());
        // console.log(this.editor.relationValue.geotags);
        // //this.props.post.geotags = this.editor.relationValue.geotags;
    });

    extend(ReplyComposer.prototype, 'data', function(data)
    {
        data.relationships = data.relationships || {};
        data.relationships.geotags = this.editor.relationValue.geotags;
    });

    extend(DiscussionComposer.prototype, 'data', function(data)
    {
        data.relationships = data.relationships || {};
        data.relationships.geotags = this.editor.relationValue.geotags;
    });
});
