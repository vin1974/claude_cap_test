const cds = require('@sap/cds');

module.exports = class CatalogService extends cds.ApplicationService {
  async init() {
    require('./handlers/travellers.handler')(this);
    require('./handlers/travelled-locations.handler')(this);
    return super.init();
  }
};
