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
    //TODO: add timestamp
    db.run("CREATE TABLE ref(id INTEGER PRIMARY KEY ASC," + 
                            "name TEXT," + 
                            "url TEXT," +
                            "desc TEXT)");
    return db;
}

function usage() {
    console.log("\t%s init [project name]", APP_NAME);
    console.log("\t%s add [name] [url]", APP_NAME);
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
    db.all("SELECT name, url, desc FROM ref", function(err, result){
        if(err) console.log(err);
        result.forEach(function(obj) {
            if(format == '-b'){
                bibtexify(obj);
            } else {
                //TODO: pretty-printing
                console.log(obj);
            }
        });
    });
}

function bibtexify(obj){
    var string = "@misc{%s,\n" + 
        "\ttitle = {%s},\n" + 
        "\thowpublished = {\\url{%s}},\n" + 
        "\tnote = {Accessed: %d-%d-%d}\n}";
    console.log(string, obj.name, obj.name, obj.url, 2012, 10, 10);
}

function addRecord(name, url){
    console.log("Would you like to add a description now?");
    prompt.get([{
        name: 'answer',
        description: 'y/n',
        type: 'string'
    }], function(err, res){
        if(res.answer == 'y'){
            prompt.get(['description'], function(err, res){
                insertRecord(name, url, res.description);    
            });
            return;
        }
        insertRecord(name, url, "");    
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
    } else if(line[0] == 'list' || line[0] == 'ls'){
        withDb(listRecords, line.slice(1));
    } else {
        console.log("No command specified!");
        console.log("Usage:");
        usage();
    }
}

parseCommand(process.argv.slice(2));


