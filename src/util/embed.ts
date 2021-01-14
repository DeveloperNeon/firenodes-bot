import { Message, MessageEmbed, TextChannel } from "discord.js";
import { ServerModel } from "pterodactyl.js";
import { findUserById, ptero } from "../modules/ptero";
import { getQueueId, paginate, queues } from "./pagination";

export const createServersEmbed = async (
    message: Message,
    servers: ServerModel[],
    owner?: string
) => {
    queues.set(getQueueId(message.channel as TextChannel), servers);
    await paginate<ServerModel>(message, {
        limit: 2,
        embedGenerator: async (servers, index) => {
            const embed = new MessageEmbed();
            embed
                .setTitle(
                    `Servers ${
                        owner && owner.trim() !== "" ? `For: ${owner}` : ""
                    }`
                )
                .setColor("green");
            for (let s of servers) {
                embed.addFields([
                    { name: "Server Name", value: s.name },
                    {
                        name: "Server Owner",
                        value: owner || (await findUserById(s.user))?.fullName,
                        inline: true,
                    },
                    {
                        name: "Updated At",
                        value: s.updatedAt.toLocaleDateString(),
                        inline: true,
                    },
                    {
                        name: "Egg",
                        value: s.egg,
                        inline: true,
                    },
                ]);
            }
            return embed;
        },
    });
};
