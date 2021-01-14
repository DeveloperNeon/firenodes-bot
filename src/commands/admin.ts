import { findUser, ptero } from "../modules/ptero";
import { Command } from "../util/command";
import { createServersEmbed } from "../util/embed";
import { filter } from "../util/utils";

export default {
    names: ["ad", "admin", "adm"],
    run: async (ev) => {
        const { message: msg, args, client: cl } = ev;
        if (args.length < 1)
            return msg.channel.send("Invalid command arguments!");
        const commandCategory = args[0];
        if (!args[1]) return msg.channel.send("Not enough arguments.");
        const subCommand = args[1];
        if (subCommand === "list")
            switch (commandCategory) {
                case "servers":
                    const servers = await ptero.getServers();
                    if (!args[2]) {
                        return await createServersEmbed(msg, servers);
                    } else {
                        const newServers = await filter(
                            servers,
                            async (s) =>
                                s.user ===
                                (
                                    (await findUser(args[2])) ?? {
                                        id: -1,
                                    }
                                ).id
                        );
                        return await createServersEmbed(
                            msg,
                            newServers,
                            args[2]
                        );
                    }
                default:
                    return msg.channel.send("Invalid command category.");
            }
        else return msg.channel.send("Invalid subcommand");
    },
} as Command;
