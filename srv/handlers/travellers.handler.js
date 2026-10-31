const { enrich, ensureNameColumns, each } = require('./full-name');

module.exports = (srv) => {
  const { Travellers } = srv.entities;

  srv.before(['CREATE', 'UPDATE'], Travellers, async (req) => {
    const isCreate = req.event === 'CREATE';
    const { firstName, lastName } = req.data;
    const blank = v => typeof v !== 'string' || !v.trim();
    if ((isCreate || 'firstName' in req.data) && blank(firstName) ||
        (isCreate || 'lastName' in req.data) && blank(lastName)) {
      return req.error(400, 'First name and last name are required');
    }
    if (req.data.email) {
      const existing = await SELECT.one.from(Travellers).columns('ID').where({ email: req.data.email });
      const ownID = req.data.ID || req.params?.at(-1)?.ID || req.params?.at(-1);
      if (existing && existing.ID !== ownID) {
        return req.error(409, 'Email already registered');
      }
    }
  });

  // fullName is derived from firstName/lastName, so make sure both are fetched
  srv.before('READ', Travellers, (req) => ensureNameColumns(req.query.SELECT.columns));

  srv.after('READ', Travellers, (data) => each(data, enrich));
};
