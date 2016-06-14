import { extend } from 'flarum/extend';
import app from 'flarum/app';
import icon from 'flarum/helpers/icon';

import TextEditor from 'flarum/components/TextEditor';
import Button from 'flarum/components/Button';

import Geotag from 'avatar4eg/geotags/models/Geotag';
import GeotagCreateModal from 'avatar4eg/geotags/components/GeotagCreateModal';
import GeotagModal from 'avatar4eg/geotags/components/GeotagModal';

export default function() {
    extend(TextEditor.prototype, 'init', function()
    {
        this.relationValue = this.relationValue || {};
        this.relationValue.geotags = [];
    });

    extend(TextEditor.prototype, 'controlItems', function(items)
    {
        if (!app.forum.attribute('canAddGeotags')) return;
        var textAreaObj = this;

        items.add('avatar4eg-geotags',
            m('div', {
                className: 'Button hasIcon avatar4eg-geotags-button Button--icon',
                onclick: function (e) {
                    e.preventDefault();
                    app.modal.show(new GeotagCreateModal({textAreaObj}));
                }
            }, [
                icon('map-marker', {className: 'Button-icon'}),
                m('span', {className: 'Button-label'}, app.translator.trans('avatar4eg-geotags.forum.post.geotag-add'))
            ])
            , -1);

        $('.Button-label', '.item-avatar4eg-geotags > div').hide();
        $('.item-avatar4eg-geotags > div').hover(
            function(){ $('.Button-label', this).show(); $(this).removeClass('Button--icon')},
            function(){ $('.Button-label', this).hide(); $(this).addClass('Button--icon')}
        );

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

            items.add('geotags', m('div', {className: 'Post-geotags-editing'}, titles), -1000)
        }
    });
}
