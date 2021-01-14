import {
    Message,
    MessageEmbed,
    MessageReaction,
    TextChannel,
    User,
} from "discord.js";

export const getQueueId = (channel: TextChannel) =>
    `${channel.guild.id}-${channel.id}`;

export const paginate = async <T>(
    message: Message,
    opts: {
        limit?: number;
        embedGenerator: (value: T[], index: number) => Promise<MessageEmbed>;
        queues: Map<string, unknown[]>
    }
) => {
    let currentPage = 0;
    const embeds = await paginateEmbed(
        message.channel as TextChannel,
        opts.embedGenerator,
        opts
    );

    const queueEmbed = await (message.channel as TextChannel).send(
        embeds[currentPage].setFooter(
            `Current Page: ${currentPage + 1}/${embeds.length}`
        )
    );
    await queueEmbed.react("⬅️");
    await queueEmbed.react("➡️");
    await queueEmbed.react("❌");

    const filter = (reaction: MessageReaction, user: User) =>
        ["⬅️", "➡️", "❌"].includes(reaction.emoji.name) &&
        message.author.id === user.id;

    const collector = queueEmbed.createReactionCollector(filter);

    collector.on("collect", async (reaction: MessageReaction, user: User) => {
        if (reaction.emoji.name === "➡️") {
            if (currentPage < embeds.length - 1) {
                currentPage++;
                queueEmbed.edit(
                    embeds[currentPage].setFooter(
                        `Current Page: ${currentPage + 1}/${embeds.length}`
                    )
                );
                reaction.users.remove(user.id);
            }
        } else if (reaction.emoji.name === "⬅️") {
            if (currentPage !== 0) {
                --currentPage;
                queueEmbed.edit(
                    embeds[currentPage].setFooter(
                        `Current Page: ${currentPage + 1}/${embeds.length}`
                    )
                );
                reaction.users.remove(user.id);
            }
        } else {
            collector.stop();
            await queueEmbed.delete();
        }
    });
    return queueEmbed;
};

export const paginateEmbed = async <T>(
    channel: TextChannel,
    embedGenerator: (values: T[], index: number) => Promise<MessageEmbed>,
    opts: { limit?: number; queues: Map<string, unknown[]> }
) => {
    const embeds: MessageEmbed[] = [];
    const id = getQueueId(channel);
    if (!opts.queues.has(id)) opts.queues.set(id, []);
    const queue = opts.queues.get(id);
    if (!opts.limit) opts.limit = 3;
    let k = opts.limit;
    for (let i = 0; i < queue.length; i += opts.limit) {
        const current = queue.slice(i, k);
        let j = i;
        k += opts.limit;

        embeds.push(await embedGenerator(current as T[], j++));
    }
    return embeds;
};
