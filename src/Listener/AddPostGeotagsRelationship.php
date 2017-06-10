<?php
namespace Avatar4eg\Geotags\Listener;

use Avatar4eg\Geotags\Api\Serializer\GeotagBasicSerializer;
use Avatar4eg\Geotags\Geotag;
use Flarum\Api\Controller;
use Flarum\Api\Serializer\PostSerializer;
use Flarum\Core\Post;
use Flarum\Event\ConfigureApiController;
use Flarum\Event\GetApiRelationship;
use Flarum\Event\GetModelRelationship;
use Flarum\Event\PostWasDeleted;
use Flarum\Event\PostWasPosted;
use Flarum\Event\PostWillBeSaved;
use Flarum\Event\PrepareApiData;
use Illuminate\Contracts\Events\Dispatcher;
use Illuminate\Database\Eloquent\Collection;

class AddPostGeotagsRelationship
{
    /**
     * @param Dispatcher $events
     */
    public function subscribe(Dispatcher $events)
    {
        $events->listen(GetModelRelationship::class, [$this, 'getModelRelationship']);
        $events->listen(PostWillBeSaved::class, [$this, 'postWillBeSaved']);
        $events->listen(PostWasPosted::class, [$this, 'postWasPosted']);
        $events->listen(PostWasDeleted::class, [$this, 'postWasDeleted']);
        $events->listen(GetApiRelationship::class, [$this, 'getApiRelationship']);
        $events->listen(ConfigureApiController::class, [$this, 'includeGeotagsRelationship']);
        $events->listen(PrepareApiData::class, [$this, 'prepareApiData']);
    }

    /**
     * @param GetModelRelationship $event
     * @return \Illuminate\Database\Eloquent\Relations\HasMany|null
     */
    public function getModelRelationship(GetModelRelationship $event)
    {
        if ($event->isRelationship(Post::class, 'geotags')) {
            return $event->model->hasMany(Geotag::class, 'post_id');
        }
    }

    /**
     * @param PostWillBeSaved $event
     */
    public function postWillBeSaved(PostWillBeSaved $event)
    {
        $post = $event->post;
        $data = $event->data;

        if (array_key_exists('relationships', $data) && array_key_exists('geotags', $data['relationships'])) {
            foreach ($data['relationships']['geotags']['data'] as $geotag_id) {
                $geotag = Geotag::findOrFail($geotag_id['id']);
                if($geotag) {
                    $post->geotags->add($geotag);
                }
                if ($post->id) {
                    $geotag->post()->associate($post);
                    $geotag->save();
                }
            }
        }
    }

    /**
     * @param PostWasPosted $event
     */
    public function postWasPosted(PostWasPosted $event)
    {
        $post = $event->post;
        foreach ($post->geotags as $geotag) {
            $geotag->post()->associate($post);
            $geotag->save();
        }
    }

    /**
     * @param PostWasDeleted $event
     */
    public function postWasDeleted(PostWasDeleted $event)
    {
        $event->post->geotags()->delete();
    }

    /**
     * @param GetApiRelationship $event
     * @return \Tobscure\JsonApi\Relationship|null
     */
    public function getApiRelationship(GetApiRelationship $event)
    {
        if ($event->isRelationship(PostSerializer::class, 'geotags')) {
            return $event->serializer->hasMany($event->model, GeotagBasicSerializer::class, 'geotags');
        }
    }

    /**
     * @param ConfigureApiController $event
     */
    public function includeGeotagsRelationship(ConfigureApiController $event)
    {
        if ($event->isController(Controller\ShowDiscussionController::class)) {
            $event->addInclude([
                'posts.geotags'
            ]);
        }

        if ($event->isController(Controller\ListPostsController::class)
            || $event->isController(Controller\ShowPostController::class)) {
            $event->addInclude([
                'geotags'
            ]);
        }
    }

    /**
     * @param PrepareApiData $event
     */
    public function prepareApiData(PrepareApiData $event)
    {
        if ($event->isController(Controller\ShowDiscussionController::class)) {
            $posts = $event->data->getRelation('posts');
        }
        
        if ($event->isController(Controller\ListPostsController::class)) {
            $posts = $event->data->all();
        }

        if ($event->isController(Controller\ShowPostController::class)) {
            $posts = [$event->data];
        }

        if (isset($posts)) {
            $postsList = [];

            foreach ($posts as $post) {
                if (is_object($post)) {
                    $post->setRelation('geotags', null);

                    $postsList[] = $post;
                }
            }

            if (count($postsList)) {
                (new Collection($postsList))
                    ->load('geotags');
            }
        }
    }
}
