@ECHO OFF

ECHO START CREATE PACKAGES

ECHO Package prepare task
cd AmazonAppStorePrepare\AmazonAppStorePrepareTask
call npm install
call tsc
cd ..
call tfx extension create --manifest-globs vss-extension.json
cd ..

ECHO Package replace apk task
cd AmazonAppStoreReplaceApk\AmazonAppStoreReplaceApkTask
call npm install
call tsc
cd ..
call tfx extension create --manifest-globs vss-extension.json
cd ..

ECHO Package commit task
cd AmazonAppStoreCommit\AmazonAppStoreCommitTask
call npm install
call tsc
cd ..
call tfx extension create --manifest-globs vss-extension.json
cd ..