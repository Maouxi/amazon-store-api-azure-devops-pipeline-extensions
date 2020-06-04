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
var endpoint = "https://developer.amazon.com/api/appstore/v1/applications";
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Start create or edit');
        var token = "Atc|MQEBIMpQ50I_d9jeJ_viBKfq2yBE6IwnMDqgcGHCYbuKtWRYpAHtcWeDSHmD48yQtSbuU-O8f3mcgFutDyTzgkXxYBB5rw02tzTraB1oCi8iTsYfASNoY69Pl8PA-7VrI4Z79GeJDrH51JAL_2jIP1xCVaNEuEOSUzCx3HdAWpytafCpSzy8uk5v0X2iuTzJZZN8hLF25wKpbulndPBYqUVDxRit-hi0EfAEb7h0LyiXit9XSIKsJiDOvT2fBUG2Tlh2Ifk9GNqTLczYzIICOa42C1qZqEsS3ZK585rMPa7pcztLUA";
        //var token = tl.getVariable("AmazonAuthTask.AmazonAuthToken");
        if (token == undefined) {
            tl.setResult(tl.TaskResult.Failed, `You need to use the Auth task first to get a valid access_token`);
            return;
        }
        const appId = tl.getInput('appId', true);
        if (appId == undefined) {
            tl.setResult(tl.TaskResult.Failed, 'AppId is required');
            return;
        }
        const apkFilePath = tl.getInput('apkFilePath', true);
        if (apkFilePath == undefined) {
            tl.setResult(tl.TaskResult.Failed, 'Apk file path is required');
            return;
        }
        try {
            var editId = getActiveEdit(appId, token);
            var result = updateApk(appId, editId, apkFilePath, token);
            tl.setResult(tl.TaskResult.Succeeded, `Successfully update app ${editId}`);
        }
        catch (err) {
            console.log(`error: ${err}`);
            tl.setResult(tl.TaskResult.Failed, err.message);
        }
    });
}
function getActiveEdit(appId, token) {
    var request = require('sync-request');
    var options = { 'headers': { 'Authorization': `bearer ${token}`, "accept": "application/json" } };
    var res = request('GET', `${endpoint}/${appId}/edits`, options);
    console.log(`Active edits status code: ${res.statusCode}`);
    if (res.statusCode == 200) {
        var obj = JSON.parse(res.getBody().toString());
        console.log(`Find an update ${obj.status} id = ${obj.id}`);
        return obj.id;
    }
    else if (res.statusCode == 404) {
        console.log(`No update exist. Create a new one`);
        return createNewEdit(appId, token);
    }
    else {
        throw `Fail to check active update: ${res.statusCode}`;
    }
}
function createNewEdit(appId, token) {
    var request = require('sync-request');
    var options = { 'headers': { 'Authorization': `bearer ${token}`, "accept": "application/json" } };
    var res = request('POST', `${endpoint}/${appId}/edits`, options);
    console.log(`Active edits status code: ${res.statusCode}`);
    if (res.statusCode == 200) {
        var obj = JSON.parse(res.getBody().toString());
        console.log(`Create an update ${obj.status} id = ${obj.id}`);
        return obj.id;
    }
    else {
        throw `Fail to create update: ${res.statusCode}`;
    }
}
function updateApk(appId, editId, apkFilePath, token) {
    var request = require('sync-request');
    console.log(`Upload apk: ${apkFilePath}`);
    var data = apkFilePath; //TODO
    var options = {
        'headers': {
            'Authorization': `bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data.length
        },
        'body': data
    };
    var res = request('POST', `${endpoint}/${appId}/edits/${editId}/apks/upload`, options);
    throw "Not implemented yet"; //TODO
    return false;
}
run();
