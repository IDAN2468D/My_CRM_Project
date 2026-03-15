import { google } from 'googleapis';
import { Readable } from 'stream';

export function getDriveClient() {
  if (process.env.GOOGLE_REFRESH_TOKEN) {
    // If using OAuth Refresh Token (For Free Gmail accounts)
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });
    return google.drive({ version: 'v3', auth: oauth2Client });
  } else {
    // If using Service Account (For Google Workspace / Shared Drives)
    const credentials = {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
    return google.drive({ version: 'v3', auth });
  }
}

export async function createCustomerFolder(customerName) {
  const drive = getDriveClient();
  const folderName = `CRM_Files_${customerName}`;
  const masterFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID; // Optional master folder id in .env.local

  try {
    // Check if the folder already exists
    let query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;
    if (masterFolderId) {
      query += ` and '${masterFolderId}' in parents`;
    }

    const res = await drive.files.list({
      q: query,
      spaces: 'drive',
      fields: 'files(id, name)',
    });

    if (res.data.files.length > 0) {
      return res.data.files[0].id;
    }

    // Create a new folder
    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: masterFolderId ? [masterFolderId] : [],
    };

    const folder = await drive.files.create({
      resource: fileMetadata,
      fields: 'id',
    });

    // Make it readable so anyone with the link can view the file from the CRM UI
    await drive.permissions.create({
      fileId: folder.data.id,
      requestBody: { role: 'reader', type: 'anyone' },
    });

    return folder.data.id;
  } catch (error) {
    console.error('Error creating Drive folder:', error);
    throw error;
  }
}

export async function uploadFileToDrive(fileBuffer, fileName, mimeType, folderId) {
  const drive = getDriveClient();

  const fileMetadata = {
    name: fileName,
    parents: folderId ? [folderId] : [],
  };

  const media = {
    mimeType: mimeType,
    body: Readable.from(fileBuffer),
  };

  try {
    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink',
    });

    return {
      fileId: file.data.id,
      webViewLink: file.data.webViewLink,
      webContentLink: file.data.webContentLink,
    };
  } catch (error) {
    console.error('Error uploading file to Drive:', error);
    throw error;
  }
}
