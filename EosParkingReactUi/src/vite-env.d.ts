/// <reference types="vite/client" />

declare module 'signalr';
declare module '*.mrt?raw' {
  const content: string;
  export default content;
}
