import { IProfileStore } from './profile.interface.store';
import {
  PermissionEntity,
  ProfileEntity,
  ProfileRolePermissionEntity,
  RoleEntity,
  UpdateProfilePayload
} from '@models/profile.model';
import { ILogger } from '@utils/log';
import { IDatabaseClient } from '@stores/db-client';

export class ProfileStore implements IProfileStore {
  constructor(
    private readonly logger: ILogger,
    private readonly db: IDatabaseClient
  ) {}

  profileRolesAndPermissionByEmail(
    email: string
  ): Promise<ProfileRolePermissionEntity | undefined> {
    const query = `
        SELECT
          row_to_json(p.*) AS profile,
          json_agg(
              json_build_object(
                  'role', row_to_json(r),
                  'permissions', permissions.permissions
              )
          ) AS role_perm
      FROM profile p
      INNER JOIN role r ON r.profile_id = p.profile_id
      INNER JOIN (
          SELECT
              r.role_id,
              json_agg(perm.*) AS permissions
          FROM permission perm
          INNER JOIN role r ON r.role_id = perm.role_id
          GROUP BY r.role_id
      ) permissions ON permissions.role_id = r.role_id
      WHERE p.email = $1
      GROUP BY p.profile_id;
    `;

    return new Promise<ProfileRolePermissionEntity | undefined>(
      async (resolve, reject) => {
        try {
          const result = await this.db.exec(query, email.trim());
          const row = result.rows[0];
          if (row === undefined || row === null) {
            this.logger.error(`no profile with email ${email}`);
            resolve(undefined);
            return;
          }

          resolve(row as ProfileRolePermissionEntity);
        } catch (e) {
          this.logger.error(`invalid profile with email ${email}`);
          reject(e);
        }
      }
    );
  }

  savePermission(p: PermissionEntity): Promise<PermissionEntity> {
    const q = `
        INSERT INTO permission (permission, role_id)
        VALUES ($1, $2)
        RETURNING permission_id, permission, role_id
    `;

    return new Promise<PermissionEntity>(async (resolve, reject) => {
      try {
        const res = await this.db.exec(q, p.permission, p.role_id);
        const row = res.rows[0] as PermissionEntity;
        row.permission_id = Number(row.permission_id);
        row.role_id = Number(row.role_id);

        resolve(res.rows[0] as PermissionEntity);
        this.logger.log('permission saved');
      } catch (e) {
        this.logger.error(`exception saving permission ${e}`);
        reject(e);
      }
    });
  }

  saveProfile(obj: ProfileEntity): Promise<ProfileEntity> {
    const query = `
        INSERT INTO profile (firstname, lastname, email, password)
            VALUES ($1, $2, $3, $4)
                RETURNING profile_id, firstname, lastname, email, password
    `;

    return new Promise<ProfileEntity>(async (resolve, reject) => {
      try {
        const res = await this.db.exec(
          query.trim(),
          obj.firstname.trim(),
          obj.lastname.trim(),
          obj.email.trim(),
          obj.password
        );

        const row = res.rows[0] as ProfileEntity;
        row.profile_id = Number(row.profile_id);

        resolve(row);
        this.logger.log('profile saved');
      } catch (e) {
        this.logger.error(`failed to insert into profile: ${e}`);
        reject(e);
      }
    });
  }

  saveRole(obj: RoleEntity): Promise<RoleEntity> {
    const q = `
        INSERT INTO role (role, profile_id)
            VALUES ($1, $2)
                RETURNING role_id, role, profile_id
    `;

    return new Promise<RoleEntity>(async (resolve, reject) => {
      try {
        const result = await this.db.exec(q, obj.role, obj.profile_id);
        const row = result.rows[0] as RoleEntity;
        row.role_id = Number(row.role_id);
        row.profile_id = Number(row.profile_id);

        resolve(result.rows[0] as RoleEntity);
        this.logger.log('role saved');
      } catch (e) {
        this.logger.error(`exception saving role ${e}`);
        reject(e);
      }
    });
  }

  updateProfileByEmail(body: UpdateProfilePayload): Promise<void> {
    const q = `
      UPDATE profile SET firstname = $1, lastname = $2
      WHERE email = $3
    `;

    return new Promise<void>(async (resolve, reject) => {
      try {
        const result = await this.db.exec(
          q,
          body.firstname.trim(),
          body.lastname.trim(),
          body.email.trim()
        );

        if (result.rowCount === 0) {
          this.logger.error('no update invalid email');
          return reject('invalid email');
        }

        resolve();
      } catch (e) {
        this.logger.error(`error updating profile ${e}`);
        reject(e);
      }
    });
  }
}
