/* Constants */
var APP_NAME = 'bieber';


var sql = require('sqlite3');
var fs  = require('fs');
var prompt = require('prompt');
prompt.message = ">>>".magenta;
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
    console.log("\t%s add [name] [url]", APP_NAME);
}

function withDb(fn, args){
    if(!db){
        db = new sql.Database('.bieber', sql.OPEN_READWRITE, function(err,res){
            if(err){
                console.log("Project not initialized.");
                console.log("Run \"%s init [name]\" to get started.", APP_NAME);
            } else {
                fn.apply(null,args);
            }
        });
    } else {
        fn.apply(null,args);
    }
}

function addRecord(vals){
    console.log("Would you like to add a description now?");
    prompt.get([{
        name: 'answer',
        description: 'y/n',
        type: 'string'
    }], function(err, res){
        if(res.answer == 'y'){
            prompt.get(['description'], function(err, res){
                insertRecord(vals[0],vals[1], res.description);    
            });
            return;
        }
        insertRecord(vals[0],vals[1], "");    
    });
}

function insertRecord(name, url, desc){
    db.run("INSERT INTO ref(name, url, desc)  VALUES(?, ?, ?)",
            [name, url, desc], function(err, res){
       if(err) { console.log(err); }
       else {
           console.log("Success!");
       }
    });
}

function parseCommand(line) {
    if(line[0] == 'init'){
        createDB();
    } else if(line[0] == 'add'){
        withDb(addRecord, line.slice(1));
    } else {
        console.log("No command specified!");
        console.log("Usage:");
        usage();
    }
}

parseCommand(process.argv.slice(2));


