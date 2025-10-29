export interface Message {
    type: MessageType,
    message: string
}

export enum MessageType {
    SUCCESS, INFO, WARNING, ERROR
}

export interface Toast {
    message: string,
    type: 'success' | 'error' | 'info' | 'warning';
    duration: number, // in milliseconds
}

export interface ToastMessage {
  id: number;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number; // in ms
}

export interface Popularity {
    popularityScore: number,
    roundedRating: number,
}