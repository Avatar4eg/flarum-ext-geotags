<?php
namespace Avatar4eg\Geotags\Events;

use Avatar4eg\Geotags\Geotag;
use Flarum\Core\Post;
use Flarum\Core\User;

class GeotagWillBeSaved
{
    public $actor;
    public $geotag;
    public $data;

    /**
     * @param User      $actor The user performing the action.
     * @param Geotag    $geotag
     * @param string    $data
     */
    public function __construct(User $actor, Geotag $geotag, $data)
    {
        $this->actor    = $actor;
        $this->geotag   = $geotag;
        $this->data     = $data;
    }
}
