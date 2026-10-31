const cds = require('@sap/cds');
const { GET, POST, axios, expect } = cds.test(__dirname + '/..');

const admin = { auth: { username: 'admin', password: 'admin' } };
const aarav = { auth: { username: 'aarav.sharma', password: 'aarav' } };
const U = '/odata/v4/user-management';
const RAJESH = 'e5afc317-318d-5084-a335-28ff0fee11b1';

beforeAll(() => { axios.defaults.validateStatus = () => true; });

it('blocks travellers with 403', async () => {
  expect((await GET(`${U}/Users`, aarav)).status).to.equal(403);
  expect((await POST(`${U}/assignRole`, { userId: RAJESH, roleId: 'AGENT' }, aarav)).status).to.equal(403);
});

it('createUser creates once, duplicate gives 409, bad role 404', async () => {
  const body = { firstName: 'Ann', lastName: 'Lee', email: 'ann.lee@example.com', roleId: 'AGENT' };
  expect((await POST(`${U}/createUser`, body, admin)).status).to.equal(200);
  expect((await POST(`${U}/createUser`, body, admin)).status).to.equal(409);
  expect((await POST(`${U}/createUser`, { ...body, email: 'x@example.com', roleId: 'NOPE' }, admin)).status).to.equal(404);
});

it('lock/unlock are idempotent and 404 for unknown users', async () => {
  expect((await GET(`${U}/lockUser(userId=${RAJESH})`, admin)).data.value).to.equal(true);
  expect((await GET(`${U}/lockUser(userId=${RAJESH})`, admin)).data.value).to.equal(false);
  expect((await GET(`${U}/Users(${RAJESH})`, admin)).data.isLocked).to.equal(true);
  expect((await GET(`${U}/unlockUser(userId=${RAJESH})`, admin)).data.value).to.equal(true);
  expect((await GET(`${U}/unlockUser(userId=00000000-0000-0000-0000-000000000000)`, admin)).status).to.equal(404);
});

it('validates resetPassword', async () => {
  expect((await POST(`${U}/resetPassword`, { userId: RAJESH, newPassword: '' }, admin)).status).to.equal(400);
  expect((await POST(`${U}/resetPassword`, { userId: RAJESH, newPassword: 'short' }, admin)).status).to.equal(400);
  expect((await POST(`${U}/resetPassword`, { userId: RAJESH, newPassword: 'longenough1' }, admin)).data.value).to.equal(true);
});

it('assigns and unassigns roles with 404 on invalid input', async () => {
  expect((await POST(`${U}/assignRole`, { userId: RAJESH, roleId: 'NOPE' }, admin)).status).to.equal(404);
  expect((await POST(`${U}/assignRole`, { userId: RAJESH, roleId: 'AGENT' }, admin)).data.value).to.equal(true);
  expect((await POST(`${U}/unassignRole`, { userId: RAJESH, roleId: 'AGENT' }, admin)).data.value).to.equal(true);
  expect((await POST(`${U}/unassignRole`, { userId: RAJESH, roleId: 'AGENT' }, admin)).status).to.equal(404);
});

it('expands user roles', async () => {
  const r = await GET(`${U}/Users(${RAJESH})?$expand=roles($expand=role($select=name))`, admin);
  expect(r.data.roles[0].role.name).to.be.a('string');
});
