import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { ChatService } from './services/chat.service';
import { MessageService } from './services/message.service';
import { UserService } from './services/user.service';
// File upload functionality is now part of ChatService
import { Message } from './models/message.model';

interface FilePreview {
  file: File;
  previewUrl: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  error?: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit, OnDestroy {
  public messages: Message[] = [];
  public newMessage: string = '';
  public username: string = '';
  public isConnected: boolean = false;
  public isUsernameSet: boolean = false;
  public isUploading: boolean = false;
  public maxMessageLength: number = 150;
  public attachments: FilePreview[] = [];
  
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private chatService: ChatService,
    private messageService: MessageService,
    private userService: UserService
  ) {}

  ngOnInit() {
    // Subscribe to connection status
    this.chatService.connectionStatus$.subscribe(status => {
      this.isConnected = status;
    });

    // Subscribe to incoming messages
    this.chatService.messageReceived$.subscribe(data => {
      const message: Message = {
        messageId: 0,
        senderId: 0,
        senderUsername: data.username,
        content: data.message,
        timestamp: data.timestamp,
        isRead: false
      };
      this.messages.push(message);
      this.scrollToBottom();
    });
  }

  ngOnDestroy() {
    this.chatService.stopConnection();
  }

  setUsername() {
    const username = this.username.trim();
    
    if (!username) {
      alert('Please enter a username');
      return;
    }
    
    // Basic client-side validation
    if (username.length < 3 || username.length > 20) {
      alert('Username must be between 3 and 20 characters');
      return;
    }
    
    // Check for invalid characters
    //const usernameRegex = /^[a-zA-Z0-9_]+$/;
    //if (!usernameRegex.test(username)) {
    //  alert('Username can only contain letters, numbers, and underscores');
    //  return;
    //}
    
    this.userService.createUser(username).subscribe({
      next: (user) => {
        console.log('User created/retrieved:', user);
        this.isUsernameSet = true;
        this.username = user.username; // Use the username from the server response
        this.connectToChat();
      },
      error: (error) => {
        console.error('Error creating user:', error);
        
        let errorMessage = 'Error setting username. ';
        
        if (error.status === 400) {
          errorMessage += 'Invalid username format.';
        } else if (error.status === 409) {
          errorMessage += 'This username is already taken. Please choose another one.';
        } else if (error.status === 0) {
          errorMessage += 'Cannot connect to the server. Please check your connection.';
        } else {
          errorMessage += 'Please try again.';
        }
        
        alert(errorMessage);
      }
    });
  }

  connectToChat() {
    this.chatService.startConnection()
      .then(() => {
        console.log('Connected to chat');
        this.loadMessageHistory();
      })
      .catch(err => {
        console.error('Failed to connect:', err);
        alert('Failed to connect to chat server. Please refresh the page.');
      });
  }

  loadMessageHistory() {
    this.messageService.getMessages().subscribe({
      next: (messages) => {
        this.messages = messages;
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Error loading messages:', error);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    Array.from(input.files).forEach(file => {
      if (this.isValidFile(file)) {
        this.attachments.push(this.createFilePreview(file));
      }
    });

    // Reset file input to allow selecting the same file again
    input.value = '';
  }

  private isValidFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      console.warn(`File type ${file.type} is not allowed.`);
      return false;
    }

    if (file.size > maxSize) {
      console.warn(`File ${file.name} is too large. Maximum size is 10MB.`);
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
    if (this.attachments[index].previewUrl) {
      URL.revokeObjectURL(this.attachments[index].previewUrl);
    }
    this.attachments.splice(index, 1);
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

  async sendMessage(): Promise<void> {
    if ((!this.newMessage.trim() && this.attachments.length === 0) || !this.isConnected) return;

    const message = this.newMessage.trim();
    this.isUploading = true;

    try {
      // Upload all attachments first
      const uploadedAttachments = await Promise.all(
        this.attachments.map(async (attachment) => {
          try {
            const result = await this.chatService.uploadFile(attachment.file);
            return result;
          } catch (error) {
            console.error('Error uploading file:', attachment.name, error);
            return null;
          }
        })
      );

      // Filter out any failed uploads
      const successfulUploads = uploadedAttachments.filter(Boolean) as Array<{ id: string; name: string; type: string }>;
      
      // Send the message with attachment IDs
      await this.chatService.sendMessage(message, successfulUploads.map(a => a.id));
      
      // Clear the form
      this.newMessage = '';
      this.attachments = [];
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      this.isUploading = false;
    }
  }

  // Preview image in a modal or new tab
  previewImage(attachment: { url: string, name: string }): void {
    // In a real app, you might want to use a proper modal dialog
    // For now, we'll just open the image in a new tab
    window.open(attachment.url, '_blank');
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  getRemainingChars(): number {
    return this.maxMessageLength - this.newMessage.length;
  }

  isMessageFromCurrentUser(message: Message): boolean {
    return message.senderUsername === this.username;
  }

  private scrollToBottom() {
    setTimeout(() => {
      const messageContainer = document.querySelector('.messages-container');
      if (messageContainer) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    }, 100);
  }
}
