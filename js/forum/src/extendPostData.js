import { extend, override } from 'flarum/extend';
import ComposerBody from 'flarum/components/ComposerBody';
import EditPostComposer from 'flarum/components/EditPostComposer';
import ReplyComposer from 'flarum/components/ReplyComposer';
import DiscussionComposer from 'flarum/components/DiscussionComposer';

export default function() {
    ComposerBody.prototype.submitGeotags = function (originalSubmit) {
        let geotags = this.editor.geotags;
        let originalGeotags = this.editor.originalGeotags;

        let deferreds = [];
        this.loading = true;
        $.each(originalGeotags, function(index, geotag) {
            if (!geotags.includes(geotag)) {
                deferreds.push(geotag.delete());
            }
        });
        $.each(geotags, function(index, geotag) {
            if (!geotag.id() && !originalGeotags.includes(geotag)) {
                deferreds.push(geotag.save(geotag.data.attributes));
            }
        });
        m.sync(deferreds).then(function () {
                originalSubmit();
            }
        );
    };

    extend(EditPostComposer.prototype, 'init', function()
    {
        this.editor.geotags = this.props.post.geotags();
        this.editor.originalGeotags = this.props.post.geotags();
    });

    extend(EditPostComposer.prototype, 'data', function(data)
    {
        data.relationships = data.relationships || {};
        data.relationships.geotags = this.editor.geotags;
    });

    extend(ReplyComposer.prototype, 'data', function(data)
    {
        data.relationships = data.relationships || {};
        data.relationships.geotags = this.editor.geotags;
    });

    extend(DiscussionComposer.prototype, 'data', function(data)
    {
        data.relationships = data.relationships || {};
        data.relationships.geotags = this.editor.geotags;
    });

    override(EditPostComposer.prototype, 'onsubmit', function(original) {
        this.submitGeotags(original);
    });

    override(ReplyComposer.prototype, 'onsubmit', function(original) {
        this.submitGeotags(original);
    });

    override(DiscussionComposer.prototype, 'onsubmit', function(original) {
        this.submitGeotags(original);
    });
}
