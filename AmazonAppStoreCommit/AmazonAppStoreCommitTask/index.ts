import tl = require('azure-pipelines-task-lib/task');

var endpoint = "https://developer.amazon.com/api/appstore/v1/applications";

async function run() {
    console.log('== Start commit app update == ');

    var token = tl.getVariable("AmazonAppStorePrepareTask.AmazonAccessToken");
    var editId = tl.getVariable("AmazonAppStorePrepareTask.AmazonEditId");
    if (token == undefined || editId == undefined) {
        tl.setResult(tl.TaskResult.Failed, `You need to use the 'prepare' task first`);
        return;
    }

    const appId: string | undefined = tl.getInput('appId', true);
    if (appId == undefined) {
        tl.setResult(tl.TaskResult.Failed, 'AppId is required');
        return;
    }

    try {
        console.log(`Start commit update for editId: ${editId}`);

        var request = require('sync-request');
        var options = { 'headers': { 'Authorization': `bearer ${token}`, "accept": "application/json" } };
        var res = request('POST', `${endpoint}/${appId}/edits/${editId}/commit`, options);

        if (res.statusCode == 200) {
            var obj = JSON.parse(res.getBody().toString());
            console.log(`Commit update. Status: ${obj.status} | Id: ${obj.id}`);
        } else {
            throw `Commit update fail. Code: ${res.statusCode}. Resp: ^${res.getBody()}`;
        }
        tl.setResult(tl.TaskResult.Succeeded, `Successfully commit the app update ${editId}`);
    }
    catch (err) {
        console.log(`Error: ${err}`);
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();