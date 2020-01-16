const manifestPath = './manifest.json';
const AdmZip = require('adm-zip');
const fs = require('fs');
const manifest = require(manifestPath);
const semver = require('semver');
const _ = require('lodash');
const filesToCopy = [];
const path = require('path');

function map(data){
    if(data.length !== undefined){
        return data.map(traverse)
    }

    return _.mapValues(data, traverse)
}

function traverse(obj){
    if(typeof obj !== 'object'){
        if(obj.indexOf){
            const isFile = fileTypes.some(fileType => obj.indexOf(fileType) > -1);

            if(isFile){
                filesToCopy.push(obj);
            }
        }

        return obj
    } else {
        return map(obj)
    }
}

const versionInc = process.env.version || 'patch';
const newVersion = semver.inc(manifest.version, versionInc);

const fileTypes = [
    'js',
    'html',
    'png',
    'svg',
    'woff2'
];


map(manifest);
const newManifest = JSON.stringify({
    ...manifest,
    version: newVersion
}, null,'\t');

const zip = new AdmZip();
zip.addFile(manifestPath, Buffer.alloc(newManifest.length, newManifest));
filesToCopy.forEach(filePath => {
    zip.addLocalFile(__dirname + '/' + filePath, path.dirname(filePath), path.basename(filePath));
});
zip.writeZip(`./product/profiler-[${newVersion}].zip`);
fs.writeFileSync(manifestPath, newManifest, 'binary');
