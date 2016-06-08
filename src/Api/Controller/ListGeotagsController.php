<?php
namespace Avatar4eg\Geotags\Api\Controller;

use Avatar4eg\Geotags\Api\Serializer\GeotagBasicSerializer;
use Avatar4eg\Geotags\Repository\GeotagRepository;
use Flarum\Api\Controller\AbstractCollectionController;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;

class ListGeotagsController extends AbstractCollectionController
{
    /**
     * {@inheritdoc}
     */
    public $serializer = GeotagBasicSerializer::class;

    /**
     * @var GeotagRepository
     */
    private $geotags;

    /**
     * @param GeotagRepository $geotags
     */
    public function __construct(GeotagRepository $geotags)
    {
        $this->geotags = $geotags;
    }

    /**
     * {@inheritdoc}
     */
    protected function data(ServerRequestInterface $request, Document $document)
    {
        $filter = $this->extractFilter($request);
        $include = $this->extractInclude($request);
        $where = [];

        if ($postIds = array_get($filter, 'id')) {
            $geotags = $this->geotags->findByIds(explode(',', $postIds));
        } else {
            if ($countryIso = array_get($filter, 'country')) {
                $where['country'] = $countryIso;
            }

            $sort = $this->extractSort($request);
            $limit = $this->extractLimit($request);
            $offset = $this->extractOffset($request);
            $geotags = $this->geotags->findWhere($where, $sort, $limit, $offset);
        }

        return $geotags->load($include);
    }
}
