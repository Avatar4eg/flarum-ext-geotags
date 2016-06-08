<?php
namespace Avatar4eg\Geotags\Command;

use Flarum\Core\User;

class CreateGeotag
{
    public $postId;
    public $data;
    public $actor;

    /**
     * @param int       $postId
     * @param string    $data
     * @param User      $actor
     */
    public function __construct($postId = null, $data, User $actor)
    {
        $this->postId   = $postId;
        $this->data     = $data;
        $this->actor    = $actor;
    }
}
