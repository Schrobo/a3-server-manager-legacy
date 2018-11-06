const fs = require('fs');
const { execSync } = require('child_process');

// Directory where server should be installed
const serverDir = `./serverfiles/`;

// File containing profiles
const profilesFile = `./profiles.json`;

// Directory where templates are stored
const templateDir = `./templates/`

// Directory where mods are stored
const workshopDir = `steamapps/workshop/content/107410/`

// Arguments passed by user
const args = process.argv.slice(2);

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

// Return profiles content
const profile = (name) => {
    let data = fs.readFileSync(`${profilesFile}`).JSON.parse;
    return data
}

// Return mod lists for SteamCMD update
const returnUpdateModList = (modType) => {
    let modList = ' ';
    console.log(`Updating mods:`)
    for (let mod in modType) {
        console.log(`Modname: ${mod} --> ID: ${modType[mod]}`)
        modList += `+workshop_download_item 107410 ${modType[mod]} `;
    }
    return modList
}

// Return mod lists for server start
const returnModList = (modType) => {
    let modParameter = '\\;';
    console.log(`Launching with mods:`)
    for (let mod in modType) {
        console.log(`Modname: ${mod} --> ID: ${modType[mod]}`)
        modParameter += `${workshopDir}${modType[mod]}\\;`;
    }
    return modParameter;
}

// Return command for update server and/or mods via SteamCMD
const returnUpdateCommand = (updateType) => {
    let updateCommand = `./steamcmd.sh `
    if (updateType === 'updateServer') {
        // return update Server
        updateCommand += `+login "${username}" "${password}" +force_install_dir ${serverDir} +app_update 233780 validate +quit`;
    }
    if (updateType === 'updateMods') {
        // return update Mods
        updateCommand += `+login "${username}" "${password}" +force_install_dir ${serverDir} ${modList} +quit`;
    }
    if (updateType === 'updateAll') {
        // return update Server Mods
        updateCommand += `+login "${username}" "${password}" +force_install_dir ${serverDir} +app_update 233780 validate ${modList} +quit`;
    }
    else {
        throw new Error("Something went wrong while trying to update!");
    }
    return updateCommand;
}

const copyTemplates = () => {
    execSyncCommand (`cp -r ${templateDir}. ${serverDir}`);
}

const lowercaseMods = () => {
     execSyncCommand(`find ${serverDir}${workshopDir} -depth -exec rename 's/(.*)\\/([^\\/]*)/$1\\/\\L$2/' {} \\;`);
}

const copyKeys = (modType) => {
    for (let mod in modType) {
        execSyncCommand(`cp -r ${serverDir}${workshopDir}${modType[mod]}/keys/. ${serverDir}keys/`)
    }
}

/**
 * Command: install
 */

const install = () => {
    checkRequirements();

    // Install requirements
    execSyncCommand (`sudo apt-get update && sudo apt-get install ${requirements} -y`);

    // Download and extract SteamCMD
    execSyncCommand (`curl -sqL "https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz" | tar zxvf -`);

    copyTemplates();
}

if (args[0] === 'install') {
    install();
}

/**
 * Command: update
 */

const update = (username, password) => {
    checkRequirements();

    updateServer(username, password);
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