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
const https = require("https");
const querystring = require("querystring");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Start authentication');
        try {
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
            console.log('##vso[task.setvariable variable=Fooo;isOutput=true]thisisfooooooooovariablevalue');
            tl.setVariable('Test1', 'inside runtry block');
            const hostname = 'api.amazon.com';
            const tokenPath = '/auth/o2/token';
            const data = querystring.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: "client_credentials",
                scope: "appstore::apps:readwrite"
            });
            const options = {
                hostname: hostname,
                port: 443,
                path: tokenPath,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': data.length
                }
            };
            const req = https.request(options, (res) => {
                console.log(`Api call status code: ${res.statusCode}`);
                var result = '';
                res.on('data', function (chunk) {
                    result += chunk;
                });
                tl.setVariable("Test2", "inside request block");
                res.on('end', function () {
                    var obj = JSON.parse(result.toString());
                    var accessToken = obj.access_token;
                    console.log(`Access token = ${accessToken}`);
                    tl.setVariable('AmazonAuthToken', `${accessToken}`);
                    tl.setVariable('Test3', 'inside on end block');
                    tl.setVariable('Test4', accessToken.toString());
                    tl.setResult(tl.TaskResult.Succeeded, "Success");
                });
            });
            req.on('error', (error) => {
                console.log(`error: ${error}`);
                tl.setResult(tl.TaskResult.Failed, error.message);
            });
            req.write(data);
            req.end();
        }
        catch (err) {
            console.log(`error: ${err}`);
            tl.setResult(tl.TaskResult.Failed, err.message);
        }
    });
}
run();
