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
exports.HelpBot = void 0;
const ProcessMessage_1 = require("./ProcessMessage");
const Utilities_1 = require("./Utilities");
class HelpBot {
    constructor(modules, client) {
        this.prefix = "--";
        this.client = client;
        this.modules = modules.map(a => a);
        this.helpEmbed = {
            title: `Help - General`,
            description: [
                `This is a very long help section, much like the girthy substance of a complete TRG.`,
                `I do a lot of things, from quotes to alerts. You can use those arrows down there to scroll around,`,
                `which I don't think I really have to say, but the brick to human ratio is surprisingly high.`,
                `Alright, go read and exercise that 3 second attention span. GLHF`
            ].join(` `),
            fields: []
        };
        this.helpTechnicalEmbed = {
            title: `Help - Details for Nerds`,
            description: `If you're a CS nerd, here's all you need to know.`,
            fields: [
                {
                    name: `Contact Me!`,
                    value: `Rog#7499 is the owner of this bot. Contact him to add to your server or sign channels up for alerts.`
                },
                {
                    name: `Invite Link`,
                    value: `Not available, ask Rog#7499 for one. This is a mainly private bot.`
                },
                {
                    name: `Github`,
                    value: `All my code is on Github: https://github.com/BubbyBabur/PeepsBot`
                },
                {
                    name: `NodeJS`,
                    value: [
                        `Built using NodeJS, and if you use any other language, I *will* block you.`,
                        `Node Packages can be found in the Github.`,
                        `I use Heroku to host the bot and use Firebase's Firestore service to store data. It's a straight pain in the butt, but it gets the job done.`,
                        `I also use Google API to store some data in Google spreadsheets, which is sick.`
                    ].join(`\n`)
                },
            ]
        };
    }
    onMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (message.content.includes("<@!750573267026182185>")) {
                message.channel.send({
                    embed: Object.assign({ title: '🏓', description: `Use ${this.prefix}help for help.`, fields: [
                            {
                                name: 'Latency',
                                value: `${Date.now() - message.createdTimestamp}ms`
                            }
                        ] }, Utilities_1.Utilities.embedInfo(message))
                });
            }
            const result = ProcessMessage_1.PROCESS(message);
            if (result && result.command === 'help') {
                let embeds = [];
                embeds.push(this.helpEmbed);
                for (let i = 0; i < this.modules.length; i++) {
                    const module = this.modules[i];
                    if (module.available(message)) {
                        embeds.push(module.helpEmbed);
                    }
                }
                embeds.push(this.helpTechnicalEmbed);
                yield Utilities_1.Utilities.sendCarousel(message, embeds);
            }
        });
    }
    onConstruct() {
        return __awaiter(this, void 0, void 0, function* () {
            this.client.user.setPresence({
                status: 'online',
                activity: {
                    name: '--help',
                    type: 'LISTENING'
                }
            });
        });
    }
    available(message) {
        return true;
    }
}
exports.HelpBot = HelpBot;