<?php
namespace Avatar4eg\Geotags\Api\Serializer;

use Avatar4eg\Geotags\Geotag;
use Flarum\Api\Serializer\AbstractSerializer;
use Flarum\Core\Access\Gate;
use InvalidArgumentException;

class GeotagBasicSerializer extends AbstractSerializer
{
    /**
     * {@inheritdoc}
     */
    protected $type = 'geotags';

    /**
     * @var Gate
     */
    protected $gate;

    /**
     * @param Gate $gate
     */
    public function __construct(Gate $gate)
    {
        $this->gate = $gate;
    }

    /**
     * {@inheritdoc}
     *
     * @param Geotag $geotag
     * @throws InvalidArgumentException
     */
    protected function getDefaultAttributes($geotag)
    {
        if (! ($geotag instanceof Geotag)) {
            throw new InvalidArgumentException(get_class($this)
                . ' can only serialize instances of ' . Geotag::class);
        }

        return [
            'title'         => $geotag->title,
            'country'       => $geotag->country,
            'lat'           => (float) $geotag->lat,
            'lng'           => (float) $geotag->lng
        ];
    }
}
