declare module '*' {
  const content: any;
  export default content;
}

declare global {
  var mongoose: any;
  var VendorProduct: any;
  var Product: any;
  var User: any;
  var Order: any;
  var Review: any;
  var Category: any;
  var Vendor: any;
}

export {};