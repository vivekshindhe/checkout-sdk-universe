import {confirm, select} from "@inquirer/prompts";
import ora from "ora";
import exec from 'child_process';
import {dirname} from "path";
import chalk from "chalk";
import * as fs from "fs";

import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sdkTypeChoices = [
    {
        name:'Standard Checkout',
        value: 'standard',
    },
    {
        name:'Custom Checkout',
        value: 'custom',
    }
];

const platformChoices = [
    {
        name:'Native Android',
        value: 'android',
    },
    {
        name:'Native iOS',
        value: 'ios',
    },
    {
        name:'React Native',
        value: 'react-native',
    },
    {
        name:'Flutter',
        value: 'flutter',
    },
    {
        name:'Capacitor',
        value: 'capacitor',
    },
    {
        name:'Ionic Cordova',
        value: 'ionic',
    },
    {
        name:'Cordova',
        value: 'cordova',
    },
    {
        name:'Exit',
        value: 'exit',
    }
]

async function executeCommand(command){
    return new Promise((resolve, reject) => {
        exec.exec(command, (error, stderr, stdout)=>{
            if (error) {
                console.log('\n')
                console.log(error)
                console.log('\n💥Something triggered the trip wire!\nNo worries. Please message Vivek Rajesh Shindhe(vivek.shindhe@razorpay.com) with a screenshot of the error post above. 🙂')
            }
            resolve(stderr);
        })
    })
}

async function askCheckoutType(selectedPlatform){
    return new Promise(async (resolve, reject)=>{
        switch (selectedPlatform) {
            case 'android':
            case 'iOS':
            case 'react-native':
            case 'flutter':{
                const checkoutType = await select({
                    message:'Which checkout did you want to use?',
                    choices: sdkTypeChoices,
                });
                resolve(checkoutType);
                break;
            }
            case 'capacitor':
            case 'ionic-cordova':
            case 'cordova':
                resolve('standard')
                break;
            default:
                break;
        }
    })
}

async function askForPlatform(){
    return new Promise(async (resolve, reject)=>{
        const selectedPlatform = await select({
            message:'Which platform do you wish to install?',
            choices: platformChoices
        });
        resolve(selectedPlatform)
    });
}

async function askForMobilePlatformToRun() {
    return new Promise(async (resolve, reject)=>{
        const selectedPlatform = await select({
            message:'Which mobile platform do you want to run the project on?',
            choices: [
                {
                    name:'Android',
                    value:'android'
                },
                {
                    name:'iOS',
                    value: 'ios'
                }
            ]
        });
        resolve(selectedPlatform)
    });
}

async function checkForAndroidDependencies(){
    /*
    * Android Dependencies involves,
    * 1. Android Studio installation
    * */
    const isAndroidStudioInstalled = await confirm({
        message:'🙋🏻Is Android Studio installed on your machine?'
    })
    if (!isAndroidStudioInstalled){
        console.log('🫣We need Android Studio to be able to run the Android sample apps.\nPlease install Android Studio from this link:\nhttps://developer.android.com/studio')
        process.exit()
    }
}

async function cloneRepo(repoName){
    const baseGitUrl = 'https://github.com/razorpay'
    switch (repoName){
        case 'razorpay-android-sample-app':
        case 'razorpay-android-custom-sample-app':
            await executeCommand('cd android && git clone '+baseGitUrl+'/'+repoName)
            break;
        case 'react-native-razorpay':
        case 'react-native-customui':
            await executeCommand('cd react-native && git clone '+baseGitUrl+'/'+repoName)
            break;
        default:
            console.log('Don`t know what is going on anymore :`-|');
    }
}

function getErrorMessage(sampleAppName, folderName){
    return `🙅🏻‍${chalk.red('STOP!!!')} Looks like the ${chalk.cyanBright(sampleAppName)} already exists inside the ${folderName} folder.
If you wish to have a fresh installation please delete this folder first.`
}

async function checkIfProjectsAlreadyExists(platform, checkoutType){
    switch (platform){
        case 'android':
            if (checkoutType === 'standard'){
                if (fs.existsSync('./android/razorpay-android-sample-app')){
                    exitWithMessage(getErrorMessage('Android-Standard Sample App', platform))
                }
            }else if(checkoutType === 'custom'){
                if (fs.existsSync('./android/razorpay-android-custom-sample-app')){
                    exitWithMessage(getErrorMessage('Android-Custom Sample App',platform))
                }
            }

            break;
        case 'react-native':
            if (checkoutType === 'standard'){
                if (fs.existsSync('./react-native/react-native-razorpay')){
                    exitWithMessage(getErrorMessage('React-Native Standard Sample App', platform))
                }
            }else if (checkoutType === 'custom'){
                if (fs.existsSync('./react-native/react-native-customui')){
                    exitWithMessage(getErrorMessage('React-Native Custom Sample App',platform))
                }
            }
            break;
        default:{}

    }
}

function exitWithMessage(message){
    let time = new Date();
    let hours = time.getHours()
    let greeting;
    if (hours >=5 && hours <12){
        greeting = '🌅Have a great day ahead!'
    }else if(hours >=12 && hours < 6){
        greeting = '🌆Have a good afternoon!'
    }else {
        greeting = '🌃Have a good evening!'
    }
    if (message == null){
        console.log('\n========================\nAlright! Exiting app now. Don`t forget to trigger me if you want to use another platform.\n'+greeting)
    }else{
        console.log('\n'+message+'\n'+greeting);
    }
    process.exit(1)
}

async function showCustomMessageLoader(message){
    return ora({
        prefixText: message,
        spinner: "clock"
    }).start();
}

function stopLoader(spinner, message){
    spinner.stopAndPersist({
        prefixText:message,
        symbol:'✅'
    })
}


/*
* App starts from here.
* First thing to do is to get the details of the platform/checkoutType the user wanted to use.
* */
const selectedPlatform = await askForPlatform();

const checkoutType = await askCheckoutType(selectedPlatform);

const continueWithSelection = await confirm({
    message:'You`ve selected to install/use '+chalk.cyanBright(selectedPlatform)+' with '+chalk.cyanBright(checkoutType)+'.\nDo you wish to continue?'
});

if(continueWithSelection){
    console.log('Awesome 🚀.. Moving forward & beyond')
}else{
    console.log('😱Understood. Exiting app. Please initiate app again by calling `node index.js`')
    process.exit()
}

/*
* With Platform & CheckoutType selected, we need to now start installing dependencies for the selected values
* NOTE: Please don't change the values without changing values from the platformChoices variable as well.
* */
let repoName;
var spinner;
switch (selectedPlatform) {
    case 'android':

        if (checkoutType === 'standard'){
            repoName = 'razorpay-android-sample-app'
        }else{
            repoName = 'razorpay-android-custom-sample-app'
        }
        await checkForAndroidDependencies();
        if (!fs.existsSync('./android')){
            await executeCommand('mkdir android')
        }
        spinner = await showCustomMessageLoader(`Cloning Github Repo ${repoName} now inside folder ${chalk.cyanBright('android')}`)
        await checkIfProjectsAlreadyExists(selectedPlatform, checkoutType)
        await cloneRepo(repoName)
        stopLoader(spinner, 'Repository clone successful')
        const shouldOpenInAndroidStudio = await confirm({
            message:'🙋🏻Do you want me to open cloned project in Android Studio? \n(To use this feature, please ensure that your MacOS '+chalk.redBright('Native Terminal')+' does not open in Rosetta.',
            default:false
        })
        if (shouldOpenInAndroidStudio){
            // console.log('open /Applications/"IntelliJ IDEA.app"/ '+__dirname+'/android/'+repoName)
            await executeCommand('open /Applications/"IntelliJ IDEA.app"/ '+__dirname+'/android/'+repoName)
        }else{
            console.log(""+
                    "\nPlease open the project at path:\n"+
                    chalk.cyanBright(__dirname+'/'+repoName)+
                    "\nfrom Android Studio / IntelliJ IDEA"
            +"")
            exitWithMessage(null);
        }
        break;
    case 'ios':
        break;
    case 'react-native':
        let npmInstallCommand;
        let podInstallCommand;
        let sampleAppPath;
        if (checkoutType === 'standard'){
            repoName = 'react-native-razorpay'
            npmInstallCommand = `cd react-native && cd ${repoName} && npm install --force --legacy-peer-deps && cd example/SampleApp && npm install`
            podInstallCommand = `cd react-native && cd ${repoName} && cd example/SampleApp/ios && pod install`
            sampleAppPath = `cd react-native && cd ${repoName} && cd example/SampleApp`
        }else{
            repoName = 'react-native-customui'
            npmInstallCommand = `cd react-native && cd ${repoName} && npm install --force --legacy-peer-deps && cd example && npm install`
            podInstallCommand = `cd react-native && cd ${repoName} && cd example/ios && pod install`
            sampleAppPath = `cd react-native && cd ${repoName} && cd example`

        }
        // await checkForReactNativeDependencies()
        if (!fs.existsSync('./react-native')){
            await executeCommand('mkdir react-native')
        }
        spinner = await showCustomMessageLoader(`Cloning Github Repo ${chalk.redBright(repoName)} now inside folder ${chalk.cyanBright('react-native')}`)
        await checkIfProjectsAlreadyExists(selectedPlatform, checkoutType)
        await cloneRepo(repoName)
        stopLoader(spinner, 'Repository clone successful');
        spinner = await showCustomMessageLoader('Running npm install in ./react-native/'+repoName)
        await executeCommand(npmInstallCommand)
        stopLoader(spinner, 'npm install complete')
        spinner = await showCustomMessageLoader(`Running pod install inside ./react-native/${repoName} for iOS`)
        await executeCommand(podInstallCommand)
        stopLoader(spinner, 'pod install complete')
        spinner = await showCustomMessageLoader(`Installing latest version of ${repoName}`)
        await executeCommand(sampleAppPath+` && npm uninstall ${repoName} && npm install ${repoName}`)
        stopLoader(spinner, `Latest version of ${repoName} installed.`)
        const shouldRun = await confirm({
            message:'Do you want to run the project?',
            default: false
        })
        if (shouldRun){
            const mobilePlatform = await askForMobilePlatformToRun()
            if (mobilePlatform === 'android'){
                spinner = await showCustomMessageLoader(`Running react-native ${checkoutType} project for Android`)
                await executeCommand(sampleAppPath+' && npx react-native run-android')
                stopLoader(spinner, 'Run successful')
            }else {
                spinner = await showCustomMessageLoader(`Running react-native ${checkoutType} project for iOS`)
                await executeCommand(sampleAppPath+' && npx react-native run-ios')
                stopLoader(spinner, 'Run successful')
            }
        }
        exitWithMessage(null)
        break;
    case 'flutter':
        break;
    case 'capacitor':
        break;
    case 'ionic':
        break;
    case 'cordova':
        break;
    case 'exit':
        exitWithMessage(null)
        break;
    default:
        console.log(selectedPlatform)
}
