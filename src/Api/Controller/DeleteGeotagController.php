<?php
namespace Avatar4eg\Geotags\Api\Controller;

use Flarum\Api\Controller\AbstractDeleteController;
use Avatar4eg\Geotags\Command\DeleteGeotag;
use Illuminate\Contracts\Bus\Dispatcher;
use Psr\Http\Message\ServerRequestInterface;

class DeleteGeotagController extends AbstractDeleteController
{
    /**
     * @var Dispatcher
     */
    protected $bus;

    /**
     * @param Dispatcher $bus
     */
    public function __construct(Dispatcher $bus)
    {
        $this->bus = $bus;
    }

    /**
     * {@inheritdoc}
     */
    protected function delete(ServerRequestInterface $request)
    {
        $this->bus->dispatch(
            new DeleteGeotag(array_get($request->getQueryParams(), 'id'), $request->getAttribute('actor'))
        );
    }
}
