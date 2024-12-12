import { Pool, PoolClient } from 'pg';
import { poolInstance } from '@mock/pool';
import { IProfileStore } from '@stores/profile/profile.interface.store';
import { DevelopmentLogger } from '@utils/log';
import { ProfileStore } from '@stores/profile/profile.store';
import { MockLiveDatabaseClient } from '@mock/db-client';
import {
  PermissionEntity,
  PermissionEnum,
  ProfileEntity,
  RoleEntity,
  RoleEnum
} from '@models/profile.model';

describe('profile store', () => {
  let pool: Pool;
  let client: PoolClient;
  let store: IProfileStore;

  beforeAll(async () => {
    const logger = new DevelopmentLogger();
    pool = poolInstance(logger);
    client = await pool.connect();
    store = new ProfileStore(logger, new MockLiveDatabaseClient(client));
  });

  beforeEach(async () => await client.query('BEGIN'));

  afterEach(async () => await client.query('ROLLBACK'));

  afterAll(async () => {
    client.release();
    await pool.end();
  });

  it('should save to profile, role & permission tables', async () => {
    const profile = {
      firstname: 'firstname',
      lastname: 'lastname',
      email: 'assessment@email.com',
      password: 'password'
    } as ProfileEntity;

    // method to test
    const savedProfile = await store.saveProfile(profile);

    // assert
    expect(savedProfile.profile_id).toBeGreaterThan(0);
    expect(savedProfile.firstname).toEqual(profile.firstname);
    expect(savedProfile.lastname).toEqual(profile.lastname);
    expect(savedProfile.email).toEqual(profile.email);
    expect(savedProfile.password).toEqual(profile.password);

    // method to test
    const role = {
      role: RoleEnum.DOCTOR,
      profile_id: savedProfile.profile_id
    } as RoleEntity;

    // method to test
    const savedRole = await store.saveRole(role);

    // assert
    expect(savedRole.role_id).toBeGreaterThan(0);
    expect(savedRole.role).toEqual(role.role);
    expect(savedRole.profile_id).toEqual(savedProfile.profile_id);

    // method to test
    const perm = {
      permission: PermissionEnum.WRITE,
      role_id: savedRole.role_id
    } as PermissionEntity;

    // method to test
    const savedPerm = await store.savePermission(perm);

    // assert
    expect(savedPerm.permission_id).toBeGreaterThan(0);
    expect(savedPerm.permission).toEqual(perm.permission);
    expect(savedPerm.role_id).toEqual(savedRole.role_id);
  });

  it('should retrieve profile, roles, and permissions', async () => {
    // given
    const profile = await store.saveProfile({
      firstname: 'firstname',
      lastname: 'lastname',
      email: 'assessment@email.com',
      password: 'password'
    } as ProfileEntity);

    const patient = await store.saveRole({
      role: RoleEnum.PATIENT,
      profile_id: profile.profile_id
    } as RoleEntity);

    const patientPerm = await store.savePermission({
      permission: PermissionEnum.READ,
      role_id: patient.role_id
    } as PermissionEntity);

    const doctor = await store.saveRole({
      role: RoleEnum.DOCTOR,
      profile_id: profile.profile_id
    } as RoleEntity);

    const docPerm = await store.savePermission({
      permission: PermissionEnum.WRITE,
      role_id: doctor.role_id
    } as PermissionEntity);

    const docPerm1 = await store.savePermission({
      permission: PermissionEnum.READ,
      role_id: doctor.role_id
    } as PermissionEntity);

    // method to test
    const obj = await store.profileRolesAndPermissionByEmail(profile.email);

    // assert
    expect(obj).toBeDefined();
    expect(obj!.profile).toEqual(profile);
    const pati = obj!.role_perm.find(
      (role) => role.role.role === RoleEnum.PATIENT
    )!!;
    expect(pati.role).toEqual(patient);
    expect(pati.permissions).toEqual([patientPerm]);

    const doc = obj!.role_perm.find(
      (role) => role.role.role === RoleEnum.DOCTOR
    )!!;
    expect(doc.role).toEqual(doctor);
    expect(doc.permissions).toEqual([docPerm, docPerm1]);
  });
});
