var fs = require('fs');
var http = require('http');
var https = require('https');
var koa = require('koa');
var forceSSL = require('koa-force-ssl');
var Router = require('koa-router');
var titles_json = require('./titles.json');
console.log("requires have loaded"); //Node modules used in this application
var app = new koa();
var router = new Router(); //instantiation of Koa and Koa-Router
var useSSL = false; //defaults to non-SSL server

router
    .get('/', (ctx, next) => { //RESTful API endpoint is up
        ctx.body = [{
            "This Server": "Welcomes You."
        }, {
            "Available methods": ["/ - this endpoint", "/retrieve/ - 'get' for all data", "/retrieve/type/ - 'get' for filtering by Title Type", "/create/ - 'post' using a parameter named create with JSON payload", "/update/type/name - 'put' using a parameter named update with JSON payload with matching URL parameters type and name", "/delete/type/name - 'delete' using a parameter named delete to remove an element by matching URL parameters type and name"]
        }];
    })
    .get('/retrieve/', (ctx, next) => { //retrieve all data
        ctx.body = titles_json;
    })
    .get('/retrieve/:type', (ctx, next) => { //retrieve data by type 
        var filterType = ctx.params.type;

        if (typeChecker(filterType) === true) { //typeChecker becomes true only if type is feature, tv series, bonus, season or episode
            var filteredTypes = []; //holds the response to be sent 
            switch (filterType.toLowerCase()) {
                case "feature":
                case "tv series": //retrieve data by type (feature, tv series)
                    {
                        for (var key in titles_json) { //iterate through the titles JSON object
                            if (titles_json.hasOwnProperty(key)) {
                                var lowertitletype = titles_json[key].type;
                                if (lowertitletype.toLowerCase() == filterType.toLowerCase()) { //permit more matches by using lowercase 
                                    filteredTypes.push(titles_json[key]); //add the object to the response (will become the ctx.body)
                                }
                            }
                        }
                    }
                    break;
                case "bonus": //retrieve data by type (bonus)
                    {
                        for (var key in titles_json) {

                            if (titles_json.hasOwnProperty(key)) {
                                var lowertitletype = titles_json[key].type;
                                if (lowertitletype.toLowerCase() == "feature") { //bonuses are only attached to feature
                                    titles_json[key].bonuses.forEach(function (element) { //loop through all bonuses
                                        element.parentTitle = titles_json[key].name; //add feature name (parentTitle) to the bonus
                                        filteredTypes.push(element); //add the bonus to the response
                                        console.log(element); //take a look at the bonus to be returned 
                                    });
                                }
                            }
                        }
                    }
                    break;
                case "season":
                    {
                        for (var key in titles_json) {

                            if (titles_json.hasOwnProperty(key)) {
                                var lowertitletype = titles_json[key].type;
                                if (lowertitletype.toLowerCase() == "tv series") { //seasons are only attached to tv series
                                    titles_json[key].seasons.forEach(function (element) {
                                        element.parentTitle = titles_json[key].name;
                                        filteredTypes.push(element);
                                        console.log(element);
                                    });
                                }
                            }
                        }
                    }
                    break;
                case "episode":
                    {
                        for (var key in titles_json) {
                            if (titles_json.hasOwnProperty(key)) {
                                var lowertitletype = titles_json[key].type;
                                if (lowertitletype.toLowerCase() == "tv series") {
                                    titles_json[key].seasons.forEach(function (season) { //episodes are only attached to seasons
                                        season.episodes.forEach(function (episode) {
                                            episode.parentTitle = titles_json[key].name;
                                            episode.season = season.name;
                                            filteredTypes.push(episode);
                                            console.log(episode);
                                        });
                                    });
                                }
                            }
                        }
                    }
                    break;
                default:
                    {
                        // just dangling dead code...
                        //typeChecker becomes true only if type is feature, tv series, bonus, season or episode ; breaks in the cases prevent the default from being reached
                    }
            }
            ctx.body = filteredTypes;
            //console.log('retrieve_type! ' + ctx.params.type);
        } else {
            ctx.body = 'metadata type does not match schema ';
        }
    })
    .post('/create/', (ctx, next) => {
        //this will add metadata but does not check if the addition already exists in the data store
        var error_message = "";
        var safe = false; //safe to create is set to false

        if ((typeof (ctx.query.create) != undefined) && (ctx.query.create != null)) { //check that query parameter create was sent
            console.log(ctx.query.create); //let's see what came in
            var ctx_query_create = JSON.parse(ctx.query.create); //parse create            
            console.log(ctx_query_create);

            //check incoming type for Bonus, Feature or TV Series
            if (ctx_query_create) { //check if valid 
                safe = typeChecker(ctx_query_create.type.toLowerCase()); //we have good metadata type
                if ((ctx_query_create.type.toLowerCase() == "episode") || (ctx_query_create.type.toLowerCase() == "season")) {
                    error_message = "exclude episode and season "; //per requirement not creating episodes and seasons
                    safe = false;
                }
            }
        } else {
            error_message = "create parameter was not sent"; //query parameter create was not sent
        }

        //add metadata to titles_json
        if ((safe === true) && (ctx_query_create.type.toLowerCase() == "bonus")) { //if type is bonus 
            var parentTitle = (ctx_query_create.parentTitle || ""); //incoming data must include name of the feature
            if (parentTitle == "") {
                error_message = "parentTitle missing from create body "; //can't add to a feature that does not exist
                safe = false;
                ctx.body = {
                    "result": false,
                    "error_message": error_message
                };
            } else {
                for (var key in titles_json) {
                    if (titles_json.hasOwnProperty(key)) {
                        var lowertitletype = titles_json[key].type;
                        if (lowertitletype.toLowerCase() == "feature") {
                            var lowerelementname = titles_json[key].name;
                            if (lowerelementname.toLowerCase() == parentTitle.toLowerCase()) {
                                titles_json[key].bonuses.push(ctx_query_create);
                                console.log(titles_json[key].bonuses);
                            }
                            ctx.body = {
                                "result": true,
                                "create metadata": ctx_query_create
                            };
                        }
                    }
                }
            }
        } else if (safe === true) { //metadata type is feature or tv series
            titles_json.push(ctx_query_create); //adding a new metadata element
            //return success
            //ctx.body = 'successfully added ' ;
            ctx.body = {
                "result": true,
                "create metadata": ctx_query_create
            };
        } else {
            //return failure
            //ctx.body = 'could not add because of ' + error_message;
            console.log(error_message);
            ctx.body = {
                "result": false,
                "error_message": error_message
            };
        }
        //console.log(titles_json);//either shows added metadata or shows unchanged
    })
    .put('/update/:type/:name', (ctx, next) => { //update
        var error_message = "";
        var safe = false; //safe to update is set to false by default

        if ((typeof (ctx.query.update) != undefined) && (ctx.query.update != null)) {
            var ctx_query_update = JSON.parse(ctx.query.update);
            console.log(ctx_query_update);

            //check incoming type for Bonus, Feature or TV Series
            if (ctx_query_update) { //check if valid JSON
                console.log(ctx.query.update);
                safe = typeChecker(ctx_query_update.type.toLowerCase());
                if ((ctx_query_update.type.toLowerCase() == "episode") || (ctx_query_update.type.toLowerCase() == "season")) {
                    safe = false;
                    error_message = "exclude episode and season from update";
                }
            }
        } else {
            error_message = "update parameter was not sent";
        }

        if (safe === true) {
            var filterType = ctx.params.type;
            var name = ctx.params.name;
            var result = 'could not update ' + filterType + " " + name;

            if (typeChecker(filterType) === true) {
                switch (filterType.toLowerCase()) {
                    case "feature":
                    case "tv series":
                        {
                            for (var key in titles_json) {

                                if (titles_json.hasOwnProperty(key)) {
                                    var lowertitletype = titles_json[key].type;
                                    if (lowertitletype.toLowerCase() == filterType.toLowerCase()) {
                                        titles_json.forEach(function (element, index) {
                                            var lowerelementname = element.name;
                                            if (lowerelementname.toLowerCase() == name.toLowerCase()) {
                                                titles_json[index] = ctx_query_update;
                                                console.log(titles_json);
                                                result = 'updated ' + filterType + " " + name;
                                                return;
                                            }
                                            console.log(element);
                                        });
                                    }
                                }
                            }
                        }
                        break;
                    case "bonus":
                        {
                            for (var key in titles_json) {
                                if (titles_json.hasOwnProperty(key)) {
                                    var lowertitletype = titles_json[key].type;
                                    if (lowertitletype.toLowerCase() == "feature") {
                                        titles_json[key].bonuses.forEach(function (element, index) {
                                            var lowerelementname = element.name;
                                            if (lowerelementname.toLowerCase() == name.toLowerCase()) {
                                                titles_json[key].bonuses[index] = ctx_query_update;
                                                console.log(titles_json[key].bonuses);
                                                result = 'updated ' + filterType + " " + name;
                                                return;
                                            }
                                            console.log(element);
                                        });
                                    }
                                }
                            }
                        }
                        break;
                    default:
                        {
                            // only implementing feature, tv series and bonus
                        }
                }
            }
            ctx.body = {
                "result": true,
                "update metadata": ctx_query_update
            };
        } else {
            ctx.body = {
                "result": false,
                "error_message": error_message
            };
        }
    })
    .del('/delete/:type/:name', (ctx, next) => { //delete
        var filterType = ctx.params.type;
        var name = ctx.params.name;
        var error_message = "";

        if (typeChecker(filterType) === true) {
            switch (filterType.toLowerCase()) {
                case "feature":
                case "tv series":
                    {
                        for (var key in titles_json) {

                            if (titles_json.hasOwnProperty(key)) {
                                var lowertitletype = titles_json[key].type;
                                if (lowertitletype.toLowerCase() == filterType.toLowerCase()) {
                                    titles_json.forEach(function (element, index) {
                                        var lowerelementname = element.name;
                                        if (lowerelementname.toLowerCase() == name.toLowerCase()) {
                                            titles_json.splice(index, 1); //remove the matching feature or tv series from the data store
                                            console.log(titles_json);
                                            return;
                                        }
                                        console.log(element);
                                    });
                                }
                            }
                        }
                    }
                    break;
                case "bonus":
                    {
                        for (var key in titles_json) {

                            if (titles_json.hasOwnProperty(key)) {
                                var lowertitletype = titles_json[key].type;
                                if (lowertitletype.toLowerCase() == "feature") {
                                    titles_json[key].bonuses.forEach(function (element, index) {
                                        var lowerelementname = element.name;
                                        if (lowerelementname.toLowerCase() == name.toLowerCase()) {
                                            titles_json[key].bonuses.splice(index, 1); //remove the matching bonus from the array
                                            console.log(titles_json[key].bonuses);
                                            return;
                                        }
                                        console.log(element);
                                    });
                                }
                            }
                        }
                    }
                    break;
                default:
                    {
                        // only implementing feature, tv series and bonus
                    }
            }
            ctx.body = {
                "result": true,
                "deleted metadata of": filterType + " " + name
            };
        } else {
            ctx.body = {
                "result": false,
                "error_message": error_message
            };
        }

    });
console.log("routes have been setup");

app
    .use(router.routes()) //routes defined above
    .use(router.allowedMethods()); //default allowed methods from koa-router
console.log("Koa app has been setup");

http.createServer(app.callback()).listen(8080); // start the http server on port 8080
console.log("HTTP server has started");

function typeChecker(type) {
    var validity = false; //defaults to not passing
    switch (type.toLowerCase()) {
        case "feature":
            {
                validity = true;
            }
            break;
        case "tv series":
            {
                validity = true;
            }
            break;
        case "bonus":
            {
                validity = true;
            }
            break;
        case "episode":
            {
                validity = true;
            }
            break;
        case "season":
            {
                validity = true;
            }
            break;
        default:
            {
                console.log("'" + type + "' is an incorrect metadata type "); //validity defaults to false; error_message = "Incorrect metadata type ";
            }
    }
    return validity; //if type matched one of the above then true is sent
}

if (useSSL) { // TLS/SSL configuration; useSSL is set to false 
    var ssloptions = {
        key: fs.readFileSync('/etc/letsencrypt/live/midivr.com/privkey.pem', 'utf8'),
        cert: fs.readFileSync('/etc/letsencrypt/live/midivr.com/fullchain.pem', 'utf8')
    }
    https.createServer(ssloptions, app.callback()).listen(4443); // start the https server on port 4443
}