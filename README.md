# @flowtr/firenodes-bot

This is a discord bot written with discord.js and typescript that is made open source. This bot allows you to manage pterodactyl panel servers.

## Invite

WIP

## Developer Documentation

### Getting Started

First you'll want to create a .env file containing some environment variables that are required for the bot to function.

```
PTERO_URI=http://panel.example.com
PTERO_KEY=1234
TOKEN=1234
PREFIX=-
```

The token is the discord bot token.

### Commands

Each command will be followed by an optional config file prefix (defaults to "-"). The current commands that are in the bot are `admin`. 

#### Admin Command

This command has a few arguments. The first one being the command category, which can be any of the following: `servers`. 
Following this is the subcommand which can be any of the following: `list`.
The last few arguments depend on the category and subcommand, but for servers it is optional as it is the query for the user to filter servers by.
Example:
```
-admin servers list
```
