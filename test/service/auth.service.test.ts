import { NotFoundException } from '@exceptions/not-found.exception';
import { JwtResponse, LoginPayload } from '@models/auth.model';
import { DevelopmentLogger } from '@utils/log';
import { IAuthService } from '@services/auth/auth.interface.service';
import { AuthService } from '@services/auth/auth.service';
import { UnauthorizedException } from '@exceptions/unauthorized.exception';
import {
  ProfileRolePermissionEntity,
  RolePermissionEntity
} from '@models/profile.model';
import { PatientEntity } from '@models/patient.model';

describe('login service', () => {
  let loginService: IAuthService;
  let mockAdapters: any;
  let mockJwtService: any;
  let mockPasswordService: any;

  beforeEach(() => {
    mockAdapters = {
      profileStore: {
        profileRolesAndPermissionByEmail: jest.fn()
      },
      patientStore: {
        patientByProfileId: jest.fn()
      }
    };

    mockJwtService = {
      createJwt: jest.fn()
    };
    mockPasswordService = {
      encode: jest.fn(),
      verify: jest.fn()
    };

    loginService = new AuthService(
      new DevelopmentLogger(),
      mockAdapters,
      mockJwtService,
      mockPasswordService
    );
  });

  it(`should throw ${NotFoundException.name}. email not found`, async () => {
    // given
    const dto = new LoginPayload();
    dto.email = 'user@email.com';
    dto.password = 'password';

    // when
    mockAdapters.profileStore.profileRolesAndPermissionByEmail.mockResolvedValue(
      undefined
    );

    // method to test & assert
    await expect(loginService.loginPatient(dto)).rejects.toThrow(
      NotFoundException
    );
    await expect(loginService.loginPatient(dto)).rejects.toThrow(
      'no account found'
    );
  });

  it(`should throw ${UnauthorizedException.name} passwords dont match`, async () => {
    // given
    const dto = new LoginPayload();
    dto.email = 'user@email.com';
    dto.password = 'password';

    // when
    mockAdapters.profileStore.profileRolesAndPermissionByEmail.mockResolvedValue(
      {
        profile: { password: 'hash-password' }
      } as ProfileRolePermissionEntity
    );
    mockPasswordService.verify.mockResolvedValue(false);

    // method to test and assert
    await expect(loginService.loginPatient(dto)).rejects.toThrow(
      UnauthorizedException
    );
    await expect(loginService.loginPatient(dto)).rejects.toThrow(
      'invalid email or password'
    );
  });

  it(`should throw ${NotFoundException.name} patient not found`, async () => {
    // given
    const dto = new LoginPayload();
    dto.email = 'user@email.com';
    dto.password = 'password';

    // when
    mockAdapters.profileStore.profileRolesAndPermissionByEmail.mockResolvedValue(
      {
        profile: { password: 'hash-password' }
      } as ProfileRolePermissionEntity
    );
    mockPasswordService.verify.mockResolvedValue(true);
    mockAdapters.patientStore.patientByProfileId.mockResolvedValue(undefined);

    // method to test and assert
    await expect(loginService.loginPatient(dto)).rejects.toThrow(
      NotFoundException
    );
    await expect(loginService.loginPatient(dto)).rejects.toThrow(
      'invalid patient'
    );
  });

  it(`should login user`, async () => {
    // given
    const dto = new LoginPayload();
    dto.email = 'patient@email.com';
    dto.password = 'password';

    // when
    mockAdapters.profileStore.profileRolesAndPermissionByEmail.mockResolvedValue(
      {
        profile: { password: 'hash-password' },
        role_perm: [] as RolePermissionEntity[]
      } as ProfileRolePermissionEntity
    );
    mockPasswordService.verify.mockResolvedValue(true);
    mockAdapters.patientStore.patientByProfileId.mockResolvedValue({
      uuid: 'uuid'
    } as PatientEntity);
    mockJwtService.createJwt.mockResolvedValue({
      token: 'jwt-string'
    } as JwtResponse);

    // method to test and assert
    await expect(loginService.loginPatient(dto)).resolves.toEqual({
      token: 'jwt-string'
    });
    expect(mockJwtService.createJwt).toHaveBeenCalledTimes(1);
  });
});
