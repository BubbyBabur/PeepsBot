"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmoteBot = void 0;
const discord_js_1 = require("discord.js");
const ProcessMessage_1 = require("./ProcessMessage");
const SheetsUser_1 = require("./SheetsUser");
class EmoteBot {
    constructor(auth, client) {
        this.name = "Emote Bot";
        this.alpha = `🇦 🇧 🇨 🇩 🇪 🇫 🇬 🇭 🇮 🇯 🇰 🇲 🇳 🇴 🇵 🇶 🇷 🇸 🇹 🇺 🇻 🇼 🇽 🇾 🇿`.split(` `);
        this.client = client;
        let m = new Map();
        m.set("data", "1CeljfBu-3afIfd43F5pTFWOKPIoxE8O5qlJr34XBiCI");
        this.sheetsUser = new SheetsUser_1.SheetsUser(auth, m);
    }
    onMessage(message) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!message.author.bot) {
                for (const emote of this.allEmotes) {
                    let count = 0;
                    for (let i = 0; i < message.content.length - emote.identifier.length; i++) {
                        if (message.content.slice(i, i + emote.identifier.length) === emote.identifier) {
                            count++;
                        }
                    }
                    (_a = this.emoteCount.get(emote.identifier)) === null || _a === void 0 ? void 0 : _a.add(message.author.id, count);
                }
            }
            const result = ProcessMessage_1.PROCESS(message);
            if (result) {
                if (result.command === "report") {
                    message.react("✅");
                    yield this.sheetsUser.clearSheet('data', 'Data');
                    yield this.sheetsUser.bulkUpdateRows("data", "Data", this.toShortArray().map((row, i) => { return { row, num: i }; }));
                }
                if (result.command === "runpurge" && message.member.hasPermission('ADMINISTRATOR')) {
                    let channel = yield this.client.channels.fetch("751552954518994965");
                    let list = this.leastUsed(parseInt(result.args[0]) || 10);
                    let emotelist = list.map((val, i) => `${this.alpha[i]}: <:${val.identifier}>`);
                    let len = emotelist.length;
                    let columns = [];
                    let numcolumns = 3;
                    for (let i = 0; i < numcolumns; i++) {
                        columns.push(emotelist.slice(len / numcolumns * i, len / numcolumns * (i + 1)).join('\n'));
                    }
                    // message.channel.send(emotelist);
                    let embed = {
                        title: `Emote Purge`,
                        description: `You have a voice, but no one cares. That's why you should vote for emotes that you think should **NOT** be purged.`,
                        fields: columns.map((col, i) => { return { name: `Column ${i + 1}`, value: col, inline: true }; }),
                        color: 1111111
                    };
                    if (channel instanceof discord_js_1.TextChannel) {
                        let message = yield channel.send({ embed });
                        for (let i = 0; i < len; i++) {
                            message.react(this.alpha[i]);
                        }
                    }
                }
            }
        });
    }
    onConstruct() {
        return __awaiter(this, void 0, void 0, function* () {
            this.allEmotes = (yield this.client.guilds.fetch('748669830244073533')).emojis.cache.array();
            this.emoteCount = new Map();
            for (const emote of this.allEmotes) {
                this.emoteCount.set(emote.identifier, new EmoteHandler(emote.identifier));
            }
            yield this.sheetsUser.onConstruct();
            this.fromShortArray(yield this.sheetsUser.readSheet("data", "Data"));
            setInterval(() => __awaiter(this, void 0, void 0, function* () {
                yield this.sheetsUser.clearSheet('data', 'Data');
                yield this.sheetsUser.bulkUpdateRows("data", "Data", this.toShortArray().map((row, i) => { return { row, num: i }; }));
            }), 1000 * 60 * 5);
            this.client.on("messageReactionAdd", (reaction, user) => {
                if (!user.bot && this.emoteCount.has(reaction.emoji.identifier)) {
                    this.emoteCount.get(reaction.emoji.identifier).add(user.id, 1);
                }
            });
        });
    }
    available(guild) {
        return guild && guild.id === '748669830244073533';
    }
    toArray() {
        let allusers = new Set();
        for (const key of this.emoteCount.keys()) {
            for (const user of this.emoteCount.get(key).userCache.keys()) {
                allusers.add(user);
            }
        }
        let allusersarray = [...allusers];
        let nums = Array(this.emoteCount.size).fill(0).map(() => Array(allusers.size).fill(0));
        const emoteKeys = [...this.emoteCount.keys()];
        for (let i = 0; i < emoteKeys.length; i++) {
            let emote = this.emoteCount.get(emoteKeys[i]);
            for (const key of emote.userCache.keys()) {
                nums[i][allusersarray.indexOf(key)] = emote.userCache.get(key);
            }
        }
        // console.log(nums);
        return nums;
    }
    toShortArray() {
        let nums = Array(this.emoteCount.size).fill(0).map(() => Array());
        const emoteKeys = [...this.emoteCount.keys()];
        for (let i = 0; i < emoteKeys.length; i++) {
            let emote = this.emoteCount.get(emoteKeys[i]);
            nums[i].push(emoteKeys[i]);
            nums[i].push(emote.total);
            nums[i].push(emote.overall());
            for (const key of emote.userCache.keys()) {
                nums[i].push(`${key} - ${emote.userCache.get(key)}`);
            }
        }
        nums.splice(0, 0, [`Identifier`, `Total`, `Score`, `Usage...`]);
        return nums;
    }
    fromShortArray(param) {
        if (!param || param.length === 0 || param[0].length === 0) {
            return;
        }
        let nums = param.slice(1);
        for (const row of nums) {
            if (this.emoteCount.has('' + row[0])) {
                let emote = this.emoteCount.get('' + row[0]);
                emote.total = parseInt(`${row[1]}`);
                emote.userCache = new Map();
                for (const str of row.slice(3)) {
                    let numbers = `${str}`.split(' - ');
                    let id = numbers[0];
                    let number = parseInt(numbers[1]);
                    emote.userCache.set(id, number);
                }
            }
        }
    }
    leastUsed(n) {
        let limit = n || 5;
        let allemotes = [];
        for (const key of this.emoteCount.keys()) {
            allemotes.push(this.emoteCount.get(key));
        }
        allemotes = allemotes.filter((a) => !a.identifier.startsWith("a:") && !a.identifier.startsWith("02"));
        // allemotes = allemotes.sort((a,b) => a.overall() - b.overall());
        let allmin = [];
        let emoteset = new Set(allemotes);
        let infiniteloopgetteroutter2000 = 0;
        while (allmin.length < limit && infiniteloopgetteroutter2000 < limit) {
            let min = Infinity;
            for (const a of emoteset) {
                if (a.overall() < min) {
                    min = a.overall();
                }
            }
            for (const a of emoteset) {
                if (a.overall() === min) {
                    allmin.push(a);
                    emoteset.delete(a);
                }
            }
            infiniteloopgetteroutter2000++;
        }
        return allmin;
    }
}
exports.EmoteBot = EmoteBot;
class EmoteHandler {
    constructor(str) {
        this.total = 0;
        this.userCache = new Map();
        this.identifier = str;
    }
    add(userid, num) {
        if (num === 0)
            return;
        if (this.userCache.has(userid)) {
            this.userCache.set(userid, this.userCache.get(userid) + num);
        }
        else {
            this.userCache.set(userid, num);
        }
        this.total += num;
    }
    overall() {
        let arr = [...this.userCache.entries()].map(val => val[1]);
        arr = arr.sort((a, b) => a - b);
        if (this.userCache.size === 0) {
            return 0;
        }
        else if (this.userCache.size === 1) {
            return Math.pow(arr[0], 0.3);
        }
        else {
            let smallmedian = arr[Math.floor(arr.length / 2 - 1)];
            for (let i = Math.floor(arr.length / 2 - 1) + 1; i < arr.length; i++) {
                let above = arr[i] - smallmedian;
                arr[i] = smallmedian + Math.pow(above, 0.2);
            }
            let sum = arr.reduce((a, b) => a + b, 0);
            sum *= Math.pow(this.userCache.size, 0.6);
            return sum;
        }
    }
}
