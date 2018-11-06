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
        throw new Error('Your operating system has to be linux!');
    }
}

// Return specific setting from settings
const returnSettings = (name, profile) => {
    const readSettings = () => {
        let settings = fs.readFileSync(`${settingsFile}`);
        settings = JSON.parse(settings);
        return settings;
    }
    let settings = readSettings();
    if (name === 'steamUsername' || name === 'steamPassword') {
        return settings[name];
    }
    if (name === 'updateModList' && profile) {
        let output = returnUpdateModList(settings['profiles']
            .find(profiles => profiles['profile'] == profile)['mods']);
        output += returnUpdateModList(settings['profiles']
            .find(profiles => profiles['profile'] == profile)['serverMods']);
        return output;
    }
    if (name === 'modList' && profile) {
        return returnModList(settings['profiles']
            .find(profiles => profiles['profile'] == profile)['mods']);
    }
    if (name === 'serverModList' && profile) {
        return returnModList(settings['profiles']
            .find(profiles => profiles['profile'] == profile)['serverMods']);
    }
    if (name === 'modKeys' && profile) {
        return settings['profiles']
            .find(profiles => profiles['profile'] == profile)['mods'];
    }
}

// Return mod lists for SteamCMD update
const returnUpdateModList = (mods) => {
    let modList = ' ';
    console.log(`Updating mods:`)
    for (let mod in mods) {
        console.log(`Modname: ${mod} --> ID: ${mods[mod]}`)
        modList += `+workshop_download_item 107410 ${mods[mod]} `;
    }
    return modList;
}

// Return mod lists for server start
const returnModList = (mods) => {
    let modList = '\\;';
    console.log(`Launching with mods:`)
    for (let mod in mods) {
        console.log(`Modname: ${mod} --> ID: ${mods[mod]}`)
        modList += `${workshopDir}${mods[mod]}\\;`;
    }
    return modList;
}

// Return command for update server and/or mods via SteamCMD
const returnUpdateCommand = (updateType) => {
    const steamUsername = returnSettings('steamUsername');
    const steamPassword = returnSettings('steamPassword');
    const modList = returnSettings('updateModList', args[1]);

    let updateCommand = `./steamcmd.sh `
    if (updateType === '-s') {
        // return update Server
        updateCommand += `+login "${steamUsername}" "${steamPassword}" +force_install_dir ${serverDir} +app_update 233780 validate +quit`;
    }
    if (updateType === '-m') {
        // return update Mods
        updateCommand += `+login "${steamUsername}" "${steamPassword}" +force_install_dir ${serverDir} ${modList} +quit`;
    }
    if (updateType === '-a') {
        // return update Server Mods
        updateCommand += `+login "${steamUsername}" "${steamPassword}" +force_install_dir ${serverDir} +app_update 233780 validate ${modList} +quit`;
    }
    return updateCommand;
}

const copyTemplates = () => {
    execSyncCommand (`cp -r ${templateDir}. ${serverDir}`);
}

const lowercaseMods = () => {
    console.log(`Lowercasing mods... (This might take a while!)`);
    execSyncCommand(`find ${serverDir}${workshopDir} -depth -exec rename 's/(.*)\\/([^\\/]*)/$1\\/\\L$2/' {} \\;`);
}

const copyKeys = (mods) => {
    for (let mod in mods) {
        execSyncCommand(`cp -r ${serverDir}${workshopDir}${mods[mod]}/keys/. ${serverDir}keys/`)
    }
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
        $ node app.js update [profile] -a

        Update server
        $ node app.js update [profile] -s

        Update mods
        $ node app.js update [profile] -m

        #### Start server
        $ node app.js start [profile]

        #### Start headless client
        $ node app.js start [profile] -hc [ip]
    `);
}

if (args[0] === 'install') {
    checkPlatform();

    // Install requirements
    execSyncCommand (`sudo apt-get update && sudo apt-get install ${requirements} -y`);

    // Download and extract SteamCMD
    execSyncCommand (`curl -sqL "https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz" | tar zxvf -`);

    copyTemplates();
}

if (args[0] === 'update') {
    checkPlatform();
    execSyncCommand(returnUpdateCommand(args[2]));
    lowercaseMods();
    copyKeys(returnSettings('modKeys', args[1]));
}

if (args[0] === 'start') {
    if (args[2] === '-hc') { (x === undefined) ? def_val : x;
        const startupCommand = `./arma3server -name=server -client -connect=${(args[3] === undefined) ? '127.0.0.1' : args[3]} -mod=${returnSettings('modList', args[1])}`;

        // Create file containing startupCommand.
        fs.writeFile(`${serverDir}start.sh`, startupCommand, function (err) {
            if (err) throw err;
            execSyncCommand(`chmod u+x ${serverDir}start.sh`);
        });

        execSyncCommand(`screen -dmS arma3hc && screen -S arma3hc -X stuff 'cd ${serverDir} && ./start.sh \n'`);
    } else {
        const startupCommand = `./arma3server -name=server -cfg=cfg/arma3server.network.cfg -config=cfg/arma3server.server.cfg -mod=${returnSettings('modList', args[1])} -serverMod=${returnSettings('serverModList', args[1])}`;

        // Create file containing startupCommand.
        fs.writeFile(`${serverDir}start.sh`, startupCommand, function (err) {
            if (err) throw err;
            execSyncCommand(`chmod u+x ${serverDir}start.sh`);
        });

        execSyncCommand(`screen -dmS arma3server && screen -S arma3server -X stuff 'cd ${serverDir} && ./start.sh \n'`);
    }
}