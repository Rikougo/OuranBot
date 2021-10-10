import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Interaction } from "discord.js";
import { Ene } from "../../Ene";

export interface Command {
    name : string;
    description: string;

    run(client: Ene, interaction: CommandInteraction) : Promise<void>;
    getCommandBuilder(): SlashCommandBuilder;
}