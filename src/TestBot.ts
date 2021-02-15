import { DriveUser } from "./DriveUser";
import { SheetsUser } from "./SheetsUser";
import * as Discord from 'discord.js';
import { Module } from "./Module";
import { SchoologyAccessor } from './SA';
import * as fs from "fs";
export class TestBot implements Module {

    private client: Discord.Client;
    private readonly prefix: string = "--";
    private driveUser: DriveUser;
    private sheetUser: SheetsUser;

    private readonly imagesFolder = '1Bil_W-7kd43marLiwlL6nZ7nEZAUzKQ2';
    private readonly imagesSheet = '17iYieSC2zDKpxgSPqhk6fcJZQjVBvJFE5S5KS1IcON8';

    private readonly jackChannels = ['809143110302826497']

    constructor(auth, client: Discord.Client) {
        this.client = client;
        this.driveUser = new DriveUser(auth);

        let map = new Map();
        map.set('images', this.imagesSheet);
        this.sheetUser = new SheetsUser(auth, map);
        
        this.helpEmbed = {
            title: `Help - Test Bot`,
            description: `A test module for dev purposes. tl;dr nerd shtuf.`,
            fields: []
        }
    }
    
    available(message: Discord.Message): boolean {
        return false;
    }

    helpEmbed: { title: string; description: string; fields: { name: string; value: string; }[]; };

    async onMessage(message: Discord.Message): Promise<void> {
        
        
    }

    async onConstruct(): Promise<void> {

        // let res = await SchoologyAccessor.get("/sections/2772305484/folders/4657347337")
        // let res = await SchoologyAccessor.get("/courses/2772305484/folder/347235182")
        // fs.writeFileSync("./temp/folderv2.json", JSON.stringify( await res.json()) );
        // console.log('hello!');

        // await this.sheetUser.onConstruct();
        // console.log(await this.sheetUser.bulkRead("images"));

        // for(const subsheet of await this.sheetUser.getSubsheets("images")) {
        //     // await this.sheetUser.moveCol("images", subsheet, 6, 3);

        //     await this.sheetUser.insertCol("images", subsheet, "Caption", 6, 300);
        //     await this.sheetUser.insertCol("images", subsheet, "Tags", 7, 300);
        // }

        
    }

    

}