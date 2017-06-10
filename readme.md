# Geotags by Avatar4eg

A [Flarum](http://flarum.org) extension that adds places for your posts (with editor button, list of places on each post and markdown string with name of place in text).
Uses [Logicify JQuery Location Picker plugin](https://github.com/Logicify/jquery-locationpicker-plugin).

### Screenshots

Editor button:  
![Imgur](https://i.imgur.com/4qruHNn.png)  
Creation modal:  
![Imgur](https://i.imgur.com/0wCkNcl.png)  
Result of creation in text editor:  
![Imgur](https://i.imgur.com/iE2icvn.png)  
...and in post:  
![Imgur](https://i.imgur.com/8duv1iQ.png)  
...and after clicking on it:  
![Imgur](https://i.imgur.com/548kmnW.png)  

### Goals

- Allow users mention places and show them on map.

### Installation

```bash
composer require avatar4eg/flarum-ext-geotags
```

### Configuration

- [Create](https://console.developers.google.com/) Google Maps API-key.
- Enable Google Maps JavaScript API, Google Places API Web Service and Google Maps Geocoding API for full functionality.
- Add your domain to accepted list.
- Open settings modal of the extension in your admin panel and save Google API-key.

## End-user usage

During post creation (or post editing or discussion creating) click the "Edit places" button. In creation modal drag marker (or search in "Address" field or enter coordinates) and save new location.

### Links

- [on github](https://github.com/avatar4eg/flarum-ext-geotags)
- [on packagist](https://packagist.com/packages/avatar4eg/flarum-ext-geotags)
- [issues](https://github.com/avatar4eg/flarum-ext-geotags/issues)
