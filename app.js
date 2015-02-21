/* Constants */
var APP_NAME = 'bieber';


var sql = require('sqlite3');
var fs  = require('fs');
var db;

function createDB(){
    var db = new sql.Database('.bieber', function(err, ev){
        if(!err) console.log("Successfully initialized empty .bieber file");
    });
    db.run("CREATE TABLE ref(id INTEGER PRIMARY KEY ASC," + 
                            "name TEXT," + 
                            "url TEXT," +
                            "desc TEXT)");
    return db;
}

function usage() {
    console.log("\t%s init [project name]", APP_NAME);
}

function parseCommand(line) {
    if(line[1] == 'init'){
        createDB();
    } else {
        console.log("No command specified!");
        console.log("Usage:");
        usage();
    }
}

parseCommand(process.argv.slice(1));


