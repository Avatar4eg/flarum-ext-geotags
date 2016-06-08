import Modal from 'flarum/components/Modal';
import FieldSet from 'flarum/components/FieldSet';
import Button from 'flarum/components/Button';

export default class GeotagCreateModal extends Modal {
    init() {
        this.textAreaObj = null;
        this.loading = false;

        this.geotag = app.store.createRecord('geotags');

        this.itemTitle = m.prop(app.translator.trans('avatar4eg-geotags.forum.map.default.title')[0]);
        this.lat = m.prop(59.950179);
        this.lng = m.prop(30.316147);
        this.country = m.prop('RU');
    }

    className() {
        return 'GeotagCreateModal Modal--large';
    }

    title() {
        const title = this.itemTitle();
        return title
            ? title
            : app.translator.trans('avatar4eg-geotags.forum.edit.headtitle');
    }

    content() {
        return [
            m('div', {className: 'Modal-body'}, [
                m('div', {className: 'map-form-container'}, [
                    m('form', {onsubmit: this.onsubmit.bind(this), config:this.loadLocationPicker.bind(this) }, [
                        m('div', {className: 'Map-address'}, [
                            FieldSet.component({
                                label: app.translator.trans('avatar4eg-geotags.forum.map.labels.location'),
                                children: [
                                    m('label', {}, app.translator.trans('avatar4eg-geotags.forum.map.labels.title')),
                                    m('input', {
                                        className: 'FormControl Map-address-title',
                                        value: this.itemTitle(),
                                        oninput: m.withAttr('value', this.itemTitle)
                                    }),
                                    m('label', {}, app.translator.trans('avatar4eg-geotags.forum.map.labels.address')),
                                    m('input', {
                                        className: 'FormControl Map-address-search'
                                    })
                                ]
                            })
                        ]),
                        m('div', {className: 'Map-field', style: {'width': '100%', 'height': '400px'}}),
                        m('div', {className: 'Map-coordinates'}, [
                            FieldSet.component({
                                label: app.translator.trans('avatar4eg-geotags.forum.map.labels.coordinates'),
                                children: [
                                    m('label', {}, app.translator.trans('avatar4eg-geotags.forum.map.labels.latitude')),
                                    m('input', {
                                        className: 'FormControl Map-coordinates-lat'
                                    }),
                                    m('label', {}, app.translator.trans('avatar4eg-geotags.forum.map.labels.longitude')),
                                    m('input', {
                                        className: 'FormControl Map-coordinates-lng'
                                    })
                                ]
                            })
                        ]),

                        Button.component({
                            type: 'submit',
                            className: 'Button Button--primary',
                            children: app.translator.trans('avatar4eg-geotags.forum.buttons.save'),
                            loading: this.loading
                        })
                    ])
                ])
            ])
        ]
    }

    onsubmit(e) {
        e.preventDefault();
        if (this.loading) return;
        this.loading = true;

        var markdownString = '**' + this.itemTitle() + '**';

        this.textAreaObj.insertAtCursor(markdownString);
        if (this.textAreaObj.props.preview) {
            this.textAreaObj.props.preview();
        }

        var data = {
            title: this.itemTitle(),
            lat: this.lat(),
            lng: this.lng(),
            country: this.country()
        };

        var parent = this;
        this.geotag.save(data).then(function(value) {
                parent.hide();
                parent.textAreaObj.relationValue.geotags.push(value);
            },
            response => {
                this.loading = false;
                this.handleErrors(response);
            }
        );
    }

    getLocation(map_field) {
        if('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(function(position) {
                map_field.locationpicker('location', {latitude: position.coords.latitude, longitude: position.coords.longitude});
            })
        }
    }

    loadLocationPicker(element) {
        var parent = this;
        var map_field = $(element).find('.Map-field');
        map_field.locationpicker({
            location: {latitude: parent.lat(), longitude: parent.lng()},
            radius: 0,
            inputBinding: {
                locationNameInput: $(element).find('.Map-address-search'),
                latitudeInput: $(element).find('.Map-coordinates-lat'),
                longitudeInput: $(element).find('.Map-coordinates-lng')
            },
            enableAutocomplete: true,
            onchanged: function(currentLocation, isMarkerDropped) {
                parent.lat(currentLocation.latitude);
                parent.lng(currentLocation.longitude);
                var addressComponents = $(this).locationpicker('map').location.addressComponents;
                parent.country(addressComponents.country);
            }
        });

        $('#modal').on('shown.bs.modal', function () {
            map_field.locationpicker('autosize');
        });

        this.getLocation(map_field);
    }
}