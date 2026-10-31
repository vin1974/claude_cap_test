/**
 * Travel data service. Row-level security via @restrict where-clauses,
 * not handler code.
 */
using { vin.claude as db } from '../db/schema';
using { vin.claude as common } from '../db/common';

@path: '/odata/v4/catalog'
@requires: 'authenticated-user'
service CatalogService {

  entity Travellers as projection on db.Travellers {
    *,
    virtual null as fullName : String(160) @Core.Computed
  };

  entity TravelledLocations as projection on db.TravelledLocations;
  @Capabilities: {
    UpdateRestrictions.Updatable : false,
    DeleteRestrictions.Deletable : false
  }
  entity Destinations       as projection on db.Destinations;

  @readonly @cds.autoexpose entity TravellerTypes  as projection on common.TravellerTypes;
  @readonly @cds.autoexpose entity TravellerStatus as projection on common.TravellerStatus;
  @readonly @cds.autoexpose entity AddressTypes    as projection on common.AddressTypes;
}

annotate CatalogService.Travellers with @restrict: [
  { grant: ['READ', 'UPDATE'],           to: 'Traveller', where: 'userID = $user' },
  { grant: ['READ', 'CREATE', 'UPDATE'], to: 'Admin' }
];

annotate CatalogService.TravelledLocations with @restrict: [
  { grant: ['READ', 'CREATE', 'DELETE'], to: 'Traveller', where: 'traveller.userID = $user' },
  { grant: ['READ', 'CREATE', 'DELETE'], to: 'Admin' }
];

annotate CatalogService.Destinations with @restrict: [
  { grant: ['READ', 'CREATE'], to: 'authenticated-user' }
];

annotate CatalogService.TravellerTypes  with @restrict: [{ grant: 'READ', to: 'authenticated-user' }];
annotate CatalogService.TravellerStatus with @restrict: [{ grant: 'READ', to: 'authenticated-user' }];
annotate CatalogService.AddressTypes    with @restrict: [{ grant: 'READ', to: 'authenticated-user' }];
