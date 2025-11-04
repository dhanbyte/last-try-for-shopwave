declare module 'mongoose' {
  const mongoose: any;
  export = mongoose;
}

declare global {
  namespace NodeJS {
    interface Global {
      mongoose: any;
    }
  }
}

export {};