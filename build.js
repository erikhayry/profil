var fs = require('fs');
var _ = require('lodash');

function map(data){
    if(data.length !== undefined){
        return data.map(traverse)
    }

    return _.mapValues(data, traverse)
}

function traverse(obj){
    if(typeof obj !== 'object'){
        if(obj.indexOf && obj.indexOf('node_modules') > -1){
            let oldPath = obj;
            obj =  '/dist/' + obj.replace(/\//g, '');
            fs.copyFileSync(__dirname + oldPath, __dirname + obj);
        }

        return obj
    } else {
        return map(obj)
    }
}


fs.readFile('.manifest.json' , "utf8", function(err, d) {
    var data = JSON.parse(d);

    fs.writeFileSync('manifest.json', JSON.stringify(map(data), null,'\t'))
});