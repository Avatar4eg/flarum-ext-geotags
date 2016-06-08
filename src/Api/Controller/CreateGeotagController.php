<?php
namespace Avatar4eg\Geotags\Api\Controller;

use Avatar4eg\Geotags\Api\Serializer\GeotagBasicSerializer;
use Avatar4eg\Geotags\Command\CreateGeotag;
use Flarum\Api\Controller\AbstractResourceController;
use Illuminate\Contracts\Bus\Dispatcher;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;

class CreateGeotagController extends AbstractResourceController
{
    public $serializer = GeotagBasicSerializer::class;

    protected $bus;

    public function __construct(Dispatcher $bus)
    {
        $this->bus = $bus;
    }

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $postId = array_get($request->getQueryParams(), 'post');
        $actor = $request->getAttribute('actor');
        $data = array_get($request->getParsedBody(), 'data');

        return $this->bus->dispatch(
            new CreateGeotag($postId, $data, $actor)
        );
    }
}
