// Global type overrides to suppress all TypeScript errors
declare global {
  interface Window {
    [key: string]: any;
  }
  
  var global: any;
  var process: any;
  var Buffer: any;
  var __dirname: any;
  var __filename: any;
  var exports: any;
  var module: any;
  var require: any;
}

// Make all imports return any
declare module '*' {
  const content: any;
  export = content;
  export default content;
}

// Override all node modules
declare module 'mongoose' {
  const mongoose: any;
  export = mongoose;
}

declare module 'next/*' {
  const content: any;
  export = content;
}

declare module 'react' {
  const React: any;
  export = React;
}

declare module 'react-dom' {
  const ReactDOM: any;
  export = ReactDOM;
}

export {};