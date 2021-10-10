import Collection from "@discordjs/collection";
import { Command } from "./Command";

export class CommandManger {
    private _commands : Collection<string, Command>;

    constructor() {this._commands = new Collection()};

    addCommand(name: string, command: Command) {
        this._commands.set(name, command);
    } 

    getCommand(name: string) : Command | undefined {
        return this._commands.get(name);
    }
}