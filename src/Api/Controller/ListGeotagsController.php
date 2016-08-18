<?php
namespace Avatar4eg\Geotags\Api\Controller;

use Avatar4eg\Geotags\Api\Serializer\GeotagBasicSerializer;
use Avatar4eg\Geotags\Repository\GeotagRepository;
use Flarum\Api\Controller\AbstractCollectionController;
use Flarum\Api\UrlGenerator;
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
     * @var UrlGenerator
     */
    protected $url;

    /**
     * @param GeotagRepository $geotags
     */
    public function __construct(GeotagRepository $geotags, UrlGenerator $url)
    {
        $this->geotags = $geotags;
        $this->url = $url;
    }

    /**
     * {@inheritdoc}
     */
    protected function data(ServerRequestInterface $request, Document $document)
    {
        $filter = $this->extractFilter($request);
        $include = $this->extractInclude($request);
        $where = [];

        $sort = $this->extractSort($request);
        $limit = $this->extractLimit($request);
        $offset = $this->extractOffset($request);

        if ($postIds = array_get($filter, 'id')) {
            $geotags = $this->geotags->findByIds(explode(',', $postIds));
        } else {
            if ($countryIso = array_get($filter, 'country')) {
                $where['country'] = $countryIso;
            }
            $geotags = $this->geotags->findWhere($where, $sort, $limit, $offset);
        }

        $total = $this->geotags->query()->count();

        $document->addPaginationLinks(
            $this->url->toRoute('avatar4eg.geotags.index'),
            $request->getQueryParams(),
            $offset,
            $limit,
            $total
        );

        return $geotags->load($include);
    }
}
