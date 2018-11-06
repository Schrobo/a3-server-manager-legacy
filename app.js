const fs = require('fs');
const { execSync } = require('child_process');

// Directory where server should be installed
const serverDir = `./serverfiles/`;

// File containing profiles
const profilesFile = `./profiles.json`;

// Directory where mods are stored
const workshopDir = `steamapps/workshop/content/107410/`

// Arguments passed by user
const args = process.argv.slice(2);

/**
 * Functions
 */

const execSyncCommand = command => execSync(command, {stdio:[0,1,2]});

const checkRequirements = () => {
    if (process.platform !== 'linux') {
        throw new Error("Your operating system is not linux!");
    }
}

const checkArgs = () => {
    // if (username | password == null) {
    //     throw new Error(`No username or password provided!
    //     Use 'install "USERNAME" "PASSWORD"'`);
    // }
}

// Return string (part of command) for update server or mods
const returnUpdateCommand = (updateType) => {
    let cmd = `./steamcmd.sh `
    if (updateType === 'updateServer') {
        // return update Server
        cmd += `+login "${username}" "${password}" +force_install_dir ${serverDir} +app_update 233780 validate +quit`;
    }
    if (updateType === 'updateMods') {
        // return update Mods
        cmd += `+login "${username}" "${password}" +force_install_dir ${serverDir} ${modList} validate +quit`;
    }
    if (updateType === 'updateAll') {
        // return update Server Mods
        cmd += `+login "${username}" "${password}" +force_install_dir ${serverDir} +app_update 233780 validate ${modList} +quit`;
    }
    else {
        throw new Error("What do you want to update?");
    }
}

const updateArmA3 = (username, password) => {
    execSyncCommand (`./steamcmd.sh +login "${username}" "${password}" +force_install_dir ${serverDir} +app_update 233780 validate +quit`);
}

const copyTemplates = () => {
    execSyncCommand (`cp -r ./templates/. ${serverDir}`);
}

const updateMods = (username, password) => {
    let modList = ' ';
    for (let mod in mods) {
        console.log(`Modname: ${mod} --> ID: ${mods[mod]}`)
        modList += `+workshop_download_item 107410 ${mods[mod]} `;
    }
    execSyncCommand (`./steamcmd.sh +login "${username}" "${password}" +force_install_dir ${serverDir} ${modList} validate +quit`);
    lowercaseMods();
    copyKeys();
}

const lowercaseMods = () => {
     execSyncCommand(`find ${serverDir}${workshopDir} -depth -exec rename 's/(.*)\\/([^\\/]*)/$1\\/\\L$2/' {} \\;`);
}

const copyKeys = () => {
    for (let mod in mods) {
        execSyncCommand(`cp -r ${serverDir}${workshopDir}${mods[mod]}/keys/. ${serverDir}keys/`)
    }
}

const returnModParameter = () => {
    let parameter = '\\;';
    for (let mod in mods) {
        console.log(`Modname: ${mod} --> ID: ${mods[mod]}`)
        parameter += `${workshopDir}${mods[mod]}\\;`;
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
    checkRequirements();

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
    copyTemplates();
    updateMods(username, password);
}

if (args[0] === 'install') {
    install(args[1], args[2]);
}

/**
 * Command: update
 */

const update = (username, password) => {
    checkRequirements();

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

    const startupCommand = `./arma3server -name=server -cfg=cfg/arma3server.network.cfg -config=cfg/arma3server.server.cfg -mod=${modParameter} -serverMod=${serverModParameter}`;

    // Create file containing startupCommand.
    fs.writeFile(`${serverDir}start.sh`, startupCommand, function (err) {
        if (err) throw err;
        execSyncCommand(`chmod u+x ${serverDir}start.sh`);
    });

    execSyncCommand(`screen -dmS arma3server && screen -S arma3server -X stuff 'cd ${serverDir} && ./start.sh \n'`);
}

if (args[0] === 'start') {
    start();
}