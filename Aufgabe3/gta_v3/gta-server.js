/**
 * Template für Übungsaufgabe VS1lab/Aufgabe3
 * Das Skript soll die Serverseite der gegebenen Client Komponenten im
 * Verzeichnisbaum implementieren. Dazu müssen die TODOs erledigt werden.
 */

/**
 * Definiere Modul Abhängigkeiten und erzeuge Express app.
 */

var http = require('http');
//var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var express = require('express');

var app;
app = express();
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));

// Setze ejs als View Engine
app.set('view engine', 'ejs');

/**
 * Konfiguriere den Pfad für statische Dateien.
 * Teste das Ergebnis im Browser unter 'http://localhost:3000/'.
 */
app.use("/", express.static("public"));

/**
 * Konstruktor für GeoTag Objekte.
 * GeoTag Objekte sollen min. alle Felder des 'tag-form' Formulars aufnehmen.
 */

function GeoTagObj(name, latitude, longitude, hash) {
    this.name = name;
    this.latitude = latitude;
    this.longitude = longitude;
    this.hashtag = hash;
}

/**
 * Modul für 'In-Memory'-Speicherung von GeoTags mit folgenden Komponenten:
 * - Array als Speicher für Geo Tags.
 * - Funktion zur Suche von Geo Tags in einem Radius um eine Koordinate.
 * - Funktion zur Suche von Geo Tags nach Suchbegriff.
 * - Funktion zum hinzufügen eines Geo Tags.
 * - Funktion zum Löschen eines Geo Tags.
 */

var TagsManager = (function TagsManager() {

    let taglist = []; // Array of all Tags


    let searchByRadius = function (center, r) {
        let results = [];

        for (let i = 0; i < taglist.length; i++) {
            let dx = taglist[i].latitude - center.latitude;
            let dy = taglist[i].longitude - center.longitude;
            if (dx * dx + dy * dy < r * r) {
                results.push(taglist[i]);
            }
        }
        return results;
    };

    let searchByName = function (name) {
        let results = [];
        name = name.toLowerCase();

        for (let i = 0; i < taglist.length; i++) {
            if (taglist[i].name.toLowerCase() === name || taglist[i].hashtag.toLowerCase() === name) {
                results.push(taglist[i]);
            }
        }
        return results;
    };

    let add = function (tag) {
        taglist.push(tag);
    };

    let remove = function (tagToRemove) {
        let index = taglist.indexOf(tagToRemove);
        if (index > -1) {
            taglist.splice(index, 1);
        }
    };

    publicMember = {
        taglist, add, searchByName, searchByRadius, remove
    }
    return publicMember;
})();
/**
 * Route mit Pfad '/' für HTTP 'GET' Requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests enthalten keine Parameter
 *
 * Als Response wird das ejs-Template ohne Geo Tag Objekte gerendert.
 */

app.get('/', function (req, res) {
    res.render('gta', {
        taglist: TagsManager.taglist
    });
});

/**
 * Route mit Pfad '/tagging' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'tag-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Mit den Formulardaten wird ein neuer Geo Tag erstellt und gespeichert.
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 */

app.post('/tagging', function (req, res) {

    let newTag = new GeoTagObj(req.body.name, req.body.latitude, req.body.longitude, req.body.hashtag);
    TagsManager.add(newTag);

    res.render('gta', {
        taglist : TagsManager.taglist
    });
});


/**
 * Route mit Pfad '/discovery' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'filter-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 * Falls 'term' vorhanden ist, wird nach Suchwort gefiltert.
 */

app.post('/discovery', function (req, res) {

    let newTag = new GeoTagObj(req.body.name, req.body.latitude, req.body.longitude, req.body.hashtag);

    res.render('gta', {
        taglist: []
    });
});

/**
 * Setze Port und speichere in Express.
 */

var port = 3000;
app.set('port', port);

/**
 * Erstelle HTTP Server
 */

var server = http.createServer(app);

/**
 * Horche auf dem Port an allen Netzwerk-Interfaces
 */

server.listen(port);
