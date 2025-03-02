const { google } = require("googleapis");
const fs = require('fs');

const SERVICE_ACCOUNT_FILE = './synapsestudy-451506-38038cca7d75.json';

const SCOPES = ['https://www.googleapis.com/auth/drive'];

async function uploadFile(path, name, parentFolderId=null) {
    try {
        const credentials = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE));
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: SCOPES
        });
        const authClient = await auth.getClient();
        const drive = google.drive({version: 'v3', auth: authClient});

        const fileMetaData = {
            name: name,
            parents: parentFolderId ? [parentFolder] : [],
        };

        const media = {
            mimeType: "text/html",
            body: fs.createReadStream(path),
        };

        const file = await drive.files.create({
            resource: fileMetaData,
            media: media,
            fields: 'id',
        });

        console.log(file.data.id);
        const response = await drive.files.list();
        const files = response.data.files;
        console.log(files);
    } catch (error) {
        console.error("an error occured", error);
    }
}

uploadFile('./index.html',"index.html");