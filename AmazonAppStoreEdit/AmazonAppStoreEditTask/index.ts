import tl = require('azure-pipelines-task-lib/task');

var endpoint = "https://developer.amazon.com/api/appstore/v1/applications";

async function run() {
    var token = tl.getVariable("AmazonAppStoreAuthTask.AmazonAccessToken");
    if (token == undefined) {
        tl.setResult(tl.TaskResult.Failed, `You need to use the Auth task first to get a valid access_token`);
        return;
    }
    const appId: string | undefined = tl.getInput('appId', true);
    if (appId == undefined) {
        tl.setResult(tl.TaskResult.Failed, 'AppId is required');
        return;
    }

    try {
        console.log(`- Start create or edit for appId: ${appId}`);
        var editId = getActiveEdit(appId, token);
        tl.setVariable("AmazonEditId", editId)
        tl.setResult(tl.TaskResult.Succeeded, `Successfully update app ${editId}`);
    }
    catch (err) {
        console.log(`- Error: ${err}`);
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

function getActiveEdit(appId: string, token: string): string {
    var request = require('sync-request');
    var options = { 'headers': { 'Authorization': `bearer ${token}`, "accept": "application/json" } };
    var res = request('GET', `${endpoint}/${appId}/edits`, options);

    if (res.statusCode == 200) {
        var obj = JSON.parse(res.getBody().toString());
        console.log(`GET - Retrieve active edits success. Status: ${obj.status} | Id: ${obj.id}`);
        return obj.id;
    } else if (res.statusCode == 404) {
        console.log(`GET - Retrieve active edits not found.`);
        return createNewEdit(appId, token);
    } else {
        throw `GET - Retrieve active edits fail. Code: ${res.statusCode}`;
    }
}

function createNewEdit(appId: string, token: string): string {
    var request = require('sync-request');
    var options = { 'headers': { 'Authorization': `bearer ${token}`, "accept": "application/json" } };
    var res = request('POST', `${endpoint}/${appId}/edits`, options);

    if (res.statusCode == 200) {
        var obj = JSON.parse(res.getBody().toString());
        console.log(`POST - Create new edits success. Status: ${obj.status} | Id: ${obj.id}`);
        return obj.id;
    } else {
        throw `POST - Create new edits. Code: ${res.statusCode}. Resp: ^${res.getBody()}`;
    }
}

run();