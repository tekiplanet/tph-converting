import { registerPlugin } from '@capacitor/core';

export interface FileDownloadPlugin {
  downloadFile(options: { 
    url: string;
    fileName: string;
    headers: { [key: string]: string };
  }): Promise<{ path: string }>;
}

const FileDownload = registerPlugin<FileDownloadPlugin>('FileDownload');

export default FileDownload; 