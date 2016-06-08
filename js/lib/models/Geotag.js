import Model from 'flarum/Model';
import mixin from 'flarum/utils/mixin';

export default class Geotag extends mixin(Model, {
    title: Model.attribute('title'),
    country: Model.attribute('country'),
    lat: Model.attribute('lat'),
    lng: Model.attribute('lng')
}) {}