
// change to static

import moment = require("moment-timezone");

// For Intellisense
import Discord = require("discord.js");
import { SchoologyAccessor } from "./SA";

export class Utilities {
    private constructor(){
    }

    /* String Utilities */
    public static BigramsOf(str:string) {
        let returnobj = [];
        for(let i = 0; i < str.length - 1; i++) {
            returnobj.push(str.slice(i,i+2));
        }
        return returnobj;
    }

    public static SimilarBigramsOf(str1:string,str2:string) {
        let bigrams1 = Utilities.BigramsOf(str1);
        let bigrams2 = Utilities.BigramsOf(str2);

        let bigramsset = new Set(bigrams1);
        let incommon = 0;
        for(const bigram of bigramsset) {
            for(const secondbigram of bigrams2) {
                if(bigram === secondbigram) {
                    incommon ++;
                }
            }
        }
        return incommon;
    }

    public static SorensonDice(str1:string,str2:string) {
        return 2 * (Utilities.SimilarBigramsOf(str1.toLowerCase(),str2.toLowerCase())) / (str1.length - 1 + str2.length - 1);
    }

    public static LongestCommonSubstring(str1:string, str2:string) {

        let longest = 0;
        let longestsubstr = "";
        let start1 = 0;
        let end1 = 0;
        let start2 = 0;
        let end2 = 0;

        for (let start1t = 0; start1t < str1.length; start1t++) {
            for(let end1t = start1t+1; end1t <= str1.length; end1t++) {
                let substr = str1.slice(start1t,end1t);
                if(str2.includes(substr) && substr.length > longest) {
                    longest = substr.length;
                    start2 = str2.indexOf(substr);
                    end2 = start2 + substr.length;
                    longestsubstr = substr;
                    start1 = start1t;
                    end1 = end1t;
                }
            }
        }

        return {
            longest,
            longestsubstr,
            start1,
            end1,
            start2,
            end2
        }
    }

    public static RatcliffObershelpRaw(str1: string, str2: string) {
        if (str1.length * str2.length === 0) return 0;
        let common = Utilities.LongestCommonSubstring(str1, str2);
        if (common.longest === 0) return 0;

        let left = Utilities.RatcliffObershelpRaw(str1.slice(0, common.start1), str2.slice(0, common.start2));
        let right = Utilities.RatcliffObershelpRaw(str1.slice(common.end1), str2.slice(common.end2));

        return common.longest + left + right;
    }

    public static sanitizerepeats(str:string) {
        str = str.replace(/['"\.,;!?]/g, '').toLowerCase();
        
        let newstr = str[0];
        for(let i = 1; i < str.length; i++) {
            if(str[i] === str[i-1]) {
                if(i < str.length - 1 && str[i+1] === str[i]) {
                    // Is repeat and cringe
                    continue;
                }
                if(i > 1 && str[i] === str[i-2]) {
                    //Is repeat and cringe
                    continue;
                }
            }
            newstr += str[i];
        }
        return newstr;
    }

    public static RatcliffObershelpNoRepeats(str1: string, str2: string) {
        return 2 * Utilities.RatcliffObershelpRaw(Utilities.sanitizerepeats(str1), Utilities.sanitizerepeats(str2)) / (Utilities.sanitizerepeats(str1).length + Utilities.sanitizerepeats(str2).length);
    }

    public static RatcliffObershelpRawModified(str1:string,str2:string) {
        if(str1.length * str2.length === 0) return 0;
        let common = Utilities.LongestCommonSubstring(str1,str2);
        if(common.longest === 0) return 0;

        let left = Utilities.RatcliffObershelpRawModified(str1.slice(0, common.start1), str2.slice(0, common.start2));
        let right = Utilities.RatcliffObershelpRawModified(str1.slice(common.end1), str2.slice(common.end2));

        return common.longest + left + right - Math.abs(common.start1 - common.start2) / 200;
    }

    public static RatcliffObershelpCustom(str1: string, str2: string) {
        return Utilities.RatcliffObershelpRawModified(str1.toLowerCase(), str2.toLowerCase()) / (str1.length + str2.length / 100);
    }

    public static RatcliffObershelp(str1:string,str2:string){
        return 2 * Utilities.RatcliffObershelpRaw(str1.toLowerCase(), str2.toLowerCase()) / (str1.length + str2.length);
    }

    /* Moment Utilities */

    public static now() {
        return Date.now();
    }

    public static getTodayStr(){
        return moment.tz("America/Los_Angeles").format("MM/DD/YYYY");
    }

    public static formatTime(t) {
        let time = moment.tz(t, "America/Los_Angeles")
        let diff = time.diff(moment.tz("America/Los_Angeles"), "milliseconds");
        if(diff < 0) {
            return time.format("MM/DD h:mm:ss a")
        } else {
            let days = time.diff(moment.tz("America/Los_Angeles"), "days");
            let hrs = time.diff(moment.tz("America/Los_Angeles"), "hours") % 24;
            let mins = time.diff(moment.tz("America/Los_Angeles"), "minutes") % 60;

            return `${days} days, ${hrs} hrs, ${mins} mins, at ${time.format("MM/DD h:mm:ss a")}`;
            
        }
    }

    public static timediff(momentobj: moment.Moment): number {
        let now = moment.tz("America/Los_Angeles");
        return momentobj.diff(now, 'days');
    }


    /* Discord Utilities */

    public static async sendEmoteCollector(origchannel: Discord.TextChannel|Discord.DMChannel|Discord.NewsChannel,embed:(boolean) => Object,num: number,millis: number) {

        const emote = "👍"
        const downemote = "👎"

        let message = await origchannel.send({
            embed: embed(false)
        });
        await message.react(emote);
        await message.react(downemote);
        await message.react("❌");

        const filter = (reaction, user) => {
            let gmember = (message.guild.member(user));
            return ([emote,downemote].includes(reaction.emoji.name) && !user.bot) || 
                (["❌"].includes(reaction.emoji.name) && gmember.hasPermission("ADMINISTRATOR") && !user.bot);
        };


        while(true) {

            try {
                await message.awaitReactions(filter, {
                    max: 1,
                    time: millis,
                    errors: ['time']
                })
            } catch (err) {
                await message.reactions.removeAll();
                message.delete();
                return false;
            }

            let count = message.reactions.cache;

            if (count.has("❌")) {
                let xppl = count.get("❌").users.cache;

                let adminxed = 0;
                for (const id of xppl.keyArray()) {
                    const gmember = (message.guild.member(xppl.get(id)));
                    adminxed += !xppl.get(id).bot && gmember.hasPermission("ADMINISTRATOR") ? 1 : 0;
                }

                if (adminxed) {
                    await message.delete();
                    return false;
                }

            }
            
            let votestrue = count.has(emote) ? count.get(emote).count : 0;
            let votesfalse = count.has(downemote) ? count.get(downemote).count : 0;
            if(votestrue - votesfalse + 1 > num) {
                await message.reactions.removeAll();
                await message.edit({embed: embed(true) });
                return true;
            }

        }

    }

    public static async sendApprove(origmessage: Discord.Message, embed: Object, millis:number) {
        const emote = "👍"
        const downemote = "👎"

        let message = await origmessage.channel.send({
            embed
        });
        await message.react(emote);
        await message.react(downemote);

        const filter = (reaction, user) => {
            return ([emote, downemote].includes(reaction.emoji.name)) && user.id === origmessage.author.id;
        };

        try {
            let r =  await message.awaitReactions(filter, {
                max: 1,
                time: millis,
                errors: ['time']
            })
            if( r.first().emoji.name === emote) {
                message.delete();
                return true;
            } else {
                message.delete();
                return false;
            }
        } catch (err) {
            await message.reactions.removeAll();
            message.delete();
            return false;
        }
    }

    /**
     * @param {Discord.Message|Discord.TextChannel} origmessage
     */
    public static async sendClosableEmbed(origmessage: Discord.Message | Discord.TextChannel, embed) {

        if(origmessage instanceof Discord.Message) {
            let message = await origmessage.channel.send({
                embed
            });
            await message.react("❌");

            const filter = (reaction, user) => {
                return ['❌'].includes(reaction.emoji.name) && user.id === origmessage.author.id;
            };

            let collected;
            try {
                collected = await message.awaitReactions(filter, {
                    max: 1,
                    time: 60000,
                    errors: ['time']
                })
            } catch (err) {
                await message.reactions.removeAll();
                return false;
            }
            const reaction = collected.first();

            try {
                await reaction.users.remove(origmessage.author.id);
            } catch {} finally {
                await message.delete();
            }
        } else if(origmessage instanceof Discord.TextChannel) {

            let message = await origmessage.send({
                embed
            });
            await message.react("❌");

            const filter = (reaction, user) => {
                return ['❌'].includes(reaction.emoji.name)
            };

            let collected;
            try {
                collected = await message.awaitReactions(filter, {
                    max: 1,
                    time: 60000,
                    errors: ['time']
                })
            } catch (err) {
                await message.reactions.removeAll();
                return false;
            }
            await message.delete();
            
        }
        
    }

    public static async dmCarousel(user: Discord.User, embeds: { embed: object; }[]) {

        // Remap embeds
        embeds = embeds.map( (e) => {
            if(e.embed) {
                return { 
                    ...e,
                    // ...Utilities.embedInfo(origmessage)
                    color: 1111111
                };
            } else {
                return {
                    embed: {
                        ...e,
                        color: 1111111
                        // ...Utilities.embedInfo(origmessage)
                    }
                }
            }
        })

        const message = await user.dmChannel.send(embeds[0]);
        // ⬅️ ❌ ➡️
        message.react("⬅️")
        message.react("❌")
        message.react("➡️")

        Utilities.carouselPage(message, embeds, 0, user);
    }

    public static async carouselPage(message: Discord.Message, embeds: { embed: object; }[], curr: number, user: Discord.User) {

        const filter = (reaction, user) => {
            return ['❌','⬅️','➡️'].includes(reaction.emoji.name) && user.id === user.id;
        };

        let collected;
        try {
            collected = await message.awaitReactions(filter, {
                max: 1,
                time: 60000,
                errors: ['time']
            })
        } catch (err) {
            await message.reactions.removeAll();
            return false;
        }
        const reaction = collected.first();

        await reaction.users.remove(user.id);
        
        if(reaction.emoji.name === '❌') {
            await message.delete();
            return true;
        } else if(reaction.emoji.name === '⬅️') {
            curr--;
            while(curr < 0) {
                curr += embeds.length;
            }
            await message.edit(embeds[curr]);
            this.carouselPage(message, embeds, curr, user);
        } else if(reaction.emoji.name === '➡️') {
            curr++;
            while(curr >= embeds.length) {
                curr -= embeds.length;
            }
            await message.edit(embeds[curr]);
            this.carouselPage(message, embeds, curr, user);
        }

    }


    public static basicEmbedInfo() {
        return {
            "color": 111111,
            "timestamp": Utilities.now(),
        }
    }

    public static embedInfo(message:Discord.Message) {
        return {
            ...Utilities.basicEmbedInfo(),
            "footer": {
                "text": `Requested by ${message.author.username}`,
                "icon_url": message.author.displayAvatarURL()
            }
        }
    }

    public static capitilize(str:string) {
        return str[0].toUpperCase() + str.slice(1).toLowerCase()
    }
}