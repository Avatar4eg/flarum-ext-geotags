<?php
namespace Avatar4eg\Geotags;

use Flarum\Core\Post;
use Flarum\Core\User;
use Flarum\Database\AbstractModel;

/**
 * @property int $id
 * @property int $user_id
 * @property int $post_id
 * @property string $title
 * @property string $country
 * @property float $lat
 * @property float $lng
 * @property \DateTime created_at
 */
class Geotag extends AbstractModel
{
    protected $table = 'avatar4eg_geotags';

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
