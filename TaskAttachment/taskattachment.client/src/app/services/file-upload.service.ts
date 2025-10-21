import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface UploadResponse {
  id: number;
  url: string;
  name: string;
  size: number;
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:7276/api/files';

  /**
   * Uploads a file to the server
   * @param file The file to upload
   * @param messageId The ID of the message this file belongs to
   * @param userId The ID of the user uploading the file
   * @returns Observable with upload progress and response
   */
  uploadFile(file: File, messageId: number, userId: number): Observable<{ progress: number; response?: UploadResponse | null }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('messageId', messageId.toString());
    formData.append('userId', userId.toString());

    const req = new HttpRequest(
      'POST',
      `${this.baseUrl}/upload`,
      formData,
      {
        reportProgress: true,
        responseType: 'json'
      }
    );

    return this.http.request<UploadResponse>(req).pipe(
      map(event => this.getUploadProgress(event))
    );
  }

  /**
   * Gets the file URL for a given attachment ID
   * @param attachmentId The ID of the attachment
   * @returns The full URL to download the file
   */
  getFileUrl(attachmentId: number): string {
    return `${this.baseUrl}/download/${attachmentId}`;
  }

  /**
   * Gets the file icon based on file type
   * @param fileType The MIME type of the file
   * @returns The name of the icon to display
   */
  getFileIcon(fileType: string): string {
    if (!fileType) return 'file';
    
    if (fileType.startsWith('image/')) {
      return 'image';
    } else if (fileType === 'application/pdf') {
      return 'picture_as_pdf';
    } else {
      return 'insert_drive_file';
    }
  }

  /**
   * Formats file size in a human-readable format
   * @param bytes File size in bytes
   * @returns Formatted file size string (e.g., "1.2 MB")
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private getUploadProgress(event: HttpEvent<UploadResponse>): { progress: number; response?: UploadResponse | null } {
    if (event.type === HttpEventType.UploadProgress) {
      const progress = Math.round(100 * (event.loaded / (event.total || 1)));
      return { progress };
    } else if (event instanceof HttpResponse) {
      return { progress: 100, response: event.body };
    }
    return { progress: 0 };
  }
}
