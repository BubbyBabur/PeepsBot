import { drive_v3, google } from 'googleapis';

import * as fs from 'fs';

export class DriveUser {
    
    private drive:drive_v3.Drive;

    public static SPREADSHEET = 'application/vnd.google-apps.spreadsheet';
    public static FOLDER = 'application/vnd.google-apps.folder';
    
    constructor(auth) {
        this.drive = google.drive({ version: 'v3', auth });
    }

    private async onConstruct() {
        // const res = await this.drive.files.list({
        //     pageSize: 10,
        //     fields: 'nextPageToken, files(id, name)',
        // });
        // const files = res.data.files;

        // console.log(files);

        // await this.downloadFile("1Shi57Ly1cmpSUlNokv6hYUE8Q8Q012PR", './brr.png');

        // console.log( await this.uploadFile('test.jpg', './brr.png') );

        // const id = await this.createFolder("brr");

        // this.uploadFile("haha", "./brr.png", id);

        //1JyzBfznVFXsuzv_fJYjdSrju5PDDrAZb

        // this.drive.files.update({
        //     fileId: "16gjjPNgTnJ_5CxFOjAwy73WR8cPx3Wfu",
        //     fields: "id",
        //     addParents: "1Bil_W-7kd43marLiwlL6nZ7nEZAUzKQ2"
        // })
    }

    async deleteFile(fileId:string) {
        await this.drive.files.delete({
            fileId
        })
        console.log(`DRIVE FILE DELETED: ${fileId}`)
    }

    async moveFile(fileId:string, folderid:string) {
        const file = await this.drive.files.get({ fileId, fields: 'parents' })
        const prev = file.data.parents.join(',');
        await this.drive.files.update({
            fileId,
            addParents: folderid,
            removeParents: prev
        })
    }

    async getItemsInFolder(folderid:string) {
        return (await this.drive.files.list({
            q: `parents in "${folderid}"`
        })).data.files;
    }

    async createFile(name:string, filetype: string, parentID?:string){

        let requestBody:any;
        if(parentID)  {
            requestBody = {
                mimeType: filetype,
                name: name,
                parents: [parentID]
            }
        } else {
            requestBody = {
                mimeType: filetype,
                name: name
            }
        }

        return (await this.drive.files.create({
            requestBody,
            fields: 'id'
        })).data.id;
    }

    async createFolder(name:string,parentID?:string):Promise<string> {

        var fileMetadata:any;

        if (parentID) {
            fileMetadata = {
                name,
                parents: [parentID],
                mimeType: 'application/vnd.google-apps.folder'
            };
        } else {
            fileMetadata = {
                name,
                mimeType: 'application/vnd.google-apps.folder'
            };
        }


        return new Promise((r,j) => {
            this.drive.files.create({ // @ts-ignore
                resource: fileMetadata,
                fields: 'id'
            }, function (err, file) {
                if (err) {
                    // Handle error
                    j(err);
                } else {
                    r(file.data.id);
                }
            });
        })
        
    }

    async uploadFile(name: string, filename: string, parentID?: string, type?:string): Promise<string> {
        var fileMetadata: any;
        if(parentID) {
            fileMetadata = {
                name,
                parents: [parentID]
            };
        } else {
            fileMetadata = {
                name
            };
        }

        var media = {
            mimeType: type || 'image/jpeg',
            body: fs.createReadStream(filename)
        };

        return new Promise((r,j) => {
            this.drive.files.create({ // @ts-ignore
                resource: fileMetadata,
                media: media,
                fields: 'id'
            }, async (err, res) => {
                if (err) {
                    j(err);
                } else {
                    r(res.data.id);
                }
            });
        })
        
    }

    async downloadFile(fileId:string, destination:string): Promise<void> {
        var dest = fs.createWriteStream(destination);

        const res = await this.drive.files.get({
            fileId: fileId,
            alt: 'media',
        }, {
            responseType: "stream"
        });

        return new Promise((r,j) => {
            res.data.on('end', () => {
                r();
            })
                .on('error', function (err) {
                    j();
                })
                .pipe(dest);
        })
    }
}