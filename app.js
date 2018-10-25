/** ################################################# */
/** ############### Settings begin here ############# */

// Directories
const serverDir = `./serverfiles/`;
const workshopDir = `steamapps/workshop/content/107410/`

// Mods
const mods = {
    "@cba_a3": "450814997",
    "@ace": "463939057"
}

// Server mods
const serverMods = {}

/** ############### Settings end here ############### */
/** ################################################# */

const fs = require('fs');
const { execSync } = require('child_process');
const execSyncCommand = command => execSync(command, {stdio:[0,1,2]});

// Arguments passed by user
const args = process.argv.slice(2);

const checkRequirements = (username, password) => {
    if (process.platform !== 'linux') {
        throw new Error("Your operating system is not linux!");
    }

    if (username | password == null) {
        throw new Error(`No username or password provided!
        Use 'install "USERNAME" "PASSWORD"'`);
    }
}

const updateArmA3 = (username, password) => {
    execSyncCommand (`./steamcmd.sh +login "${username}" "${password}" +force_install_dir ${serverDir} +app_update 233780 validate +quit`);
}

const updateMods = (username, password) => {
    let modList = ' ';
    for (let mod in mods) {
        console.log(`Modname: ${mod} --> ID: ${mods[mod]}`)
        modList += `+workshop_download_item 107410 ${mods[mod]} `;
    }
    execSyncCommand (`./steamcmd.sh +login "${username}" "${password}" +force_install_dir ${serverDir} ${modList} validate +quit`);
    // lowercaseMods();
    copyKeys();
}

// const lowercaseMods = () => {
//     // find ./serverfiles/steamapps/workshop/content/107410/ -depth -exec rename 's/(.*)\/([^\/]*)/$1\/\L$2/' {} \;
//     execSyncCommand(`find ${serverDir}${workshopDir} -depth -exec rename 's/(.*)\/([^\/]*)/$1\/\L$2/' {} \\;`);
// }

const copyKeys = () => {
    for (let mod in mods) {
        execSyncCommand(`cp -r ${serverDir}${workshopDir}${mods[mod]}/keys/. ${serverDir}keys/`)
    }
    for (let mod in serverMods) {
        execSyncCommand(`cp -r ${serverDir}${workshopDir}${serverMods[mod]}/keys/. ${serverDir}keys/`)
    }
}

const returnModParameter = () => {
    let parameter = '\\;';
    for (let mod in mods) {
        console.log(`Modname: ${mod} --> ID: ${mods[mod]}`)
        parameter += `${workshopDir}${mods[mod]}\;`;
    }
    return parameter;
}

const returnServerModParameter = () => {
    let parameter = '\\;';
    for (let mod in serverMods) {
        console.log(`Modname: ${mod} --> ID: ${serverMods[mod]}`)
        parameter += `${workshopDir}${serverMods[mod]}\\;`;
    }
    return parameter;
}

/**
 * Command: install
 */

const install = (username, password) => {
    checkRequirements(username, password);

    // Requirements for server and installation
    const requirements =
        `lib32gcc1 \
        lib32z1 \
        lib32ncurses5 \
        lib32gcc1 \
        lib32stdc++6 \
        curl \
        tar \
        rename \
        screen \ `;

    // Install requirements
    execSyncCommand (`sudo apt-get update && sudo apt-get install ${requirements} -y`);

    // Download and extract SteamCMD
    execSyncCommand (`curl -sqL "https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz" | tar zxvf -`);

    updateArmA3(username, password);
    updateMods(username, password);
}

if (args[0] === 'install') {
    install(args[1], args[2]);
}

/**
 * Command: update
 */

const update = (username, password) => {
    checkRequirements(username, password);

    updateArmA3(username, password);
    updateMods(username, password);
}

if (args[0] === 'update') {
    update(args[1], args[2]);
}

/**
 * Command: start
 */

const start = () => {
    const modParameter = returnModParameter();
    const serverModParameter = returnServerModParameter();

    const serverParameter = `./arma3server -name=Server -cfg=cfg/arma3server.network.cfg -config=cfg/arma3server.server.cfg -mod=${modParameter} -serverMod=${serverModParameter}`;
    console.log('Running:' + serverParameter);

    execSyncCommand(`screen -dmS arma3server && screen -S arma3server -X stuff 'cd ${serverDir} && ${serverParameter}\n'`);
}

if (args[0] === 'start') {
    start();
}