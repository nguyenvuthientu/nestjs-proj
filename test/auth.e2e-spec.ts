import request from 'supertest';
import { AppModule } from './../src/app.module';
import { TestSetup } from './utils/test-setup';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Role } from 'src/users/role.enum';
import { PasswordService } from 'src/users/password/password.service';
import { JwtService } from '@nestjs/jwt';

describe('Authentication & Authorization (e2e)', () => {
  let testSetup: TestSetup;

  beforeEach(async () => {
    testSetup = await TestSetup.create(AppModule);
  });

  afterEach(async () => {
    await testSetup.cleanup();
  });

  afterAll(async () => {
    await testSetup.teardown();
  });

  const testUser = {
    email: 'test@example.com',
    password: 'Password123!',
    name: 'Test User',
  };

  it('should require auth', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(testSetup.app.getHttpServer()).get('/tasks').expect(401);
  });

  it('should allow public route access', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(testSetup.app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(testSetup.app.getHttpServer())
      .post('/auth/login')
      .send(testUser)
      .expect(201);
  });

  it('should include roles in JWT token', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userRepo = testSetup.app.get(getRepositoryToken(User));

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await userRepo.save({
      ...testUser,
      roles: [Role.ADMIN],
      password: await testSetup.app
        .get(PasswordService)
        .hash(testUser.password),
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const response = await request(testSetup.app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const decoded = testSetup.app
      .get(JwtService)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      .verify(response.body.accessToken);

    console.log(decoded);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(decoded.roles).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(decoded.roles).toContain(Role.ADMIN);
  });

  it('/auth/register (POST)', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(testSetup.app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201)
      .expect((res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body.email).toBe(testUser.email);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body.name).toBe(testUser.name);
        expect(res.body).not.toHaveProperty('password');
      });
  });

  it('/auth/register (POST) - duplicate email', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(testSetup.app.getHttpServer())
      .post('/auth/register')
      .send(testUser);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return await request(testSetup.app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(409);
  });

  it('/auth/login (POST)', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(testSetup.app.getHttpServer())
      .post('/auth/register')
      .send(testUser);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const response = await request(testSetup.app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(response.status).toBe(201);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.body.accessToken).toBeDefined();
  });

  it('/auth/profile (GET)', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(testSetup.app.getHttpServer())
      .post('/auth/register')
      .send(testUser);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const response = await request(testSetup.app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const token = response.body.accessToken;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return await request(testSetup.app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body.email).toBe(testUser.email);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body.name).toBe(testUser.name);
        expect(res.body).not.toHaveProperty('password');
      });
  });

  it('/auth/admin (GET) - admin access', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userRepo = testSetup.app.get(getRepositoryToken(User));

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await userRepo.save({
      ...testUser,
      roles: [Role.ADMIN],
      password: await testSetup.app
        .get(PasswordService)
        .hash(testUser.password),
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const response = await request(testSetup.app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const token = response.body.accessToken;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(testSetup.app.getHttpServer())
      .get('/auth/admin')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body.message).toBe('This is for admins only!');
      });
  });

  it('/auth/admin (GET) - regular user denied', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(testSetup.app.getHttpServer())
      .post('/auth/register')
      .send(testUser);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const response = await request(testSetup.app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const token = response.body.accessToken;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return await request(testSetup.app.getHttpServer())
      .get('/auth/admin')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('/auth/register (POST) - attempting to register as an admin', async () => {
    const userAdmin = {
      ...testUser,
      roles: [Role.ADMIN],
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(testSetup.app.getHttpServer())
      .post('/auth/register')
      .send(userAdmin)
      .expect(201)
      .expect((res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body.roles).toEqual([Role.USER]);
      });
  });
});
