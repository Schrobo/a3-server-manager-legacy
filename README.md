# A3 Server Manager (WIP)

A3 Server Manager is a simple to use server manager for your ArmA 3 server and mods on Linux. It is build with Node.js and runs from your terminal.

## How to use

### Installation

#### IMPORTANT: Don't run this as root!

```
$ adduser --gecos "" steam && \
usermod -aG sudo steam && \
su steam && \
cd ~ \
```

#### 1. Install Node.js (Recommended: [NVM](https://github.com/creationix/nvm#install-script))

```
$ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
$ nvm install --lts
$ nvm use --lts
```

#### 2. Clone repo

```
$ git clone https://github.com/schrobo/a3-server-manager.git
```

### Commands

#### Install dependencies, server and mods

```
$ node app.js install "USERNAME" "PASSWORD"
```

#### Update server and mods

```
$ node app.js update "USERNAME" "PASSWORD"
```

#### Manually rename (lowercase) mods
```
find ./serverfiles/steamapps/workshop/content/107410/ -depth -exec rename 's/(.*)\/([^\/]*)/$1\/\L$2/' {} \;
```

#### Start server

```
$ node app.js start
```

## Roadmap

### V1.0

#### Features

- [X] SteamCMD installation
- [X] ArmA 3 server installation
- [X] ArmA 3 mod installation
- [X] SteamCMD updates
- [X] ArmA 3 server updates
- [X] ArmA 3 mod updates
- [X] ArmA 3 mod settings
- [X] ArmA 3 mod lowercase
- [X] Copy ArmA 3 keys
- [X] Start ArmA 3 server
- [X] Start ArmA 3 server with mods

#### Commands

- [X] node app.js install "USERNAME" "PASSWORD"
- [X] node app.js update "USERNAME" "PASSWORD"
- [X] node app.js start

#### Mods settings

- [X] Mod configuration inside app.js:

```
{
    "@CBA_A3": "450814997",
    "@ACE": "463939057"
}
```

### V2.0

#### Features

- [ ] Easier and more intuitive operation
- [ ] "Profiles" for different server configurations
- [ ] Run profile as headless client
- [ ] "Advanced"/Better commands

#### Commands

- [ ] node app.js install [username] [password]
- [ ] node app.js update [username] [password] [profile] -s/-m/-a
- [ ] node app.js start [profile] (-hc)

#### Mods settings

- [X] Mod configuration inside {profiledir}/{profile}/mod.json:

```
// Mods
const mods = {
    "@cba": "450814997",
    "@ace": "463939057"
}

// Server mods
const serverMods = {
    "@vcom_ai": "721359761"
}
```

### V3.0

#### Features

- [ ] Run on all OS

### V4.0

#### Features

- [ ] Run in GUI and CLI
