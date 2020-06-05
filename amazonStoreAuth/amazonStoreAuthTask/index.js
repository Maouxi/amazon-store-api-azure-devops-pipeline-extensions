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
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('- Start authentication');
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
            console.log(`POST - Authenticate .Code: ${res.statusCode}`);
            if (res.statusCode = 200) {
                var obj = JSON.parse(res.getBody().toString());
                console.log(`POST - Authenticate .Code: ${res.statusCode}`);
                tl.setVariable('AmazonAuthToken', `${obj.access_token}`);
                tl.setResult(tl.TaskResult.Succeeded, "Success");
            }
            else {
                throw `POST - Authenticate fail. Code: ${res.statusCode}`;
            }
        }
        catch (err) {
            console.log(`- Error: ${err}`);
            tl.setResult(tl.TaskResult.Failed, err.message);
        }
    });
}
run();
