/**
 * Common, reusable artifacts for the Vacation & Traveller Management app.
 *
 * Single source of truth for code lists and the association types
 * that point to them. Business entities live in schema.cds.
 */
using { sap } from '@sap/cds/common';

namespace vin.claude;

// Code lists

entity AddressTypes : sap.common.CodeList {
  key code : String(1) @title: '{i18n>Code}'; // e.g. Home, Office, Permanent, Temporary
}

entity TravellerStatus : sap.common.CodeList {
  key code : String(1) @title: '{i18n>Code}'; // e.g. Active, Inactive, Suspended
}

entity TravellerTypes : sap.common.CodeList {
  key code : String(2) @title: '{i18n>Code}'; // e.g. Frequent Flyer, Executive, Standard
}

entity Roles : sap.common.CodeList {
  key code : String(10) @title: '{i18n>Code}'; // e.g. ADMIN, TRAVELLER, AGENT
}

// Inherited CodeList fields

annotate AddressTypes with {
  name  @title: '{i18n>Name}';
  descr @title: '{i18n>Description}';
}

annotate TravellerStatus with {
  name  @title: '{i18n>Name}';
  descr @title: '{i18n>Description}';
}

annotate TravellerTypes with {
  name  @title: '{i18n>Name}';
  descr @title: '{i18n>Description}';
}

annotate Roles with {
  name  @title: '{i18n>Name}';
  descr @title: '{i18n>Description}';
}

// Types

type AddressType : Association to AddressTypes;
type TravellerType : Association to TravellerTypes;
type Status      : Association to TravellerStatus;
type Role        : Association to Roles;
