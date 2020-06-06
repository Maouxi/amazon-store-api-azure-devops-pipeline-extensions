"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tl = require("azure-pipelines-task-lib/task");
const fs = require("fs");
var endpoint = "https://developer.amazon.com/api/appstore/v1/applications";
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('== Start replace apk == ');
        var token = tl.getVariable("AmazonAppStorePrepareTask.AmazonAccessToken");
        var editId = tl.getVariable("AmazonAppStorePrepareTask.AmazonEditId");
        if (token == undefined || editId == undefined) {
            tl.setResult(tl.TaskResult.Failed, `You need to use the 'prepare' task first`);
            return;
        }
        const appId = tl.getInput('appId', true);
        if (appId == undefined) {
            tl.setResult(tl.TaskResult.Failed, 'AppId is required');
            return;
        }
        const apkFilePath = tl.getPathInput('apkFilePath', true);
        if (apkFilePath == undefined) {
            tl.setResult(tl.TaskResult.Failed, 'Apk file path is required');
            return;
        }
        try {
            //Get the lastest apk id
            console.log(`Get latest apk id for editId: ${editId}`);
            var apkId = getLatestApkId(appId, editId, token);
            // //Get etag for current apk
            console.log(`Get an etag for apk id: ${apkId}`);
            var etag = getApkEtag(appId, editId, apkId, token);
            //Update the current edit with a new apk
            console.log(`Start upload apk with id ${apkId} and etag ${etag} from file: ${apkFilePath}`);
            replaceApk(appId, editId, apkId, apkFilePath, etag, token);
            //End update
            tl.setResult(tl.TaskResult.Succeeded, `Successfully update app ${editId}`);
        }
        catch (err) {
            console.log(`Error: ${err}`);
            tl.setResult(tl.TaskResult.Failed, err.message);
        }
    });
}
function getLatestApkId(appId, editId, token) {
    var request = require('sync-request');
    var options = { 'headers': { 'Authorization': `bearer ${token}`, "accept": "application/json" } };
    var res = request('GET', `${endpoint}/${appId}/edits/${editId}/apks`, options);
    if (res.statusCode == 200) {
        var obj = JSON.parse(res.getBody().toString());
        console.log(`Retrieve apk list success. Apk count: ${obj.length}. Latest apk id: ${obj[0].id}`);
        return obj[0].id;
    }
    else {
        throw `Retrieve apk list fail. Code: ${res.statusCode}. Resp: ^${res.getBody()}`;
    }
}
function getApkEtag(appId, editId, apkId, token) {
    var request = require('sync-request');
    var options = { 'headers': { 'Authorization': `bearer ${token}`, "accept": "application/json" } };
    var res = request('GET', `${endpoint}/${appId}/edits/${editId}/apks/${apkId}`, options);
    if (res.statusCode == 200) {
        console.log(`Retrieve apk etag success`);
        return res.headers.etag;
    }
    else {
        throw `Retrieve apk etag fail. Code: ${res.statusCode}. Resp: ^${res.getBody()}`;
    }
}
function replaceApk(appId, editId, apkId, apkFilePath, etag, token) {
    var _a, _b, _c;
    var request = require('sync-request');
    var fileBuffer = fs.readFileSync(apkFilePath);
    var options = {
        'headers': {
            'Authorization': `bearer ${token}`,
            'Content-Type': 'application/vnd.android.package-archive',
            'Content-Length': fileBuffer.length,
            'If-Match': etag,
            'fileName': (_c = (_b = (_a = apkFilePath.split('\\')) === null || _a === void 0 ? void 0 : _a.pop()) === null || _b === void 0 ? void 0 : _b.split('/').pop()) === null || _c === void 0 ? void 0 : _c.toString()
        },
        'body': fileBuffer
    };
    var res = request('PUT', `${endpoint}/${appId}/edits/${editId}/apks/${apkId}/replace`, options);
    if (res.statusCode == 200) {
        console.log(`Replace apk success`);
    }
    else {
        throw `Replace apk fail. Code: ${res.statusCode}. Resp: ^${res.getBody()}`;
    }
}
run();
