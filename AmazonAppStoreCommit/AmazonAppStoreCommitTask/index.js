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
        console.log('Start commit app');
        var token = tl.getVariable("AmazonAppStoreAuthTask.AmazonAccessToken");
        if (token == undefined) {
            tl.setResult(tl.TaskResult.Failed, `You need to use the Auth task first to get a valid access_token`);
            return;
        }
        const appId = tl.getInput('appId', true);
        if (appId == undefined) {
            tl.setResult(tl.TaskResult.Failed, 'AppId is required');
            return;
        }
        var editId = tl.getVariable("AmazonAppStoreEditTask.AmazonEditId");
        if (editId == undefined) {
            tl.setResult(tl.TaskResult.Failed, `You need to use the Edit task first to get a valid editId`);
            return;
        }
        try {
            console.log(`- Start commit update: ${editId}`);
            var request = require('sync-request');
            var options = { 'headers': { 'Authorization': `bearer ${token}`, "accept": "application/json" } };
            var res = request('POST', `${endpoint}/${appId}/edits/${editId}/commit`, options);
            if (res.statusCode == 200) {
                var obj = JSON.parse(res.getBody().toString());
                console.log(`POST - Commit update. Status: ${obj.status} | Id: ${obj.id}`);
            }
            else {
                throw `POST - Commit update fail. Code: ${res.statusCode}. Resp: ^${res.getBody()}`;
            }
            tl.setResult(tl.TaskResult.Succeeded, `Successfully commit the app update ${editId}`);
        }
        catch (err) {
            console.log(`- Error: ${err}`);
            tl.setResult(tl.TaskResult.Failed, err.message);
        }
    });
}
run();
