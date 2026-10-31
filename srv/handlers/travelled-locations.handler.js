const { enrich, ensureNameColumns, each } = require('./full-name');

module.exports = (srv) => {
  const { TravelledLocations } = srv.entities;

  // fullName of an expanded traveller is computed here, as the Travellers handlers don't run for $expand
  srv.before('READ', TravelledLocations, (req) => {
    const col = req.query.SELECT.columns?.find(c => c.ref?.[0] === 'traveller' && c.expand);
    if (col) ensureNameColumns(col.expand);
  });

  srv.after('READ', TravelledLocations, (data) => each(data, d => d.traveller && enrich(d.traveller)));

  srv.before('CREATE', TravelledLocations, async (req) => {
    const { traveller_ID, travelFrom, travelTo, ID } = req.data;
    if (travelFrom && travelTo && travelFrom > travelTo) {
      return req.error(400, 'Travel start date must be before end date');
    }
    if (!traveller_ID || !travelFrom || !travelTo) return;
    const overlap = await SELECT.one.from(TravelledLocations).columns('ID').where(
      { traveller_ID, travelFrom: { '<=': travelTo }, travelTo: { '>=': travelFrom } }
    );
    if (overlap && overlap.ID !== ID) {
      return req.error(409, 'Traveller already has a trip during this date range');
    }
  });
};
