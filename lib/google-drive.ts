import { google } from "googleapis";
import { Auth } from "googleapis-common";

const drive = google.drive("v3");
const sheets = google.sheets("v4");
const docs = google.docs("v1");

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  webContentLink?: string;
  thumbnailLink?: string;
  modifiedTime: string;
  owners?: Array<{ displayName?: string; emailAddress?: string }>;
}

export interface GoogleDocMetadata {
  documentId: string;
  title: string;
  body?: string;
  embeddableLink?: string;
}

export interface GoogleSheetMetadata {
  spreadsheetId: string;
  title: string;
  sheets: Array<{
    properties: {
      sheetId: number;
      title: string;
      index: number;
    };
  }>;
}

/**
 * Creates an authenticated Google Drive API client
 */
export async function getAuthenticatedDriveClient(accessToken: string) {
  const auth = new Auth.OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  });

  auth.setCredentials({ access_token: accessToken });
  return google.drive({ version: "v3", auth });
}

/**
 * Get file metadata from Google Drive
 */
export async function getDriveFileMetadata(
  fileId: string,
  accessToken: string
): Promise<DriveFile | null> {
  try {
    const driveClient = await getAuthenticatedDriveClient(accessToken);
    const response = await driveClient.files.get({
      fileId,
      fields:
        "id, name, mimeType, webViewLink, webContentLink, thumbnailLink, modifiedTime, owners",
    });

    return (response.data as any) || null;
  } catch (error) {
    console.error("Error getting file metadata:", error);
    return null;
  }
}

/**
 * List files from Google Drive
 */
export async function listDriveFiles(
  accessToken: string,
  pageSize: number = 10,
  mimeTypeFilter?: string
): Promise<DriveFile[]> {
  try {
    const driveClient = await getAuthenticatedDriveClient(accessToken);

    let query = "trashed = false";
    if (mimeTypeFilter) {
      query += ` and mimeType = '${mimeTypeFilter}'`;
    }

    const response = await driveClient.files.list({
      q: query,
      pageSize,
      fields:
        "files(id, name, mimeType, webViewLink, webContentLink, thumbnailLink, modifiedTime)",
      orderBy: "modifiedTime desc",
    });

    return (response.data.files as DriveFile[]) || [];
  } catch (error) {
    console.error("Error listing Drive files:", error);
    return [];
  }
}

/**
 * Search Google Drive files
 */
export async function searchDriveFiles(
  query: string,
  accessToken: string,
  pageSize: number = 10
): Promise<DriveFile[]> {
  try {
    const driveClient = await getAuthenticatedDriveClient(accessToken);

    const response = await driveClient.files.list({
      q: `name contains '${query}' and trashed = false`,
      pageSize,
      fields:
        "files(id, name, mimeType, webViewLink, webContentLink, thumbnailLink, modifiedTime)",
      orderBy: "modifiedTime desc",
    });

    return (response.data.files as DriveFile[]) || [];
  } catch (error) {
    console.error("Error searching Drive files:", error);
    return [];
  }
}

/**
 * Get Google Docs document content
 */
export async function getGoogleDocMetadata(
  documentId: string,
  accessToken: string
): Promise<GoogleDocMetadata | null> {
  try {
    const auth = new Auth.OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    });

    auth.setCredentials({ access_token: accessToken });
    const docsClient = google.docs({ version: "v1", auth });

    const response = await docsClient.documents.get({ documentId });

    return {
      documentId,
      title: response.data.title || "Untitled Document",
      embeddableLink: `https://docs.google.com/document/d/${documentId}/preview`,
    };
  } catch (error) {
    console.error("Error getting Google Doc metadata:", error);
    return null;
  }
}

/**
 * Get Google Sheets metadata
 */
export async function getGoogleSheetMetadata(
  spreadsheetId: string,
  accessToken: string
): Promise<GoogleSheetMetadata | null> {
  try {
    const auth = new Auth.OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    });

    auth.setCredentials({ access_token: accessToken });
    const sheetsClient = google.sheets({ version: "v4", auth });

    const response = await sheetsClient.spreadsheets.get({
      spreadsheetId,
      fields: "spreadsheetId, properties.title, sheets.properties",
    });

    return {
      spreadsheetId,
      title: response.data.properties?.title || "Untitled Spreadsheet",
      sheets: (response.data.sheets as any) || [],
    };
  } catch (error) {
    console.error("Error getting Google Sheet metadata:", error);
    return null;
  }
}

/**
 * Upload file to Google Drive
 */
export async function uploadFileToDrive(
  fileName: string,
  fileContent: Buffer | string,
  mimeType: string,
  accessToken: string,
  parentFolderId?: string
): Promise<string | null> {
  try {
    const driveClient = await getAuthenticatedDriveClient(accessToken);

    const fileMetadata: any = {
      name: fileName,
    };

    if (parentFolderId) {
      fileMetadata.parents = [parentFolderId];
    }

    const media = {
      mimeType,
      body: fileContent,
    };

    const response = await driveClient.files.create({
      requestBody: fileMetadata,
      media: media as any,
      fields: "id",
    });

    return response.data.id || null;
  } catch (error) {
    console.error("Error uploading file to Drive:", error);
    return null;
  }
}

/**
 * Create a shortcut/link file in Google Drive
 */
export async function createDriveShortcut(
  boardTitle: string,
  boardUrl: string,
  accessToken: string,
  parentFolderId?: string
): Promise<string | null> {
  try {
    const driveClient = await getAuthenticatedDriveClient(accessToken);

    const fileMetadata: any = {
      name: `${boardTitle} - CollabIt Board`,
      description: `Link to CollabIt board: ${boardUrl}`,
      mimeType: "text/plain",
    };

    if (parentFolderId) {
      fileMetadata.parents = [parentFolderId];
    }

    const media = {
      mimeType: "text/plain",
      body: `CollabIt Board: ${boardTitle}\nURL: ${boardUrl}\n\nOpen this board in CollabIt: ${boardUrl}`,
    };

    const response = await driveClient.files.create({
      requestBody: fileMetadata,
      media: media as any,
      fields: "id, webViewLink",
    });

    return response.data.id || null;
  } catch (error) {
    console.error("Error creating Drive shortcut:", error);
    return null;
  }
}

/**
 * Get shareable link for a file
 */
export async function getShareableLink(
  fileId: string,
  accessToken: string
): Promise<string | null> {
  try {
    const driveClient = await getAuthenticatedDriveClient(accessToken);

    // Create a permission to make file publicly readable (viewer role)
    await driveClient.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    const response = await driveClient.files.get({
      fileId,
      fields: "webViewLink",
    });

    return response.data.webViewLink || null;
  } catch (error) {
    console.error("Error getting shareable link:", error);
    return null;
  }
}

/**
 * MIME types for filtering
 */
export const DRIVE_MIME_TYPES = {
  GOOGLE_DOC: "application/vnd.google-apps.document",
  GOOGLE_SHEET: "application/vnd.google-apps.spreadsheet",
  GOOGLE_SLIDES: "application/vnd.google-apps.presentation",
  IMAGE: "image/png,image/jpeg,image/gif,image/webp,image/svg+xml",
  PDF: "application/pdf",
  VIDEO: "video/mp4,video/webm,video/quicktime",
};