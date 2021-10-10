import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Ene } from "../../Ene";
import { Command } from "./Command";

export class Play implements Command {
    description: string = "Play the song you want (using youtube)";
    name: string = "play";

    async run(client: Ene, interaction: CommandInteraction): Promise<void> {
        client.audio_manager.play(client, interaction);
    }
    getCommandBuilder(): SlashCommandBuilder {
        let data : SlashCommandBuilder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option =>
                option.setRequired(true).setName('song').setDescription('URL (youtube) or song name that you want')) as SlashCommandBuilder;

        return data;
    }
}

export class Queue implements Command {
    name: string = "queue";
    description: string = "What's next ?";
    async run(client: Ene, interaction: CommandInteraction): Promise<void> {
        client.audio_manager.queue(client, interaction);
    }
    getCommandBuilder(): SlashCommandBuilder {
        let data : SlashCommandBuilder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)

        return data;
    }
}

export class Skip implements Command {
    description: string = "Skip this shit";
    name: string = "skip";
    async run(client: Ene, interaction: CommandInteraction): Promise<void> {
        client.audio_manager.skip(client, interaction);
    }
    getCommandBuilder(): SlashCommandBuilder {
        let data : SlashCommandBuilder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)

        return data;
    }
}

export class Pause implements Command {
    description: string = "Hold a sec'"
    name: string = "pause";
    async run(client: Ene, interaction: CommandInteraction): Promise<void> {
        client.audio_manager.pause(client, interaction);
    }
    getCommandBuilder(): SlashCommandBuilder {
        let data : SlashCommandBuilder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)

        return data;
    }
}

export class Resume implements Command {
    description: string = "Finally..."
    name: string = "resume";
    async run(client: Ene, interaction: CommandInteraction): Promise<void> {
        client.audio_manager.resume(client, interaction);
    }
    getCommandBuilder(): SlashCommandBuilder {
        let data : SlashCommandBuilder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)

        return data;
    }
}

export class Leave implements Command {
    description: string = "No you won't get me out fuc-"
    name: string = "leave";
    async run(client: Ene, interaction: CommandInteraction): Promise<void> {
        client.audio_manager.leave(client, interaction);
    }
    getCommandBuilder(): SlashCommandBuilder {
        let data : SlashCommandBuilder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)

        return data;
    }
}