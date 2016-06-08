var gulp = require('flarum-gulp');

gulp({
    files: [
        'bower_components/jquery-locationpicker-plugin/dist/locationpicker.jquery.js'
    ],
    modules: {
        'avatar4eg/geotags': [
            '../lib/**/*.js',
            'src/**/*.js'
        ]
    }
});
