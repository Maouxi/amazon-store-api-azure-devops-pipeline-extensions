import tl = require('azure-pipelines-task-lib/task');
import { Api } from './api/amazon-submission-api'

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
        var api = new Api(appId, editId, token);

        //Get etag for current edit
        console.log(`Get an etag for edit id: ${editId}`);
        var etag = api.getEditEtag();

        //Commit the update
        console.log(`Start commit update for editId: ${editId}`);
        api.commitUpdate(etag)

        tl.setResult(tl.TaskResult.Succeeded, `Successfully commit the app update ${editId}`);
    }
    catch (err) {
        console.log(`Error: ${err}`);
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();