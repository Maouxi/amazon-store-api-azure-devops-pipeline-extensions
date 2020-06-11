import tl = require('azure-pipelines-task-lib/task');
import { Api } from './api/amazon-submission-api';

async function run() {
    console.log('== Start replace apk == ');

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

    const apkFilePath: string | undefined = tl.getPathInput('apkFilePath', true);
    if (apkFilePath == undefined) {
        tl.setResult(tl.TaskResult.Failed, 'Apk file path is required');
        return;
    }

    try {
        var api = new Api(appId, editId, token);

        //Get the lastest apk id
        console.log(`Get latest apk id for editId: ${editId}`);
        var apkId = api.getLatestApkId();

        // //Get etag for current apk
        console.log(`Get an etag for apk id: ${apkId}`);
        var etag = api.getApkEtag(apkId);

        //Update the current edit with a new apk
        console.log(`Start upload apk with id ${apkId} and etag ${etag} from file: ${apkFilePath}`);
        api.replaceApk(apkId, apkFilePath, etag);

        //End update
        tl.setResult(tl.TaskResult.Succeeded, `Successfully update app ${editId}`);
    }
    catch (err) {
        console.log(`Error: ${err}`);
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();