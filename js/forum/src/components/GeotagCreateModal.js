import app from 'flarum/app';
import Modal from 'flarum/components/Modal';
import FieldSet from 'flarum/components/FieldSet';
import Button from 'flarum/components/Button';

export default class GeotagCreateModal extends Modal {
    init() {
        this.textAreaObj = this.props.textAreaObj;
        this.loading = false;
        this.mapField = null;

        this.geotagData = {
            title: m.prop(app.translator.trans('avatar4eg-geotags.forum.create_modal.default_title')[0]),
            lat: m.prop(59.950179),
            lng: m.prop(30.316147),
            country: m.prop('RU')
        };

        this.geotag = app.store.createRecord('geotags');
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
                    m('form', {onsubmit: this.onsubmit.bind(this), config: this.loadLocationPicker.bind(this)}, [
                        m('div', {className: 'Form-group'}, [
                            m('label', {}, app.translator.trans('avatar4eg-geotags.forum.create_modal.title_label')),
                            m('input', {
                                className: 'FormControl Map-title',
                                value: this.geotagData.title(),
                                oninput: m.withAttr('value', this.geotagData.title)
                            }),
                        ]),
                        m('div', {className: 'Form-group'}, [
                            m('label', {}, app.translator.trans('avatar4eg-geotags.forum.create_modal.address_label')),
                            m('input', {
                                className: 'FormControl Map-address-search'
                            }),
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
                        FieldSet.component({
                            className: 'Buttons',
                            children: [
                                Button.component({
                                    type: 'submit',
                                    className: 'Button Button--primary',
                                    children: app.translator.trans('avatar4eg-geotags.forum.create_modal.save_button'),
                                    loading: this.loading,
                                    disabled: this.geotagData.title() === '' || this.geotagData.title() === null
                                }),
                                Button.component({
                                    className: 'Button Map-address-locate',
                                    icon: 'map-marker',
                                    children: app.translator.trans('avatar4eg-geotags.forum.create_modal.locate_button'),
                                    onclick: this.getLocation.bind(this)
                                }),
                            ]
                        }),
                    ])
                ])
            ])
        ]
    }

    onsubmit(e) {
        e.preventDefault();
        if (this.loading) return;
        this.loading = true;

        let markdownString = '**' + this.geotagData.title() + '**';

        this.textAreaObj.insertAtCursor(markdownString);
        if (this.textAreaObj.props.preview) {
            this.textAreaObj.props.preview();
        }

        this.geotag.pushAttributes({
            title: this.geotagData.title(),
            lat: this.geotagData.lat(),
            lng: this.geotagData.lng(),
            country: this.geotagData.country()
        });
        this.textAreaObj.geotags.push(this.geotag);
        this.loading = false;
        this.hide();
    }

    getLocation() {
        let parent = this;
        if('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(function(position) {
                parent.mapField.locationpicker('location', {latitude: position.coords.latitude, longitude: position.coords.longitude});
                parent.geotagData.lat(position.coords.latitude);
                parent.geotagData.lng(position.coords.longitude);
                let addressComponents = parent.mapField.locationpicker('map').location.addressComponents;
                parent.geotagData.country(addressComponents.country);
            })
        }
    }

    loadLocationPicker(element) {
        let parent = this;
        parent.mapField = $(element).find('.Map-field');
        parent.mapField.locationpicker({
            location: {latitude: parent.geotagData.lat(), longitude: parent.geotagData.lng()},
            radius: 0,
            inputBinding: {
                locationNameInput: $(element).find('.Map-address-search'),
                latitudeInput: $(element).find('.Map-coordinates-lat'),
                longitudeInput: $(element).find('.Map-coordinates-lng')
            },
            enableAutocomplete: true,
            onchanged: function (currentLocation, isMarkerDropped) {
                parent.geotagData.lat(currentLocation.latitude);
                parent.geotagData.lng(currentLocation.longitude);
                let addressComponents = $(this).locationpicker('map').location.addressComponents;
                parent.geotagData.country(addressComponents.country);
            }
        });

        $('#modal').on('shown.bs.modal', function () {
            parent.mapField.locationpicker('autosize');
        });
    }
}