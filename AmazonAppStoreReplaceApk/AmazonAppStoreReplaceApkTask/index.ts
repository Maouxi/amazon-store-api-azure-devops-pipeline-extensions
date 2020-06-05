import tl = require('azure-pipelines-task-lib/task');
import fs = require('fs');

var endpoint = "https://developer.amazon.com/api/appstore/v1/applications";

async function run() {
    var token = tl.getVariable("AmazonAppStoreAuthTask.AmazonAccessToken");
    if (token == undefined) {
        tl.setResult(tl.TaskResult.Failed, `You need to use the Auth task first to get a valid access_token`);
        return;
    }
    var editId = tl.getVariable("AmazonAppStoreEditTask.AmazonEditId");
    if (editId == undefined) {
        tl.setResult(tl.TaskResult.Failed, `You need to use the Edit task first to get a valid editId`);
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
        //Get the lastest apk id
        console.log(`- Get latest apk id for editId: ${editId}`);
        var apkId = getLatestApkId(appId, editId, token);

        // //Get etag for current apk
        console.log(`- Get an etag for apk id: ${apkId}`);
        var etag = getApkEtag(appId, editId, apkId, token);

        //Update the current edit with a new apk
        console.log(`- Start upload apk with id ${apkId} and etag ${etag} from file: ${apkFilePath}`);
        replaceApk(appId, editId, apkId, apkFilePath, etag, token);

        //End update
        tl.setResult(tl.TaskResult.Succeeded, `Successfully update app ${editId}`);
    }
    catch (err) {
        console.log(`- Error: ${err}`);
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

function getLatestApkId(appId: string, editId: string, token: string): string {
    var request = require('sync-request');
    var options = { 'headers': { 'Authorization': `bearer ${token}`, "accept": "application/json" } };
    var res = request('GET', `${endpoint}/${appId}/edits/${editId}/apks`, options);

    if (res.statusCode == 200) {
        var obj = JSON.parse(res.getBody().toString());
        console.log(`GET - Retrieve apk list success. Apk count: ${obj.length}. Latest apk id: ${obj[0].id}`);
        return obj[0].id
    } else {
        throw `GET - Retrieve apk list fail. Code: ${res.statusCode}. Resp: ^${res.getBody()}`;
    }
}

function getApkEtag(appId: string, editId: string, apkId: string, token: string): string {
    var request = require('sync-request');
    var options = { 'headers': { 'Authorization': `bearer ${token}`, "accept": "application/json" } };
    var res = request('GET', `${endpoint}/${appId}/edits/${editId}/apks/${apkId}`, options);

    if (res.statusCode == 200) {
        console.log(`GET - Retrieve apk etag success`);
        return res.headers.etag;
    } else {
        throw `GET - Retrieve apk etag fail. Code: ${res.statusCode}. Resp: ^${res.getBody()}`;
    }
}

function replaceApk(appId: string, editId: string, apkId: string, apkFilePath: string, etag: string, token: string) {
    var request = require('sync-request');
    var fileBuffer = fs.readFileSync(apkFilePath)
    var options = {
        'headers': {
            'Authorization': `bearer ${token}`,
            'Content-Type': 'application/vnd.android.package-archive',
            'Content-Length': fileBuffer.length,
            'If-Match': etag,
            'fileName': apkFilePath.split('\\')?.pop()?.split('/').pop()?.toString()
        },
        'body': fileBuffer
    };
    var res = request('PUT', `${endpoint}/${appId}/edits/${editId}/apks/${apkId}/replace`, options);

    if (res.statusCode == 200) {
        console.log(`PUT - Replace apk success`);
    } else {
        throw `PUT - Replace apk fail. Code: ${res.statusCode}. Resp: ^${res.getBody()}`
    }
}

run();