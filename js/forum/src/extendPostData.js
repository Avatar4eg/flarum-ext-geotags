import { extend } from 'flarum/extend';
import ReplyComposer from 'flarum/components/ReplyComposer';
import EditPostComposer from 'flarum/components/EditPostComposer';
import DiscussionComposer from 'flarum/components/DiscussionComposer';

export default function() {
    extend(EditPostComposer.prototype, 'init', function()
    {
        this.editor.relationValue.geotags = this.props.post.geotags();
    });

    extend(EditPostComposer.prototype, 'data', function(data)
    {
        data.relationships = data.relationships || {};
        data.relationships.geotags = this.editor.relationValue.geotags;
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
}
