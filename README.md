# A3 Server Manager (WIP)

## Introduction

A3 Server Manager is a simple to use server manager for your ArmA 3 server and mods on Linux. It is build with Node.js and runs from your terminal.

#### Don't run this as root!

*Create a user or switch the user before you use this tool.*

```
$ adduser --gecos "" steam && \
usermod -aG sudo steam && \
su steam && \
cd ~ \
```

## How to use

### Installation

#### 1. Install Node.js (with [NVM](https://github.com/creationix/nvm#install-script))

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

#### Install server

```
$ node app.js install "USERNAME" "PASSWORD"
```

#### Update server

```
$ node app.js update "USERNAME" "PASSWORD"
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
- [ ] ArmA 3 mod installation
- [X] SteamCMD updates
- [X] ArmA 3 server updates
- [ ] ArmA 3 mod updates
- [ ] ArmA 3 mod settings
- [ ] Copy ArmA 3 keys
- [ ] Start ArmA 3 server

#### Commands

- [X] node app.js install "USERNAME" "PASSWORD"
- [X] node app.js update "USERNAME" "PASSWORD"
- [ ] node app.js start

#### Mods settings

- [ ] Modlist inside a JSON file:

```JSON
[
    {"@CBA_A3": "450814997"},
    {"@ACE": "463939057"}
]
```

### V2.0

#### Features

- [ ] Run on all OS

### V3.0

#### Features

- [ ] Run in GUI and CLI