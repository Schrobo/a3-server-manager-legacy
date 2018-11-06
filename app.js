const fs = require('fs');
const { execSync } = require('child_process');

// Directory where server should be installed
const serverDir = `./serverfiles/`;

// File containing settings
const settingsFile = `./settings.json`;

// Directory where templates are stored
const templateDir = `./templates/`;

// Directory where mods are stored
const workshopDir = `steamapps/workshop/content/107410/`;

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

const checkPlatform = () => {
    if (process.platform !== 'linux') {
        throw new Error("Your operating system has to be linux!");
    }
}

// Return settings content
const returnSettingsData = (name) => {
    let data = fs.readFileSync(`${settingsFile}`);
    data = JSON.parse(data);
    return data;
}

// Return mod lists for SteamCMD update
const returnUpdateModList = (modType) => {
    let modList = ' ';
    console.log(`Updating mods:`)
    for (let mod in modType) {
        console.log(`Modname: ${mod} --> ID: ${modType[mod]}`)
        modList += `+workshop_download_item 107410 ${modType[mod]} `;
    }
    return modList;
}

// Return mod lists for server start
const returnModList = (modType) => {
    let modList = '\\;';
    console.log(`Launching with mods:`)
    for (let mod in modType) {
        console.log(`Modname: ${mod} --> ID: ${modType[mod]}`)
        modList += `${workshopDir}${modType[mod]}\\;`;
    }
    return modList;
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
    return updateCommand;
}

const copyTemplates = () => {
    console.log(`Copying templates from "${templateDir}" to "${serverDir}"`);
    execSyncCommand (`cp -r ${templateDir}. ${serverDir}`);
}

const lowercaseMods = () => {
    console.log(`Lowercasing mods... (This might take a while!)`);
    execSyncCommand(`find ${serverDir}${workshopDir} -depth -exec rename 's/(.*)\\/([^\\/]*)/$1\\/\\L$2/' {} \\;`);
}

const copyKeys = (modType) => {
    console.log(`Copying keys from "${serverDir}${workshopDir}${modType[mod]}/keys/" to "${serverDir}keys/"`);
    for (let mod in modType) {
        execSyncCommand(`cp -r ${serverDir}${workshopDir}${modType[mod]}/keys/. ${serverDir}keys/`)
    }
}

/**
 * Command: install
 */

const install = () => {
    checkPlatform();

    // Install requirements
    execSyncCommand (`sudo apt-get update && sudo apt-get install ${requirements} -y`);

    // Download and extract SteamCMD
    execSyncCommand (`curl -sqL "https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz" | tar zxvf -`);

    copyTemplates();
}

/**
 * Command: update
 */

const update = (username, password) => {
    checkPlatform();

    updateServer(username, password);
    updateMods(username, password);
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

/**
 * Execution
 */

if (args[0] == null) {
    console.log(`
        \x1b[1mCommands:\x1b[0m

        Install manager
        $ node app.js install

        Update server and mods
        $ node app.js update [username] [password] [profile]

        Update server
        $ node app.js update [username] [password] [profile] -s

        Update mods
        $ node app.js update [username] [password] [profile] -m

        #### Start server
        $ node app.js start [profile]

        #### Start headless client
        $ node app.js start [profile] -hc
    `);
}
if (args[0] === 'install') {
    // install();
}
if (args[0] === 'update') {
    // update();
}
if (args[0] === 'start') {
    // start();
}