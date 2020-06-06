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
const querystring = require("querystring");
var endpoint = "https://developer.amazon.com/api/appstore/v1/applications";
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('== Start Amazon Submission API preparation ==');
        try {
            var request = require('sync-request');
            const clientId = tl.getInput('clientId', true);
            if (clientId == undefined) {
                tl.setResult(tl.TaskResult.Failed, 'ClientId is required');
                return;
            }
            const clientSecret = tl.getInput('clientSecret', true);
            if (clientSecret == undefined) {
                tl.setResult(tl.TaskResult.Failed, 'ClientSecret is required');
                return;
            }
            const appId = tl.getInput('appId', true);
            if (appId == undefined) {
                tl.setResult(tl.TaskResult.Failed, 'AppId is required');
                return;
            }
            console.log(`Authenticiate to the api`);
            var token = getToken(clientId, clientSecret);
            tl.setVariable('AmazonAccessToken', token);
            console.log(`Create or get the current update edit id for appId: ${appId}`);
            var editId = getActiveEdit(appId, token);
            tl.setVariable("AmazonEditId", editId);
            tl.setResult(tl.TaskResult.Succeeded, `Successfully authenticate and get editId: ${editId}`);
        }
        catch (err) {
            console.log(`Error: ${err}`);
            tl.setResult(tl.TaskResult.Failed, err.message);
        }
    });
}
function getToken(clientId, clientSecret) {
    var request = require('sync-request');
    const data = querystring.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
        scope: "appstore::apps:readwrite"
    });
    var options = {
        'headers': { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': data.length },
        'body': data
    };
    var res = request('POST', `https://api.amazon.com/auth/o2/token`, options);
    if (res.statusCode = 200) {
        console.log(`Authenticate success`);
        var obj = JSON.parse(res.getBody().toString());
        return obj.access_token;
    }
    else {
        throw `Authenticate fail. Code: ${res.statusCode}. Resp: ^${res.getBody()}`;
    }
}
function getActiveEdit(appId, token) {
    var request = require('sync-request');
    var options = { 'headers': { 'Authorization': `bearer ${token}`, "accept": "application/json" } };
    var res = request('GET', `${endpoint}/${appId}/edits`, options);
    if (res.statusCode == 200) {
        var obj = JSON.parse(res.getBody().toString());
        console.log(`Retrieve active edits success. Status: ${obj.status} | Id: ${obj.id}`);
        return obj.id;
    }
    else if (res.statusCode == 404) {
        console.log(`Retrieve active edits not found.`);
        return createNewEdit(appId, token);
    }
    else {
        throw `Retrieve active edits fail. Code: ${res.statusCode}`;
    }
}
function createNewEdit(appId, token) {
    var request = require('sync-request');
    var options = { 'headers': { 'Authorization': `bearer ${token}`, "accept": "application/json" } };
    var res = request('POST', `${endpoint}/${appId}/edits`, options);
    if (res.statusCode == 200) {
        var obj = JSON.parse(res.getBody().toString());
        console.log(`Create new edits success. Status: ${obj.status} | Id: ${obj.id}`);
        return obj.id;
    }
    else {
        throw `Create new edits. Code: ${res.statusCode}. Resp: ^${res.getBody()}`;
    }
}
run();
