import tl = require('azure-pipelines-task-lib/task');
import https = require('https')
import querystring = require('querystring');
import fs = require('fs');

var endpoint = "https://developer.amazon.com/api/appstore/v1/applications";

async function run() {
    console.log('Start create or edit');
    //TODO: remove this line
    var token = "Atc|MQEBIB6jGF7b4nLJImMsnWWZL_y10C5KbGVe_GVYFecBjA_ihM3S9pe_ITE6lTF10wSM6HuoqxeaKDNIm1cV_k_ku-gmQ8L1tX1uXp4OtqxdnNbVxcxu29UqFPHLsdHh6g0f64GUExBl0zDXQM31rmuVTIAo20irc8HqRDv0XtbsHzRnShh77jT_JGv2dwvRwpVcjrwp9kLUF9Glcmc3iGla7fz3J6TqZW6T5-YRf7oTuaB2AVC7Mvu7_qFXRvkfnEBZFvmRN4gUO6wZfYeL_WbbD479kBrgA-f0rja4yA2xe5u8eg";
    //var token = tl.getVariable("AmazonAuthTask.AmazonAuthToken");
    if (token == undefined) {
        tl.setResult(tl.TaskResult.Failed, `You need to use the Auth task first to get a valid access_token`);
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
        //Get or create active edit
        console.log(`- Start create or edit for appId: ${appId}`);
        var editId = getActiveEdit(appId, token);
        //Update the current edit with a new apk
        console.log(`- Start upload apk: ${apkFilePath}`);
        updateApk(appId, editId, apkFilePath, token);
        //End update
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

    console.log(`GET - Retrieve active edits. Code: ${res.statusCode}`);
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

    console.log(`POST - Create new edits. Code: ${res.statusCode}`);
    if (res.statusCode == 200) {
        var obj = JSON.parse(res.getBody().toString());
        console.log(`POST - Create new edits success. Status: ${obj.status} | Id: ${obj.id}`);
        return obj.id;
    } else {
        throw `POST - Create new edits. Code: ${res.statusCode}`;
    }
}

function updateApk(appId: string, editId: string, apkFilePath: string, token: string) {
    var request = require('sync-request');
    var fileBuffer = fs.readFileSync(apkFilePath, { encoding: 'utf8', flag: 'r' })
    var options = {
        'headers': {
            'Authorization': `bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': fileBuffer.length,
            'fileName': apkFilePath.split('\\')?.pop()?.split('/').pop()?.toString()
        },
        'body': fileBuffer
    };
    var res = request('POST', `${endpoint}/${appId}/edits/${editId}/apks/upload`, options);
    console.log(`POST - Upload apk. Code: ${res.statusCode}`);
    if (res.statusCode == 200) {
        console.log(`POST - Upload apk success`);
    } else {
        throw `POST - Upload apk fail. Code: ${res.statusCode}`
    }
}

run();