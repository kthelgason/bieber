#!/usr/local/bin/node
/* Constants */
var APP_NAME = 'bieber';
var SUPPORTED_TYPES = ['online', 'journal'];


var sql = require('sqlite3');
var fs  = require('fs');
var prompt = require('prompt');
prompt.message = ">>>".magenta;

var table = require('cli-table');
var db;

var bibtexify = {
    online: function(obj){
        var string = "@misc{%s,\n" + 
            "\ttitle = {%s},\n" + 
            "\thowpublished = {\\url{%s}},\n" + 
            "\tnote = {Accessed: %s}\n}";
        console.log(string, obj.name, obj.name, obj.url, obj.accessed);
    },
    journal: function(obj){
        //Required fields: author, title, journal, year, volume
        var string = "@article{%s,\n" + 
            "\ttitle = {%s},\n" + 
            "\tauthor = {TODO},\n" + 
            "\tjournal = {TODO},\n" + 
            "\tyear = {TODO},\n" + 
            "\tvolume = {TODO},\n}";
        console.log(string, obj.name, obj.name);
     }
};


function createDB(){
    fs.exists('.bieber', function(exists){
        if(!exists){
            db = new sql.Database('.bieber', function(err, ev){
                if(!err) console.log("Successfully initialized empty .bieber file");
            });
            db.run("CREATE TABLE ref(id INTEGER PRIMARY KEY ASC," + 
                                    "name TEXT," + 
                                    "url TEXT," +
                                    "desc TEXT," +
                                    "type TEXT," +
                                    "accessed TEXT)");
        } else {
            console.log("There appears to be a .bieber file in this directory already.");
        }
    });
}

function usage() {
    console.log("\t%s init [project name]", APP_NAME);
    console.log("\t%s add [name] [url] --type [TYPE]", APP_NAME);
    console.log("\t%s list [-b]", APP_NAME);
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

function listRecords(format){
    db.all("SELECT id, name, url, type, desc, accessed FROM ref", function(err, result){
        if(err) {
            console.error(err);
            return;
        }
        var tab = new table({
            head: ['ID', 'Name', 'URL', 'Description'],
            colWidths: [8, 30, 30, 40]
        });
        result.forEach(function(obj) {
            if(format == '-b'){
                bibtexify[obj.type](obj);
            } else {
                tab.push([obj.id, obj.name, obj.url, obj.desc]);
            }
        });
        if(format != '-b'){
            console.log(tab.toString());
        }
    });
}

function addRecord(name, url){
    //TODO: Add flag to skip prompting for description.
    var type = 'online';
    if(arguments[2] === '--type'){
        if(SUPPORTED_TYPES.indexOf(arguments[3]) >= 0){
            type = arguments[3];
        } else {
            console.error('Unsupported reference type ' + type + '. Supported types are:');
            console.error(SUPPORTED_TYPES);
            return;
        }
    }
    console.log("Would you like to add a description now?");
    prompt.get([{
        name: 'answer',
        description: 'y/n',
        type: 'string'
    }], function(err, res){
        if(res.answer == 'y'){
            prompt.get(['description'], function(err, res){
                insertRecord(name, url, type, res.description);    
            });
            return;
        }
        insertRecord(name, url, type, "");    
    });
}

function deleteRecord(id){
    db.get("SELECT * FROM ref WHERE id = ?", id, function(err, res){
        if(err) {
            console.error(err);
        } else {
            if(res){
                db.run("DELETE FROM ref WHERE id = ?", id, function(err, res){
                    if(err)
                        console.error(err);
                    else {
                        console.log("Successfully removed item %d", id);
                    }
                });
            } else {
                console.log("No such entry!");
            }
        }
    });
}

function insertRecord(name, url, type, desc){
    db.run("INSERT INTO ref(name, url, desc, type, accessed) " +
            "VALUES(?, ?, ?, ?, (SELECT date('now')))",
            [name, url, desc, type], function(err, res){
       if(err) { console.error(err); }
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
    } else if(line[0] == 'list' || line[0] == 'ls'){
        withDb(listRecords, line.slice(1));
    } else if(line[0] == 'remove' || line[0] == 'rm'){
        withDb(deleteRecord, line.slice(1));
    } else {
        console.log("No command specified!");
        console.log("Usage:");
        usage();
    }
}

parseCommand(process.argv.slice(2));


