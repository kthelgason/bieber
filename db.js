/*
 * db.js
 * node module wrapping the sqlite database.
 */

var sql = require('sqlite3');
var fs  = require('fs');

var db;

function _ensure_db(){
    if(!db){
        db = new sql.Database('.bieber', sql.OPEN_READWRITE, function(err){
            if(err){
                return err;
            }
        });
    }
    return null;
}

exports.create_db = function(callback){
    fs.exists('.bieber', function(exists){
        if(!exists){
            db = new sql.Database('.bieber', function(err){
                if(!err){
                    callback(null);
                }
            });
            db.run("CREATE TABLE ref(id INTEGER PRIMARY KEY ASC," + 
                                    "name TEXT," + 
                                    "url TEXT," +
                                    "desc TEXT," +
                                    "type TEXT," +
                                    "accessed TEXT)");
        } else {
            var error = new Error("There is already a .bieber file in this directory");
            callback(error);
        }
    });
};

exports.fetch_all = function(callback){
    var err = _ensure_db();
    if(err){
        callback(err, null);
    }
    db.all("SELECT id, name, url, type, desc, accessed FROM ref", function(err, result){
        if(err) {
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
};

exports.fetch_by_id = function(id, callback){
    var err = _ensure_db();
    if(err){
        callback(err, null);
    }
    db.get("SELECT * FROM ref WHERE id = ?", id, function(err, result){
        if(err) {
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
};

exports.insert = function(record, callback){
    var err = _ensure_db();
    if(err){
        callback(err, null);
    }
    db.run("INSERT INTO ref(name, url, desc, type, accessed) " +
            "VALUES(?, ?, ?, ?, (SELECT date('now')))", record, function(err){
       if(err) {
           callback(err);
       } else {
           callback(null);
       }
    });
};

exports.remove_by_id = function(id, callback){
    var err = _ensure_db();
    if(err){
        callback(err);
        return;
    }
    this.fetch_by_id(id, function(err, res){
        if(err) {
            callback(err);
        } else {
            if(res){
                db.run("DELETE FROM ref WHERE id = ?", id, function(err){
                    if(err) {
                        callback(err);
                    } else {
                        callback(null);
                    }
                });
            } else {
                err = new Error("No such entry exists.");
                callback(err);
            }
        }
    });
};

