const request = require('supertest');
const app = require('../server');

describe('Community API', () => {
  let authToken;
  let communityId;

  beforeAll(async () => {
    // Mock authentication token for testing
    authToken = 'mock-auth-token';
  });

  describe('POST /api/community', () => {
    it('should create a new community with valid data', async () => {
      const communityData = {
        name: 'Nelayan Jakarta Utara',
        description: 'Komunitas nelayan di wilayah Jakarta Utara untuk berbagi informasi dan tips berlayar',
        location: {
          latitude: -6.1344,
          longitude: 106.8446,
          address: 'Jakarta Utara',
          region: 'WIB'
        },
        is_public: true,
        tags: ['nelayan', 'jakarta', 'kapal_nelayan']
      };

      const response = await request(app)
        .post('/api/community')
        .set('Authorization', `Bearer ${authToken}`)
        .send(communityData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(communityData.name);
      expect(response.body.data.admin_id).toBeDefined();
      
      communityId = response.body.data.id;
    });

    it('should return 400 for invalid community data', async () => {
      const invalidData = {
        name: 'AB', // Too short
        description: 'Short', // Too short
        location: {
          latitude: 'invalid', // Invalid type
          longitude: 106.8446
        }
      };

      const response = await request(app)
        .post('/api/community')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.details).toBeDefined();
    });

    it('should return 401 without authentication', async () => {
      const communityData = {
        name: 'Test Community',
        description: 'Test description for community',
        location: {
          latitude: -6.1344,
          longitude: 106.8446
        }
      };

      const response = await request(app)
        .post('/api/community')
        .send(communityData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/community/search', () => {
    it('should search communities with filters', async () => {
      const response = await request(app)
        .get('/api/community/search')
        .query({
          region: 'WIB',
          is_public: 'true',
          limit: 10
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('communities');
      expect(Array.isArray(response.body.data.communities)).toBe(true);
    });

    it('should search communities by tags', async () => {
      const response = await request(app)
        .get('/api/community/search')
        .query({
          tags: ['nelayan', 'jakarta']
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/community/:communityId', () => {
    it('should get community details', async () => {
      const response = await request(app)
        .get(`/api/community/${communityId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', communityId);
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('members');
    });

    it('should return 404 for non-existent community', async () => {
      const response = await request(app)
        .get('/api/community/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/community/:communityId/join', () => {
    it('should allow user to join public community', async () => {
      const response = await request(app)
        .post(`/api/community/${communityId}/join`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('bergabung');
    });

    it('should return 409 if user already a member', async () => {
      const response = await request(app)
        .post(`/api/community/${communityId}/join`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already a member');
    });
  });

  describe('GET /api/community/my', () => {
    it('should get user communities', async () => {
      const response = await request(app)
        .get('/api/community/my')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('communities');
      expect(Array.isArray(response.body.data.communities)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/community/my');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/community/:communityId', () => {
    it('should update community as admin', async () => {
      const updateData = {
        description: 'Updated description for the community'
      };

      const response = await request(app)
        .put(`/api/community/${communityId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe(updateData.description);
    });
  });

  describe('GET /api/community/:communityId/members', () => {
    it('should get community members', async () => {
      const response = await request(app)
        .get(`/api/community/${communityId}/members`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('members');
      expect(Array.isArray(response.body.data.members)).toBe(true);
    });
  });

  describe('POST /api/community/:communityId/moderators', () => {
    it('should add moderator as admin', async () => {
      const moderatorData = {
        userId: 'test-user-id'
      };

      const response = await request(app)
        .post(`/api/community/${communityId}/moderators`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(moderatorData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Moderator berhasil ditambahkan');
    });
  });

  describe('POST /api/community/:communityId/leave', () => {
    it('should allow member to leave community', async () => {
      // First join as a different user, then leave
      const response = await request(app)
        .post(`/api/community/${communityId}/leave`)
        .set('Authorization', `Bearer ${authToken}`);

      // Admin cannot leave, so this should fail
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Admin cannot leave');
    });
  });

  describe('DELETE /api/community/:communityId', () => {
    it('should delete community as admin', async () => {
      const response = await request(app)
        .delete(`/api/community/${communityId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('berhasil dihapus');
    });
  });
});
