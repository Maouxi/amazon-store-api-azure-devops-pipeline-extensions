import tl = require('azure-pipelines-task-lib/task');
import { Api } from './api/amazon-submission-api';

async function run() {
    console.log('== Start Amazon Submission API preparation ==');

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

    try {
        var api = new Api(clientId, clientSecret, appId);

        //Get the token
        console.log(`Authenticiate to the api`);
        var token = api.getToken();
        tl.setVariable('AmazonAccessToken', token);

        //Get the current edit
        console.log(`Create or get the current update edit id for appId: ${appId}`);
        var editId = api.getOrCreateActiveEdit(token);
        tl.setVariable("AmazonEditId", editId)

        tl.setResult(tl.TaskResult.Succeeded, `Successfully authenticate and get editId: ${editId}`);
    }
    catch (err) {
        console.log(`Error: ${err}`);
        tl.setResult(tl.TaskResult.Failed, err.message);
    }

}

run();