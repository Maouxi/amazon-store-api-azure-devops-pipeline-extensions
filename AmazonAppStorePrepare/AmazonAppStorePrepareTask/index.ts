import tl = require('azure-pipelines-task-lib/task');
import querystring = require('querystring');

var endpoint = "https://developer.amazon.com/api/appstore/v1/applications";

async function run() {
    console.log('== Start Amazon Submission API preparation ==');

    try {
        var request = require('sync-request');

        const clientId: string | undefined = tl.getInput('clientId', true);
        if (clientId == undefined) {
            tl.setResult(tl.TaskResult.Failed, 'ClientId is required');
            return;
        }

        const clientSecret: string | undefined = tl.getInput('clientSecret', true);
        if (clientSecret == undefined) {
            tl.setResult(tl.TaskResult.Failed, 'ClientSecret is required');
            return;
        }

        const appId: string | undefined = tl.getInput('appId', true);
        if (appId == undefined) {
            tl.setResult(tl.TaskResult.Failed, 'AppId is required');
            return;
        }

        console.log(`Authenticiate to the api`);

        var token = getToken(clientId, clientSecret);
        tl.setVariable('AmazonAccessToken', token);

        console.log(`Create or get the current update edit id for appId: ${appId}`);

        var editId = getActiveEdit(appId, token);
        tl.setVariable("AmazonEditId", editId)

        tl.setResult(tl.TaskResult.Succeeded, `Successfully authenticate and get editId: ${editId}`);
    }
    catch (err) {
        console.log(`Error: ${err}`);
        tl.setResult(tl.TaskResult.Failed, err.message);
    }

}

function getToken(clientId: string, clientSecret: string): string {
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
    } else {
        throw `Authenticate fail. Code: ${res.statusCode}. Resp: ^${res.getBody()}`;
    }
}

function getActiveEdit(appId: string, token: string): string {
    var request = require('sync-request');
    var options = { 'headers': { 'Authorization': `bearer ${token}`, "accept": "application/json" } };
    var res = request('GET', `${endpoint}/${appId}/edits`, options);
    if (res.statusCode == 200) {
        var obj = JSON.parse(res.getBody().toString());
        console.log(`Retrieve active edits success. Status: ${obj.status} | Id: ${obj.id}`);
        if (obj.id == undefined) {
            console.log(`Retrieve active edits not found. Create a new edit.`);
            return createNewEdit(appId, token);
        } else {
            return obj.id;
        }
    } else {
        throw `Retrieve active edits fail. Code: ${res.statusCode}`;
    }
}

function createNewEdit(appId: string, token: string): string {
    var request = require('sync-request');
    var options = { 'headers': { 'Authorization': `bearer ${token}`, "accept": "application/json" } };
    var res = request('POST', `${endpoint}/${appId}/edits`, options);

    if (res.statusCode == 200) {
        var obj = JSON.parse(res.getBody().toString());
        console.log(`Create new edits success. Status: ${obj.status} | Id: ${obj.id}`);
        return obj.id;
    } else {
        throw `Create new edits. Code: ${res.statusCode}. Resp: ^${res.getBody()}`;
    }
}

run();