declare module "qrcode" {
  const QRCode: any;
  export default QRCode;
  export function toDataURL(text: string, options?: any): Promise<string>;
  export function toString(text: string, options?: any): Promise<string>;
  export function toCanvas(canvasElement: any, text: string, options?: any): Promise<void>;
}
