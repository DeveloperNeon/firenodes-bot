import { Client, Collection, TextChannel } from "discord.js";
import dotenv from "dotenv";
import config from "./config";
import { readdir } from "fs";
import { Command, RunEvent } from "./util/command";

dotenv.config();

config.validate(true);

const client = new Client();

const commands: Collection<
    string[],
    (event: RunEvent) => any
> = new Collection();

readdir(`${__dirname}/commands`, (err, allFiles) => {
    if (err) console.log(err);
    let files = allFiles.filter(
        (f) =>
            f.split(".").pop() ===
            (config.toObject().NODE_ENV === "dev" ? "ts" : "js")
    );
    if (files.length <= 0) console.log("No commands found!");
    else
        for (let file of files) {
            import(`${__dirname}/commands/${file}`)
                .then((res) => {
                    return res.default;
                })
                .then((props: Command) => commands.set(props.names, props.run));
        }
});

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on("message", async (message) => {
    if (
        message.channel.type === "dm" ||
        message.author.bot ||
        !message.content.startsWith(config.toObject().PREFIX)
    )
        return;

    const args = message.content.split(/ +/);
    if (args.length < 1) return;
    const command = args
        .shift()!
        .toLowerCase()
        .slice(config.toObject().PREFIX.length);
    const commandFile = commands.find((_r, n) =>
        n.includes(command.toLowerCase())
    );
    if (!commandFile) return await message.channel.send("Invalid command!");
    else if (
        (await commandFile({
            message,
            args,
            client,
            dev: config.toObject().NODE_ENV === "dev",
        })) === false
    )
        return await message.channel.send(
            "An error occurred while executing this command."
        );
    process.on(
        "unhandledRejection",
        async (err) => await message.channel.send(err)
    );
});

if (config.toObject().NODE_ENV === "dev") {
    client.on("debug", (e) => {
        console.log(e);
    });
}

client.on(
    "raw",
    (packet: {
        t: string;
        d: {
            channel_id: string;
            message_id: string;
            emoji: { id: string; name: string };
            user_id: string;
        };
    }) => {
        if (
            !["MESSAGE_REACTION_ADD", "MESSAGE_REACTION_REMOVE"].includes(
                packet.t
            )
        )
            return;
        const channel = client.channels.cache.get(
            packet.d.channel_id
        ) as TextChannel;
        if (channel.messages.cache.has(packet.d.message_id)) return;
        channel.messages.fetch(packet.d.message_id).then((message) => {
            const emoji = packet.d.emoji.id
                ? `${packet.d.emoji.name}:${packet.d.emoji.id}`
                : packet.d.emoji.name;
            const reaction = message.reactions.cache.get(emoji);
            if (reaction)
                reaction.users.cache.set(
                    packet.d.user_id,
                    client.users.cache.get(packet.d.user_id)!
                );
            if (packet.t === "MESSAGE_REACTION_ADD") {
                client.emit(
                    "messageReactionAdd",
                    reaction,
                    client.users.cache.get(packet.d.user_id)
                );
            }
            if (packet.t === "MESSAGE_REACTION_REMOVE") {
                client.emit(
                    "messageReactionRemove",
                    reaction,
                    client.users.cache.get(packet.d.user_id)
                );
            }
        });
    }
);

if (config.toObject().TOKEN) client.login(config.toObject().TOKEN);
else {
    console.log("Create a file called .env and put your bot's token in there.");
    process.exit(1);
}
