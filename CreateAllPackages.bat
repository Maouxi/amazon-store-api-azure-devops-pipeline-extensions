@ECHO OFF

ECHO START CREATE PACKAGES

ECHO Package auth task
cd AmazonAppStoreAuth\AmazonAppStoreAuthTask
cd
call tsc
cd ..
call tfx extension create --manifest-globs vss-extension.json
cd ..

ECHO Package edit task
cd AmazonAppStoreEdit\AmazonAppStoreEditTask
call tsc
cd ..
call tfx extension create --manifest-globs vss-extension.json
cd ..

ECHO Package replace apk task
cd AmazonAppStoreReplaceApk\AmazonAppStoreReplaceApkTask
call tsc
cd ..
call tfx extension create --manifest-globs vss-extension.json
cd ..

ECHO Package commit task
cd AmazonAppStoreCommit\AmazonAppStoreCommitTask
call tsc
cd ..
call tfx extension create --manifest-globs vss-extension.json
cd ..