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
exports.LittleBot = void 0;
const SheetsUser_1 = require("./SheetsUser");
const Utilities_1 = require("./Utilities");
const ProcessMessage_1 = require("./ProcessMessage");
class LittleBot {
    constructor(auth, client) {
        this.collectingChannels = ["754912483390652426", "756698378116530266"];
        this.prefix = "--";
        let currmap = new Map();
        currmap.set("quotes", "1I7_QTvIuME6GDUvvDPomk4d2TJVneAzIlCGzrkUklEM");
        this.sheetsUser = new SheetsUser_1.SheetsUser(auth, currmap);
        this.client = client;
        this.cache = new Map();
        this.utils = new Utilities_1.Utilities();
        this.client.on("messageReactionAdd", (reaction, user) => { this.onReaction(reaction, user); });
        this.client.on("messageReactionRemove", (reaction, user) => { this.onReaction(reaction, user); });
    }
    onMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = ProcessMessage_1.PROCESS(message);
            if (result) {
                let teach = result.command[0].toUpperCase() + result.command.slice(1).toLowerCase();
                if (this.cache.has(teach)) {
                    message.channel.send(this.randomQuote(teach));
                }
            }
        });
    }
    addQuote(quote, teacher, stars) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.cache.has(teacher)) {
                yield this.sheetsUser.addWithoutDuplicates("quotes", teacher, [quote, stars], [true, "CHANGE"]);
                this.cache.set(teacher, yield this.sheetsUser.readSheet("quotes", teacher));
            }
            else {
                yield this.sheetsUser.createSubsheet("quotes", teacher, {
                    columnResize: [800, 100],
                    headers: ["Quote", "Number"]
                });
                yield this.sheetsUser.addWithoutDuplicates("quotes", teacher, [quote, stars], [true, "CHANGE"]);
                this.cache.set(teacher, yield this.sheetsUser.readSheet("quotes", teacher));
            }
        });
    }
    onConstruct() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.sheetsUser.onConstruct();
            let subsheets = (yield this.sheetsUser.getSubsheets("quotes"));
            for (const subsheet of subsheets) {
                this.cache.set(subsheet, yield this.sheetsUser.readSheet("quotes", subsheet));
            }
            for (const id of this.collectingChannels) {
                let channel = yield this.client.channels.fetch(id);
                // @ts-ignore
                const test = yield channel.messages.fetch({
                    limit: 90
                });
            }
        });
    }
    onReaction(reaction, user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.collectingChannels.indexOf(reaction.message.channel.id) === -1)
                return;
            try {
                yield reaction.fetch();
            }
            catch (error) {
                console.error('Something went wrong when fetching the message: ', error);
                return;
            }
            if (reaction.emoji.name === "👍") {
                console.log(`${reaction.message.content} has ${reaction.count}`);
                // this.addLittleQuote(reaction.message.content, reaction.count)
                let content = reaction.message.content;
                let teacher = "Little";
                if (content.includes("-")) {
                    let nowhitespace = content.replace(/ /g, '');
                    teacher = nowhitespace.slice(nowhitespace.lastIndexOf('-') + 1);
                    content = content.slice(0, content.lastIndexOf("-"));
                }
                teacher = teacher[0].toUpperCase() + teacher.slice(1).toLowerCase();
                if (content.includes(`"`) && content.indexOf(`"`) !== content.lastIndexOf(`"`)) {
                    content = content.slice(content.indexOf(`"`) + 1, content.lastIndexOf(`"`));
                }
                this.addQuote(content, teacher, reaction.count);
            }
        });
    }
    randomQuote(teacher) {
        let total = 0;
        let cache = this.cache.get(teacher);
        for (let i = 1; i < cache.length; i++) {
            total += parseInt(cache[i][1]);
        }
        let rand = Math.random() * total;
        for (let i = 1; i < cache.length; i++) {
            rand -= parseInt(cache[i][1]);
            if (rand < 0) {
                return cache[i][0];
            }
        }
        return "Uh oh, something went wrong.";
    }
}
exports.LittleBot = LittleBot;
