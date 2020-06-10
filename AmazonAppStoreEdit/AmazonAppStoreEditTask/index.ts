import tl = require('azure-pipelines-task-lib/task');
import querystring = require('querystring');

var endpoint = "https://developer.amazon.com/api/appstore/v1/applications";

async function run() {
    console.log('== Start edit app update ==');

    //TODO: remove
    tl.setVariable("AmazonAppStorePrepareTask.AmazonAccessToken", "Atc|MQEBIIwrxzx9XtcZQXeKTPuHfvjnqlOtMhuY6moQUzVNA56vtSfnxPk6iS74QUjYg151CdoDlVRI7uBQYvQsFVILazLIQJVxI8Cr8lUtyEvIdx7BoAdOwCSGNOqhmk8apLB_u58Xb_3j8AYi1sitcomffwhYas3A2vZ_Li4WPCpUI55Pj3UzY-G4fe_B9jCn0U8XOgHFTOeIaaoX0gyCBiW_-taf9ixij8-DpjjbzrXDylpz5vYTpCi8mdTx49kg3Ky1vdNXvfooPkDOhxfsXBt27Y04fTjuEFNb3eXTq3feNKr07A");
    tl.setVariable("AmazonAppStorePrepareTask.AmazonEditId", "amzn1.devportal.apprelease.08412e24e49743798d085a564ab5da85");
    //TODO: end remove

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

    try {
        //Get etag for current edit
        console.log(`Get an etag for edit id: ${editId}`);
        var editWithEtag = getEditWithEtag(appId, editId, token);

        //Edit the update
        console.log(`Start edit update for editId: ${editId} | ${editWithEtag.etag}`);
        editUpdate(appId, editId, editWithEtag.etag, editWithEtag.edit, token)

        tl.setResult(tl.TaskResult.Succeeded, `Successfully update the editId: ${editId}`);
    }
    catch (err) {
        console.log(`Error: ${err}`);
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

function editUpdate(appId: string, editId: string, etag: String, edit: Object, token: string): string {
    // var request = require('sync-request');
    // var options = { 'headers': { 'Authorization': `bearer ${token}`, "accept": "application/json" } };
    // var res = request('GET', `${endpoint}/${appId}/edits/${editId}/??`, options);
    // if (res.statusCode == 200) {
    //     console.log(`Edit update success`);
    //     return res.headers.etag;
    // } else {
    //    throw `Edit update fail. Code: ${res.statusCode}. Resp: ^${res.getBody()}`;
    // }
    throw `Edit update fail`;
}

function getEditWithEtag(appId: string, editId: string, token: string): { edit: Object, etag: string } {
    var request = require('sync-request');
    var options = { 'headers': { 'Authorization': `bearer ${token}`, "accept": "application/json" } };
    var res = request('GET', `${endpoint}/${appId}/edits/${editId}/listings`, options);
    if (res.statusCode == 200) {
        console.log(`Retrieve edit with etag success`);
        var obj = JSON.parse(res.getBody());
        console.log(obj);
        return { edit: obj, etag: res.headers.etag };
    } else {
        throw `Retrieve edit with etag fail. Code: ${res.statusCode}. Resp: ^${res.getBody()}`;
    }
}

run();