#!/usr/local/bin/node
/* Constants */
var APP_NAME = 'bieber';
var SUPPORTED_TYPES = ['online', 'journal'];


var prompt = require('prompt');
prompt.message = ">>>".magenta;

var table = require('cli-table');
var db = require('./db');

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
    db.create_db(function(error){
        if(error){
            console.error(error);
        } else {
            console.log("Successfully initialized .bieber repository.");
        }
    });
}

function usage() {
    console.log("\t%s init [project name]", APP_NAME);
    console.log("\t%s add [name] [url] --type [TYPE]", APP_NAME);
    console.log("\t%s list [-b]", APP_NAME);
}

function listRecords(format){
    db.fetch_all(function(err, result){
        if(err) {
            console.error(err);
            return;
        }
        var tab = new table({
            head: ['ID', 'Name', 'URL', 'Description'],
            colWidths: [8, 30, 30, 40]
        });
        result.forEach(function(obj) {
            if(format === '-b'){
                bibtexify[obj.type](obj);
            } else {
                tab.push([obj.id, obj.name, obj.url, obj.desc]);
            }
        });
        if(format !== '-b'){
            console.log(tab.toString());
        }
    });
}

function insertRecord(name, url, type, desc){
    db.insert( [name, url, desc, type], function(err){
       if(err){
           console.error(err);
       } else {
           console.log("Success!");
       }
    });
}

function addRecord(name, url){
    //FIXME: Add flag to skip prompting for description.
    //FIXME: Also actually fix to make less terribad.
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
        if(err) {
            console.error(err);
        }
        if(res.answer === 'y'){
            prompt.get(['description'], function(err, res){
                if(err) {
                    console.error(err);
                }
                insertRecord(name, url, type, res.description);    
            });
            return;
        }
        insertRecord(name, url, type, "");    
    });
}

function deleteRecord(id){
    db.remove_by_id(id, function(err){
        if(err) {
            console.error(err);
        } else {
            console.log("Successfully removed item %d", id);
        }
    });
}

function parseCommand(line) {
    if(line[0] === 'init'){
        createDB();
    } else if(line[0] === 'add'){
        addRecord(line.slice(1));
    } else if(line[0] === 'list' || line[0] === 'ls'){
        listRecords(line.slice(1));
    } else if(line[0] === 'remove' || line[0] === 'rm'){
        deleteRecord(line.slice(1));
    } else {
        console.log("No command specified!");
        console.log("Usage:");
        usage();
    }
}

parseCommand(process.argv.slice(2));


