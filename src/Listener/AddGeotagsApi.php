<?php
namespace Avatar4eg\Geotags\Listener;

use Avatar4eg\Geotags\Api\Controller\CreateGeotagController;
use Avatar4eg\Geotags\Api\Controller\ListGeotagsController;
use Avatar4eg\Geotags\Api\Controller\ShowGeotagController;
use Avatar4eg\Geotags\Api\Controller\DeleteGeotagController;
use Flarum\Api\Serializer\ForumSerializer;
use Flarum\Event\ConfigureApiRoutes;
use Flarum\Event\PrepareApiAttributes;
use Illuminate\Events\Dispatcher;

class AddGeotagsApi
{
    /**
     * @param Dispatcher $events
     */
    public function subscribe(Dispatcher $events)
    {
        $events->listen(ConfigureApiRoutes::class, [$this, 'configureApiRoutes']);
        $events->listen(PrepareApiAttributes::class, [$this, 'prepareApiAttributes']);
    }

    /**
     * @param ConfigureApiRoutes $event
     */
    public function configureApiRoutes(ConfigureApiRoutes $event)
    {
        $event->get('/geotags', 'avatar4eg.geotags.index', ListGeotagsController::class);
        $event->get('/geotags/{id}', 'avatar4eg.geotags.get', ShowGeotagController::class);
        $event->post('/geotags', 'avatar4eg.geotags.create', CreateGeotagController::class);
        $event->delete('/geotags/{id}', 'avatar4eg.geotags.delete', DeleteGeotagController::class);
    }

    /**
     * @param PrepareApiAttributes $event
     */
    public function prepareApiAttributes(PrepareApiAttributes $event)
    {
        if ($event->isSerializer(ForumSerializer::class)) {
            $event->attributes['canAddGeotags'] = $event->actor->can('avatar4eg.geotags.create');
        }
    }
}
