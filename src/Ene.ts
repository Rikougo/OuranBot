import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types";
import { Client, CommandInteraction, Intents, Interaction } from "discord.js";
import { readFileSync } from "fs";
import { AudioManager } from "./lib/AudioManager";
import { Command } from "./lib/commands/Command";
import { CommandManger } from "./lib/commands/CommandManager";

import { Play, Skip, Pause, Resume, Leave, Queue } from "./lib/commands/Music";
// import { Ping } from "./lib/commands/utils/Ping";

export class Ene extends Client {
    public owner : string;
    public prefix : string;

    public command_manager : CommandManger;
    public audio_manager : AudioManager;

    private commands : Command[] = [
        new Play(),
        new Queue(),
        new Skip(),
        new Pause(),
        new Resume(),
        new Leave()
    ];

    private _token: string;
    private _client_id: string;
    public readonly _youtube_key: string;

    constructor() {
        super({intents: [
            Intents.FLAGS.GUILDS, 
            Intents.FLAGS.GUILD_MEMBERS, 
            Intents.FLAGS.GUILD_VOICE_STATES, 
            Intents.FLAGS.GUILD_MESSAGES, 
            Intents.FLAGS.DIRECT_MESSAGES
        ]});

        this.owner = "577083075570434058";
        this.prefix = "?";

        this.command_manager = new CommandManger();
        this.audio_manager = new AudioManager();

        let {token, client_id, youtube_key} = require("../config/secret.json");

        this._token = token;
        this._client_id = client_id;
        this._youtube_key = youtube_key;
    }

    run() : void {
        this._load_commands();
        this._load_events();

        this.login(this._token);
    }

    private _load_commands() {
        this.commands.forEach((c:Command) => {
            this.command_manager.addCommand(c.name, c);
            console.log(`Loaded ${c.name} command !`);
        });
    };
    private async _load_events() {
        this.on("interactionCreate", async (interaction: Interaction) => {
            if (interaction.isCommand()) {
                const command : Command | undefined = this.command_manager.getCommand(interaction.commandName);
    
                if (!command)
                    return;
    
                try {
                    await command.run(this, interaction);
                } catch (error) {
                    console.error(error);
                    if (interaction.replied) {
                        await interaction.followUp({content : 'There was an error while executing this command !\n ```\n' +  error +'\n```', ephemeral : true});
                    } else {
                        await interaction.reply(
                            {content : 'There was an error while executing this command !\n ```\n' +  error +'\n```', ephemeral : true});
                    }
                }
            } else if (interaction.isButton()) {
                this.audio_manager.select_holded(this, interaction);
            }
        });
    };

    public async register() {
        const rest : REST = new REST({version: '9'}).setToken(this._token);

        let commands_body : SlashCommandBuilder[] = this.commands.map((c: Command) => {
            console.log(`Adding ${c.name} to commands body.`);
            return c.getCommandBuilder();
        });

        await rest.put(`/applications/${this._client_id}/commands`, {body: commands_body});
    }
}