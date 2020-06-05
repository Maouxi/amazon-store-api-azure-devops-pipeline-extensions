# Amazon Sumbmision API for Azure Devops pipeline

Tasks for Amazon AppStore submission api and make continuous delivery on azure pipeline build or release.",

## TODO

- Merge the authentication and the get current update tasks. 
- Add new task to edit update content or merge it with the replace apk task
- Allow user to add the token or editId as task input ?

## Features

- Authentication
- Get the current update
- Replace an apk
- Commit the update

## Usage

### Authenticiation task

_Inputs_
- clientId: Amazon submission API client id
- clientSecret: Amazon submission API client secret

_Output_
- AmazonAccessToken : Amazon submission API access token

Authentication to the submission API. Need to be called once before other tasks in a job. 

The Amazon access token can be retrieve in any other tasks as a variable. `$(AmazonAppStoreAuthTask.AmazonAccessToken)`.

### Create or Edit task

_Prerequesite_

- Need an access token provided by te Authentification task.

_Inputs_
- appId: The package name or app identifier for the app

_Output_
- AmazonEditId : Amazon AppStore editId

Create or retrieve the current edit of the update. Need to be called before made changes to the update in the job. 

The Amazon edit id can be retrieve in any other tasks as a variable. `$(AmazonAppStoreEditTask.AmazonEditId)`. 

### Replace apk task

_Prerequesite_

- Need an access token provided by te authentification task.
- Need an edit id provided by the create or edit task

_Inputs_
- appId: The package name or app identifier for the app
- apkFilePath: Path to the apk file

Replace the apk in the current edit

### Commit task

_Prerequesite_

- Need an access token provided by te authentification task.
- Need an edit id provided by the create or edit task

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
