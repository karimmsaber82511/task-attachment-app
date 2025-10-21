import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FilePreview {
  file: File;
  previewUrl: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  error?: string;
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './file-upload.html',
  styleUrls: ['./file-upload.css']
})
export class FileUploadComponent {
  @Output() filesSelected = new EventEmitter<FilePreview[]>();

  files: FilePreview[] = [];
  isDragging = false;
  maxSizeMB = 10;
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFiles(Array.from(input.files));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.processFiles(Array.from(event.dataTransfer.files));
    }
  }

  private processFiles(files: File[]): void {
    const newFiles = files
      .filter(file => this.isValidFile(file))
      .map(file => this.createFilePreview(file));

    this.files = [...this.files, ...newFiles];
    this.filesSelected.emit(this.files);
  }

  private isValidFile(file: File): boolean {
    // Check file type
    if (!this.allowedTypes.includes(file.type)) {
      console.warn(`File type ${file.type} is not allowed.`);
      return false;
    }

    // Check file size (10MB max)
    const maxSize = this.maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      console.warn(`File ${file.name} is too large. Maximum size is ${this.maxSizeMB}MB.`);
      return false;
    }

    return true;
  }

  private createFilePreview(file: File): FilePreview {
    return {
      file,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0
    };
  }

  removeFile(index: number): void {
    if (this.files[index].previewUrl) {
      URL.revokeObjectURL(this.files[index].previewUrl);
    }
    this.files.splice(index, 1);
    this.filesSelected.emit([...this.files]);
  }

  getFileIcon(type: string): string {
    if (type.startsWith('image/')) {
      return 'image';
    } else if (type === 'application/pdf') {
      return 'picture_as_pdf';
    }
    return 'insert_drive_file';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
