<?php
namespace Avatar4eg\Geotags\Command;

use Avatar4eg\Geotags\Geotag;
use Flarum\Core\Access\AssertPermissionTrait;
use Avatar4eg\Geotags\Repository\GeotagRepository;

class DeleteGeotagHandler
{
    use AssertPermissionTrait;

    /**
     * @var GeotagRepository
     */
    protected $geotags;

    /**
     * @param GeotagRepository $geotags
     */
    public function __construct(GeotagRepository $geotags)
    {
        $this->geotags = $geotags;
    }

    /**
     * @param DeleteGeotag $command
     * @return Geotag
     * @throws \Flarum\Core\Exception\PermissionDeniedException
     */
    public function handle(DeleteGeotag $command)
    {
        $actor = $command->actor;

        $geotag = $this->geotags->findOrFail($command->geotagId, $actor);

        $this->assertAdmin($actor);

        $geotag->delete();

        return $geotag;
    }
}
