/* Keep Iconify lookups same-origin. The icon data in /assets/icons is
   generated from the icons actually used by the site, so no request ever
   leaves for api.iconify.design (which is slow from mainland China). */
window.IconifyProviders = {
  "": { resources: ["/assets/icons"] }
};
