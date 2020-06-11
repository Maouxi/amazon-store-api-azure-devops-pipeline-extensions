# Amazon Sumbmision API for Azure DevOps Services pipeline

Tasks for Amazon AppStore submission api and make continuous delivery on Azure DevOps Services pipeline build or release.

## Tasks

- PrepareTask: Authentication to the api and create or get the current update
- EditTask: Edit an update description
- ReplaceApkTask: Replace an apk into the current update
- CommitTask: Commit the update to the Amazon AppStore

## Usage

### Prepare task

_Inputs_
- clientId: Amazon submission API client id
- clientSecret: Amazon submission API client secret
- appId: The package name or app identifier for the app

_Output_
- AmazonAccessToken : Amazon submission API access token
- AmazonEditId : Amazon AppStore editId

Authentication to the submission API and get or create the current update. 
Need to be called once before other tasks in a job. 

The Amazon access token can be retrieve in any other tasks as a variable. `$(AmazonAppStorePrepareTask.AmazonAccessToken)`.
The Amazon edit id can be retrieve in any other tasks as a variable. `$(AmazonAppStorePrepareTask.AmazonEditId)`.

### Edit update task

_Prerequesite_

- Prepare task need to be run first

_Inputs_
For optional input, leave empty the field to don't update them and keep old values. 

- appId: The package name or app identifier for the app
- language: The description language to udpate in ISO 639-1
- title: Display title
- shortDescription: A brief description of the app, shown on mobile devices.
- fullDescription: A lengthier description of the app, for the Appstore website
- recentChanges: The release note of this update
- featureBullets: Product feature bullets. One feature per line
- keywords: App keywords separate with ';'

### Replace apk task

_Prerequesite_

- Prepare task need to be run first

_Inputs_
- appId: The package name or app identifier for the app
- apkFilePath: Path to the apk file

Replace the apk in the current edit

### Commit task

_Prerequesite_

- Prepare task need to be run first

_Inputs_
- appId: The package name or app identifier for the app

Commit the change to the store

## Build and debug

Inside the task folder :

- `npm install` to get dependencies
- `tsc` to build the typescript file
- `$env:INPUT_{var}="{value}"` to mock an environement variable
- `node index.js` to run and debug the script

## Package

Inside the root folder of a task to package one task: 

`tfx extension create --manifest-globs vss-extension.json`

Or use the CreateAllPackages script to compile and package all the tasks. 
