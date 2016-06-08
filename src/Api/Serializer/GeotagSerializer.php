<?php
namespace Avatar4eg\Geotags\Api\Serializer;

use Flarum\Api\Serializer\PostSerializer;
use Flarum\Api\Serializer\UserSerializer;

class GeotagSerializer extends GeotagBasicSerializer
{
    /**
     * @return \Tobscure\JsonApi\Relationship
     */
    protected function post($geotag)
    {
        return $this->hasOne($geotag, PostSerializer::class);
    }

    /**
     * @return \Tobscure\JsonApi\Relationship
     */
    protected function user($geotag)
    {
        return $this->hasOne($geotag, UserSerializer::class);
    }
}
