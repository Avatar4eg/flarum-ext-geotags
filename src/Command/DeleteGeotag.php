<?php
namespace Avatar4eg\Geotags\Command;

use Flarum\Core\User;

class DeleteGeotag
{
    /**
     * The ID of the geotag to delete.
     *
     * @var int
     */
    public $geotagId;

    /**
     * The user performing the action.
     *
     * @var User
     */
    public $actor;

    /**
     * Any other geotag input associated with the action. This is unused by
     * default, but may be used by extensions.
     *
     * @var array
     */
    public $data;

    /**
     * @param int $geotagId The ID of the geotag to delete.
     * @param User $actor The user performing the action.
     * @param array $data Any other geotag input associated with the action. This
     *     is unused by default, but may be used by extensions.
     */
    public function __construct($geotagId, User $actor, array $data = [])
    {
        $this->geotagId = $geotagId;
        $this->actor = $actor;
        $this->data = $data;
    }
}
