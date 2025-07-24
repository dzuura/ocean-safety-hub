const request = require('supertest');
const app = require('../server');

describe('Report API', () => {
  let authToken;
  let communityId;
  let reportId;

  beforeAll(async () => {
    // Mock authentication token for testing
    authToken = 'mock-auth-token';
    communityId = 'test-community-id';
  });

  describe('POST /api/report', () => {
    it('should create a new report with valid data', async () => {
      const reportData = {
        community_id: communityId,
        title: 'Gelombang Tinggi di Teluk Jakarta',
        description: 'Laporan kondisi gelombang tinggi mencapai 2.5 meter di area Teluk Jakarta. Nelayan disarankan berhati-hati.',
        location: {
          latitude: -6.1344,
          longitude: 106.8446,
          address: 'Teluk Jakarta',
          area_name: 'Jakarta Utara'
        },
        conditions: {
          wave_height: 2.5,
          wind_speed: 25,
          wind_direction: 180,
          visibility: 3,
          weather_description: 'Berawan dengan angin kencang',
          sea_temperature: 28,
          current_strength: 2,
          tide_level: 'high'
        },
        safety_assessment: {
          overall_safety: 'caution',
          boat_recommendations: {
            perahu_kecil: 'avoid',
            kapal_nelayan: 'caution',
            kapal_besar: 'safe'
          },
          recommended_actions: ['Gunakan pelampung', 'Periksa cuaca berkala']
        },
        tags: ['gelombang_tinggi', 'angin_kencang'],
        urgency_level: 'high'
      };

      const response = await request(app)
        .post('/api/report')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reportData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe(reportData.title);
      expect(response.body.data.author_id).toBeDefined();
      
      reportId = response.body.data.id;
    });

    it('should return 400 for invalid report data', async () => {
      const invalidData = {
        title: 'AB', // Too short
        description: 'Short', // Too short
        location: {
          latitude: 'invalid', // Invalid type
          longitude: 106.8446
        }
      };

      const response = await request(app)
        .post('/api/report')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.details).toBeDefined();
    });

    it('should return 401 without authentication', async () => {
      const reportData = {
        community_id: communityId,
        title: 'Test Report',
        description: 'Test description for report',
        location: {
          latitude: -6.1344,
          longitude: 106.8446
        }
      };

      const response = await request(app)
        .post('/api/report')
        .send(reportData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/report/search', () => {
    it('should search reports with filters', async () => {
      const response = await request(app)
        .get('/api/report/search')
        .query({
          community_id: communityId,
          urgency_level: 'high',
          limit: 10
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('reports');
      expect(Array.isArray(response.body.data.reports)).toBe(true);
    });

    it('should search reports by tags', async () => {
      const response = await request(app)
        .get('/api/report/search')
        .query({
          tags: ['gelombang_tinggi', 'angin_kencang']
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should search reports by verification status', async () => {
      const response = await request(app)
        .get('/api/report/search')
        .query({
          verification_status: 'pending'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/report/location', () => {
    it('should get reports by location', async () => {
      const response = await request(app)
        .get('/api/report/location')
        .query({
          latitude: -6.1344,
          longitude: 106.8446,
          radius_km: 10
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('reports');
      expect(response.body.data).toHaveProperty('location');
      expect(response.body.data).toHaveProperty('radius_km');
    });

    it('should return 400 without coordinates', async () => {
      const response = await request(app)
        .get('/api/report/location');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Latitude dan longitude diperlukan');
    });

    it('should return 400 with invalid coordinates', async () => {
      const response = await request(app)
        .get('/api/report/location')
        .query({
          latitude: 'invalid',
          longitude: 106.8446
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Koordinat tidak valid');
    });
  });

  describe('GET /api/report/:reportId', () => {
    it('should get report details', async () => {
      const response = await request(app)
        .get(`/api/report/${reportId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', reportId);
      expect(response.body.data).toHaveProperty('title');
      expect(response.body.data).toHaveProperty('conditions');
      expect(response.body.data).toHaveProperty('safety_assessment');
    });

    it('should return 404 for non-existent report', async () => {
      const response = await request(app)
        .get('/api/report/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/report/:reportId/vote', () => {
    it('should vote up on report', async () => {
      const voteData = {
        vote_type: 'up',
        accuracy_rating: 4
      };

      const response = await request(app)
        .post(`/api/report/${reportId}/vote`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(voteData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Vote up berhasil');
      expect(response.body.data).toHaveProperty('voting');
    });

    it('should vote down on report', async () => {
      const voteData = {
        vote_type: 'down',
        accuracy_rating: 2
      };

      const response = await request(app)
        .post(`/api/report/${reportId}/vote`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(voteData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Vote down berhasil');
    });

    it('should return 400 for invalid vote type', async () => {
      const voteData = {
        vote_type: 'invalid',
        accuracy_rating: 3
      };

      const response = await request(app)
        .post(`/api/report/${reportId}/vote`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(voteData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.details).toHaveProperty('vote_type');
    });

    it('should return 400 for invalid accuracy rating', async () => {
      const voteData = {
        vote_type: 'up',
        accuracy_rating: 6 // Invalid range
      };

      const response = await request(app)
        .post(`/api/report/${reportId}/vote`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(voteData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.details).toHaveProperty('accuracy_rating');
    });
  });

  describe('POST /api/report/:reportId/verify', () => {
    it('should verify report as moderator', async () => {
      const verifyData = {
        status: 'verified',
        notes: 'Laporan telah diverifikasi berdasarkan data cuaca resmi'
      };

      const response = await request(app)
        .post(`/api/report/${reportId}/verify`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(verifyData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('diverifikasi');
      expect(response.body.data.verification.status).toBe('verified');
    });

    it('should return 400 for invalid verification status', async () => {
      const verifyData = {
        status: 'invalid_status'
      };

      const response = await request(app)
        .post(`/api/report/${reportId}/verify`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(verifyData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Status verifikasi tidak valid');
    });
  });

  describe('POST /api/report/:reportId/comments', () => {
    it('should add comment to report', async () => {
      const commentData = {
        content: 'Terima kasih atas laporannya. Sangat membantu untuk keselamatan berlayar.'
      };

      const response = await request(app)
        .post(`/api/report/${reportId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(commentData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Komentar berhasil ditambahkan');
      expect(response.body.data).toHaveProperty('comments');
    });

    it('should return 400 for short comment', async () => {
      const commentData = {
        content: 'OK' // Too short
      };

      const response = await request(app)
        .post(`/api/report/${reportId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(commentData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.details).toHaveProperty('content');
    });
  });

  describe('GET /api/report/community/:communityId/stats', () => {
    it('should get community report statistics', async () => {
      const response = await request(app)
        .get(`/api/report/community/${communityId}/stats`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('statistics');
      expect(response.body.data.statistics).toHaveProperty('total_reports');
      expect(response.body.data.statistics).toHaveProperty('verified_reports');
      expect(response.body.data.statistics).toHaveProperty('pending_reports');
    });
  });

  describe('PUT /api/report/:reportId', () => {
    it('should update report as author', async () => {
      const updateData = {
        description: 'Updated description with more detailed information about the sea conditions.'
      };

      const response = await request(app)
        .put(`/api/report/${reportId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe(updateData.description);
    });
  });

  describe('DELETE /api/report/:reportId', () => {
    it('should delete report as author', async () => {
      const response = await request(app)
        .delete(`/api/report/${reportId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('berhasil dihapus');
    });
  });
});
