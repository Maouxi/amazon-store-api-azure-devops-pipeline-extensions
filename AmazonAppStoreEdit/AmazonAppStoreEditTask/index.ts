import tl = require('azure-pipelines-task-lib/task');
import { EditListing } from './model/edit-listing';
import { Api } from './api/amazon-submission-api';

async function run() {
    console.log('== Start edit app update ==');

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

    const language: string | undefined = tl.getInput('language', true);
    if (language == undefined) {
        tl.setResult(tl.TaskResult.Failed, 'Language is required');
        return;
    }

    const recentChanges: string | undefined = tl.getInput("recentChanges", true);
    if (recentChanges == undefined) {
        tl.setResult(tl.TaskResult.Failed, 'RecentChanges is required');
        return;
    }

    var featureBullets: Array<string> | undefined = undefined;
    var featureBulletsStr = tl.getInput("featureBullets", false);
    if (featureBulletsStr != undefined) {
        featureBullets = featureBulletsStr.split(/\r?\n/);
    }

    var keywords: Array<string> | undefined = undefined;
    var keywordsStr = tl.getInput("keywords", false);
    if (keywordsStr != undefined) {
        keywords = keywordsStr.split(";");
    }

    var updateListing = new EditListing(
        language,
        tl.getInput("title", false),
        tl.getInput("shortDescription", false),
        tl.getInput("fullDescription", false),
        recentChanges,
        featureBullets,
        keywords
    );

    try {
        var api = new Api(appId, editId, token);

        //Get etag for current edit
        console.log(`Get an etag for edit id: ${editId}`);
        var editListingResult = api.getEditWithEtag(language);

        //Edit the update
        console.log(`Start edit update for editId: ${editId}`);
        api.editUpdate(language, editListingResult.etag, editListingResult.value, updateListing)

        tl.setResult(tl.TaskResult.Succeeded, `Successfully update the editId: ${editId}`);
    }
    catch (err) {
        console.log(`Error: ${err}`);
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();