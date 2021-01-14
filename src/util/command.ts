import { Client, Message } from "discord.js";

export interface RunEvent {
    message: Message;
    client: Client;
    args: string[];
    dev: boolean;
}

export interface Command {
    names: string[];
    run: (event: RunEvent) => Promise<Message | false>;
}
