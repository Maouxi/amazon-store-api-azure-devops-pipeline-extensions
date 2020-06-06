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
        console.log('== Start commit app update == ');
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
        try {
            //Get etag for current edit
            console.log(`Get an etag for edit id: ${editId}`);
            var etag = getEditEtag(appId, editId, token);
            //Commit the update
            console.log(`Start commit update for editId: ${editId}`);
            commitUpdate(appId, editId, etag, token);
            tl.setResult(tl.TaskResult.Succeeded, `Successfully commit the app update ${editId}`);
        }
        catch (err) {
            console.log(`Error: ${err}`);
            tl.setResult(tl.TaskResult.Failed, err.message);
        }
    });
}
function getEditEtag(appId, editId, token) {
    var request = require('sync-request');
    var options = { 'headers': { 'Authorization': `bearer ${token}`, "accept": "application/json" } };
    var res = request('GET', `${endpoint}/${appId}/edits/${editId}`, options);
    if (res.statusCode == 200) {
        console.log(`Retrieve edit etag success`);
        return res.headers.etag;
    }
    else {
        throw `Retrieve edit etag fail. Code: ${res.statusCode}. Resp: ^${res.getBody()}`;
    }
}
function commitUpdate(appId, editId, etag, token) {
    var request = require('sync-request');
    var options = {
        'headers': {
            'Authorization': `bearer ${token}`,
            "accept": "application/json",
            'If-Match': etag
        }
    };
    var res = request('POST', `${endpoint}/${appId}/edits/${editId}/commit`, options);
    if (res.statusCode == 200) {
        var obj = JSON.parse(res.getBody().toString());
        console.log(`Commit update. Status: ${obj.status} | Id: ${obj.id}`);
    }
    else {
        throw `Commit update fail. Code: ${res.statusCode}. Resp: ^${res.getBody()}`;
    }
}
run();
