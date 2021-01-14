import { Message, MessageEmbed, TextChannel } from "discord.js";
import { ServerModel, UserModel } from "pterodactyl.js";
import { findUserById } from "../modules/ptero";
import { getQueueId, paginate } from "./pagination";

const users = new Map<string, UserModel[]>();
const servers = new Map<string, ServerModel[]>();

export const createServersEmbed = async (
    message: Message,
    data: ServerModel[],
    owner?: string
) => {
    servers.set(getQueueId(message.channel as TextChannel), data);
    await paginate<ServerModel>(message, {
        limit: 2,
        queues: servers,
        embedGenerator: async (servers) => {
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
                        name: "Server ID",
                        value: s.identifier,
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

export const createUsersEmbed = async (
    message: Message,
    data: UserModel[]
) => {
    users.set(getQueueId(message.channel as TextChannel), data);
    await paginate<UserModel>(message, {
        limit: 2,
        queues: users,
        embedGenerator: async (servers) => {
            const embed = new MessageEmbed();
            embed
                .setTitle(
                    "Users List"
                )
                .setColor("green");
            for (let s of servers) {
                embed.addFields([
                    { name: "Full Name", value: s.fullName },
                    {
                        name: "User ID",
                        value: s.id,
                        inline: true,
                    },
                    {
                        name: "Username",
                        value: s.username,
                        inline: true,
                    },
                ]);
            }
            return embed;
        },
    });
};
