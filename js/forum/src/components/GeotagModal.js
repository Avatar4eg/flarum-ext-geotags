import Modal from 'flarum/components/Modal';

export default class GeotagModal extends Modal {
    init() {
        this.geotag = this.props.geotag;
    }

    className() {
        return 'GeotagModal Modal--large';
    }

    title() {
        return this.geotag.title();
    }

    content() {
        return [
            m('div', {className: 'Modal-body'}, [
                m('div', {
                    className: 'Map-field',
                    style: {'width': '100%', 'height': '400px'},
                    config: this.loadMap.bind(this)
                })
            ])
        ]
    }

    loadMap(element) {
        let latitude = this.geotag.lat();
        let longitude = this.geotag.lng();
        let coords = new google.maps.LatLng(latitude, longitude);
        let mapOptions = {
            zoom: 15,
            center: coords,
            mapTypeControl: true,
            navigationControlOptions: {
                style: google.maps.NavigationControlStyle.SMALL
            },
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        let map = new google.maps.Map(
            element, mapOptions
        );
        let marker = new google.maps.Marker({
            position: coords,
            map: map,
            title: this.geotag.title()
        });

        $('#modal').on('shown.bs.modal', function () {
            google.maps.event.trigger(map, 'resize');
            map.setCenter(coords);
        });
    }
}