import fs = require('fs');

export class Api {

    private endpoint = "https://developer.amazon.com/api/appstore/v1/applications";
    private request = require('sync-request');

    constructor(private appId: string, private editId: string, private token: string) { }

    getLatestApkId(): string {
        var options = { 'headers': { 'Authorization': `bearer ${this.token}`, "accept": "application/json" } };
        var res = this.request('GET', `${this.endpoint}/${this.appId}/edits/${this.editId}/apks`, options);

        if (res.statusCode == 200) {
            var obj = JSON.parse(res.getBody().toString());
            console.log(`Retrieve apk list success. Apk count: ${obj.length}. Latest apk id: ${obj[0].id}`);
            return obj[0].id
        } else {
            throw `Retrieve apk list fail. Code: ${res.statusCode}. Resp: ^${res.getBody()}`;
        }
    }

    getApkEtag(apkId: string): string {
        var options = { 'headers': { 'Authorization': `bearer ${this.token}`, "accept": "application/json" } };
        var res = this.request('GET', `${this.endpoint}/${this.appId}/edits/${this.editId}/apks/${apkId}`, options);
        if (res.statusCode == 200) {
            console.log(`Retrieve apk etag success`);
            return res.headers.etag;
        } else {
            throw `Retrieve apk etag fail. Code: ${res.statusCode}. Resp: ^${res.getBody()}`;
        }
    }

    replaceApk(apkId: string, apkFilePath: string, etag: string) {
        var fileBuffer = fs.readFileSync(apkFilePath)
        var options = {
            'headers': {
                'Authorization': `bearer ${this.token}`,
                'Content-Type': 'application/vnd.android.package-archive',
                'Content-Length': fileBuffer.length,
                'If-Match': etag,
                'fileName': apkFilePath.split('\\')?.pop()?.split('/').pop()?.toString()
            },
            'body': fileBuffer
        };
        var res = this.request('PUT', `${this.endpoint}/${this.appId}/edits/${this.editId}/apks/${apkId}/replace`, options);

        if (res.statusCode == 200) {
            console.log(`Replace apk success`);
        } else {
            throw `Replace apk fail. Code: ${res.statusCode}. Resp: ^${res.getBody()}`
        }
    }
}