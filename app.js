const fs = require('fs');
const { execSync } = require('child_process');
const execSyncCommand = command => execSync(command, {stdio:[0,1,2]});
const { spawn } = require('child_process');

// Arguments passed by user
const args = process.argv.slice(2);

// Directories
const serverDir = `./`;
const modsDir = `${serverDir}mods/`
const workshopDir = `${serverDir}steamapps/workshop/content/107410/`

// Mods
const mods = [
    {"@CBA_A3": "450814997"},
    {"@ACE": "463939057"}
]

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
    let modList;
    mods.forEach((mod) => {
        for (let modName in mod) {
            console.log(`Modname: ${modName} --> ID: ${mod[modName]}`)
            modList += `+workshop_download_item 107410 ${mod[modName]} `;
        }
    });
    execSyncCommand (`./steamcmd.sh +login "${username}" "${password}" +force_install_dir ${serverDir} ${modList} validate +quit`);
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
        rename \ `;

    // Install requirements
    execSyncCommand (`sudo apt-get update && sudo apt-get install ${requirements} -y`);

    // Download and extract SteamCMD
    execSyncCommand (`curl -sqL "https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz" | tar zxvf -`);

    // Run SteamCMD using credentials and install ArmA 3 server
    updateArmA3(username, password);
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
    spawn(`${serverDir}arma3server`, [''], {
        detached: true,
        stdio: 'ignore'
    }).unref();;
}

if (args[0] === 'start') {
    start();
}