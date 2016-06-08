<?php
namespace Avatar4eg\Geotags\Repository;

use Avatar4eg\Geotags\Geotag;
use Flarum\Core\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class GeotagRepository
{
    /**
     * @param integer $id
     * @param \Flarum\Core\User $actor
     * @return Geotag
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function findOrFail($id, User $actor = null)
    {
        return Geotag::where('id', $id)->firstOrFail();
    }

    /**
     * @param array $where
     * @param array $sort
     * @param integer $count
     * @param integer $start
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findWhere(array $where = [], $sort = [], $count = null, $start = 0)
    {
        $query = Geotag::where($where)
            ->skip($start)
            ->take($count);

        foreach ((array) $sort as $field => $order) {
            $query->orderBy($field, $order);
        }

        $ids = $query->lists('id')->all();

        return $this->findByIds($ids);
    }

    /**
     * @param array $ids
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByIds(array $ids)
    {
        return Geotag::whereIn('id', $ids)->get();
    }
}
