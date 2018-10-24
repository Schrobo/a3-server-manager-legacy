/**
 * V0.1
 *
 * Problem: Der ArmA 3 Server soll installiert und gestartet werden können
 * Lösung: Nutze Node.js, um den Server über das CLI zu installieren und
 * zu starten.
 *  */

const fs = require('fs');
const { execSync  } = require('child_process');
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
    execSyncCommand (`./steamcmd.sh \
    +login "${username}" "${password}" \
    +force_install_dir ./serverfiles/ \
    +app_update 233780 validate +quit \ `);
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
}

if (args[0] === 'update') {
    update(args[1], args[2]);
}