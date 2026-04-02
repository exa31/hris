import { EventEmitter } from 'events';

const globalObj = globalThis as any;

if (!globalObj.__sseEmitter) {
    globalObj.__sseEmitter = new EventEmitter();
    globalObj.__sseEmitter.setMaxListeners(0); // Prevent max listeners warning
}

export const sseEmitter = globalObj.__sseEmitter as EventEmitter;
