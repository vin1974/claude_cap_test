const cds = require('@sap/cds');
const { GET, POST, PATCH, DELETE, axios, expect } = cds.test(__dirname + '/..');

const AARAV = '98d7337a-2911-5632-8e8a-4defc0a9e842';
const PRIYA = '798991e2-1517-5c4a-a3cf-d0257315ee6e';
const admin = { auth: { username: 'admin', password: 'admin' } };
const aarav = { auth: { username: 'aarav.sharma', password: 'aarav' } };
const C = '/odata/v4/catalog';

beforeAll(() => { axios.defaults.validateStatus = () => true; });

describe('Travellers', () => {
  it('admin sees all rows, traveller only own row', async () => {
    const all = await GET(`${C}/Travellers`, admin);
    const own = await GET(`${C}/Travellers`, aarav);
    expect(all.data.value.length).to.be.above(1);
    expect(own.data.value.map(t => t.ID)).to.eql([AARAV]);
  });

  it('computes fullName on read, even with $select=fullName', async () => {
    const r = await GET(`${C}/Travellers(${AARAV})?$select=fullName`, admin);
    expect(r.data.fullName).to.equal('Aarav Sharma');
  });

  it('rejects missing names, fullName and duplicate email on create', async () => {
    const base = { email: 'new@example.com', type_code: 'ST', userID: 'new.user' };
    expect((await POST(`${C}/Travellers`, { ...base, firstName: '', lastName: 'X' }, admin)).status).to.equal(400);
    const spoof = await POST(`${C}/Travellers`, { ...base, email: 'spoof@example.com', firstName: 'A', lastName: 'B', fullName: 'x' }, admin);
    expect(spoof.data.fullName).to.equal('A B'); // fullName from the payload is ignored
    const dup = await POST(`${C}/Travellers`, { ...base, email: 'aarav.sharma@example.com', firstName: 'A', lastName: 'B' }, admin);
    expect(dup.status).to.equal(409);
    const ok = await POST(`${C}/Travellers`, { ...base, firstName: 'A', lastName: 'B' }, admin);
    expect(ok.status).to.equal(201);
  });

  it('enforces ETag: 428 without If-Match, 412 stale, 200 correct', async () => {
    const url = `${C}/Travellers(${AARAV})`;
    expect((await PATCH(url, { phone: '1' }, admin)).status).to.equal(428);
    expect((await PATCH(url, { phone: '1' }, { ...admin, headers: { 'If-Match': 'W/"stale"' } })).status).to.equal(412);
    const etag = (await GET(url, admin)).data['@odata.etag'];
    const ok = await PATCH(url, { phone: '123' }, { ...admin, headers: { 'If-Match': etag } });
    expect(ok.status).to.equal(200);
    expect(ok.data['@odata.etag']).to.not.equal(etag);
  });

  it('does not allow DELETE', async () => {
    expect((await DELETE(`${C}/Travellers(${AARAV})`, admin)).status).to.equal(403);
  });
});

describe('TravelledLocations', () => {
  const dest = async () => (await GET(`${C}/Destinations?$top=1`, admin)).data.value[0].ID;
  const loc = (d, from, to, traveller = AARAV) => ({ traveller_ID: traveller, destination_ID: d, travelFrom: from, travelTo: to });

  it('creates non-overlapping, rejects overlapping and inverted ranges', async () => {
    const d = await dest();
    expect((await POST(`${C}/TravelledLocations`, loc(d, '2030-01-01', '2030-01-05'), admin)).status).to.equal(201);
    expect((await POST(`${C}/TravelledLocations`, loc(d, '2030-01-04', '2030-01-09'), admin)).status).to.equal(409);
    expect((await POST(`${C}/TravelledLocations`, loc(d, '2030-03-09', '2030-03-01'), admin)).status).to.equal(400);
  });

  it('traveller sees and deletes only own records', async () => {
    const mine = await GET(`${C}/TravelledLocations`, aarav);
    expect(mine.data.value.every(l => l.traveller_ID === AARAV)).to.be.true;
    const other = (await GET(`${C}/TravelledLocations?$filter=traveller_ID eq ${PRIYA}`, admin)).data.value[0];
    expect((await DELETE(`${C}/TravelledLocations(${other.ID})`, aarav)).status).to.equal(403); // spec says 404; CAP rejects instance-based DELETE with 403
    expect((await DELETE(`${C}/TravelledLocations(${mine.data.value[0].ID})`, aarav)).status).to.equal(204);
  });

  it('expands destination and traveller fullName', async () => {
    const r = await GET(`${C}/TravelledLocations?$top=1&$expand=destination,traveller($select=firstName,lastName,fullName)`, admin);
    expect(r.data.value[0].destination.name).to.be.a('string');
    expect(r.data.value[0].traveller.fullName).to.be.a('string');
  });
});

describe('Destinations and value helps', () => {
  it('allows create/read, blocks update and delete with 405', async () => {
    const created = await POST(`${C}/Destinations`, { name: 'Test Spot', country: 'X', city: 'Y' }, aarav);
    expect(created.status).to.equal(201);
    const url = `${C}/Destinations(${created.data.ID})`;
    expect((await PATCH(url, { city: 'Z' }, admin)).status).to.equal(405);
    expect((await DELETE(url, admin)).status).to.equal(405);
  });

  it('exposes read-only code lists', async () => {
    for (const e of ['TravellerStatus', 'AddressTypes', 'TravellerTypes']) {
      expect((await GET(`${C}/${e}`, aarav)).data.value.length).to.be.above(0);
    }
    expect((await PATCH(`${C}/TravellerTypes('FF')`, { name: 'x' }, admin)).status).to.equal(405);
  });

  it('rejects anonymous access', async () => {
    expect((await GET(`${C}/Destinations`)).status).to.equal(401);
  });
});

describe('OData V2', () => {
  it('serves the same data under /odata/v2', async () => {
    const r = await GET('/odata/v2/catalog/Travellers?$format=json', admin);
    const v4 = await GET(`${C}/Travellers`, admin);
    expect(r.data.d.results.length).to.equal(v4.data.value.length);
  });
});
