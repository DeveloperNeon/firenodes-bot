import { Command } from "../util/command";

export default {
    names: ["hello"],
    run: async (ev) => {
        const { message: msg, args, client: cl } = ev;
        return msg.reply(`Hello, ${msg.author.username}`);
    },
} as Command;
