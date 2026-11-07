export type SupportConfig = { appName: string; email: string };
export function inquiryMailto(config: SupportConfig): string | null {
 const email=config.email.trim();
 if(!/^[A-Za-z0-9._+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email))return null;
 return "mailto:"+email+"?subject="+encodeURIComponent("["+config.appName+"] お問い合わせ")+"&body="+encodeURIComponent("お問い合わせ内容：\r\n\r\n");
}
export async function copyEmail(email:string,clipboard?:{writeText(value:string):Promise<void>}):Promise<boolean>{
 if(!clipboard)return false;try{await clipboard.writeText(email);return true;}catch{return false;}
}
