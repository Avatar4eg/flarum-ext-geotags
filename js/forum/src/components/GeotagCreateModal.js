import app from 'flarum/app';
import Modal from 'flarum/components/Modal';
import FieldSet from 'flarum/components/FieldSet';
import Button from 'flarum/components/Button';

export default class GeotagCreateModal extends Modal {
    init() {
        this.textAreaObj = this.props.textAreaObj;
        this.loading = false;

        this.geotag = app.store.createRecord('geotags');

        this.geotagData = {
            title: m.prop(app.translator.trans('avatar4eg-geotags.forum.create_modal.default_title')[0]),
            lat: m.prop(59.950179),
            lng: m.prop(30.316147),
            country: m.prop('RU')
        };
    }

    className() {
        return 'GeotagCreateModal Modal--large';
    }

    title() {
        const title = this.geotagData.title();
        return title ? title : app.translator.trans('avatar4eg-geotags.forum.create_modal.default_title');
    }

    content() {
        return [
            m('div', {className: 'Modal-body'}, [
                m('div', {className: 'map-form-container'}, [
                    m('form', {onsubmit: this.onsubmit.bind(this), config:this.loadLocationPicker.bind(this) }, [
                        m('div', {className: 'Form-group'}, [
                            m('label', {}, app.translator.trans('avatar4eg-geotags.forum.create_modal.title_label')),
                            m('input', {
                                className: 'FormControl Map-address-title',
                                value: this.geotagData.title(),
                                oninput: m.withAttr('value', this.geotagData.title)
                            }),
                        ]),
                        m('div', {className: 'Form-group'}, [
                            m('label', {}, app.translator.trans('avatar4eg-geotags.forum.create_modal.address_label')),
                            m('input', {
                                className: 'FormControl Map-address-search'
                            })
                        ]),
                        m('div', {className: 'Map-field', style: {'width': '100%', 'height': '400px', 'margin-bottom': '20px'}}),
                        FieldSet.component({
                            className: 'Map-coordinates',
                            label: app.translator.trans('avatar4eg-geotags.forum.create_modal.coordinates_label') + ':',
                            children: [
                                m('div', {className: 'Form-group'}, [
                                    m('label', {}, app.translator.trans('avatar4eg-geotags.forum.create_modal.latitude_label')),
                                    m('input', {
                                        className: 'FormControl Map-coordinates-lat'
                                    })
                                ]),
                                m('div', {className: 'Form-group'}, [
                                    m('label', {}, app.translator.trans('avatar4eg-geotags.forum.create_modal.longitude_label')),
                                    m('input', {
                                        className: 'FormControl Map-coordinates-lng'
                                    })
                                ]),
                            ]
                        }),
                        Button.component({
                            type: 'submit',
                            className: 'Button Button--primary',
                            children: app.translator.trans('avatar4eg-geotags.forum.create_modal.save_button'),
                            loading: this.loading,
                            disabled: this.geotagData.title() === ''
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

        var markdownString = '**' + this.geotagData.title() + '**';

        this.textAreaObj.insertAtCursor(markdownString);
        if (this.textAreaObj.props.preview) {
            this.textAreaObj.props.preview();
        }

        var parent = this;
        this.geotag.save(this.geotagData).then(function(value) {
                parent.hide();
                parent.textAreaObj.relationValue.geotags.push(value);
            },
            response => {
                parent.loading = false
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
            location: {latitude: parent.geotagData.lat(), longitude: parent.geotagData.lng()},
            radius: 0,
            inputBinding: {
                locationNameInput: $(element).find('.Map-address-search'),
                latitudeInput: $(element).find('.Map-coordinates-lat'),
                longitudeInput: $(element).find('.Map-coordinates-lng')
            },
            enableAutocomplete: true,
            onchanged: function(currentLocation, isMarkerDropped) {
                parent.geotagData.lat(currentLocation.latitude);
                parent.geotagData.lng(currentLocation.longitude);
                var addressComponents = $(this).locationpicker('map').location.addressComponents;
                parent.geotagData.country(addressComponents.country);
            }
        });

        $('#modal').on('shown.bs.modal', function () {
            map_field.locationpicker('autosize');
        });

        this.getLocation(map_field);
    }
}