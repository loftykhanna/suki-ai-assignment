export {};

declare global {
  interface Window {
    localStream: any;
    localAudio : {[key:string] : any}
  }
}
