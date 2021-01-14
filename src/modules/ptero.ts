import config from "../config";
import { Builder } from "pterodactyl.js";

export const ptero = new Builder()
    .setURL(config.toObject().PTERO_URI)
    .setAPIKey(config.toObject().PTERO_KEY)
    .asAdmin();

export const findUser = async (query: string) => {
    return (await ptero.getUsers()).find(
        (u) =>
            u.firstName === query ||
            u.lastName === query ||
            u.fullName === query ||
            u.email === query
    );
};

export const findUserById = async (query: number) => {
    return (await ptero.getUsers()).find((u) => u.id === query);
};
