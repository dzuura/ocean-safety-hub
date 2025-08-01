/**
 * Guide API Tests
 * Test suite untuk panduan keselamatan berlayar
 */

const request = require("supertest");
const express = require("express");
const guideRoutes = require("../routes/guide");
const guideService = require("../services/guideService");

// Mock Firebase
jest.mock("../config/firebase", () => ({
  db: {
    collection: jest.fn(() => ({
      add: jest.fn(),
      get: jest.fn(),
      doc: jest.fn(() => ({
        get: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      })),
      where: jest.fn(() => ({
        where: jest.fn(() => ({
          orderBy: jest.fn(() => ({
            limit: jest.fn(() => ({
              get: jest.fn(),
            })),
          })),
        })),
      })),
    })),
  },
}));

// Mock auth middleware
jest.mock("../middleware/auth", () => ({
  authenticateToken: (req, res, next) => {
    req.user = { uid: "test-user-id" };
    next();
  },
  optionalAuth: (req, res, next) => {
    req.user = { uid: "test-user-id" };
    next();
  },
}));

// Mock validation middleware
jest.mock("../middleware/validation", () => ({
  validateGuideData: (req, res, next) => next(),
  validateTripInfo: (req, res, next) => next(),
  validateChecklistUpdate: (req, res, next) => next(),
}));

const app = express();
app.use(express.json());
app.use("/api/guide", guideRoutes);

describe("Guide API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/guide", () => {
    it("should get all guides successfully", async () => {
      const mockGuides = [
        {
          id: "guide1",
          title: "Periksa Pelampung Keselamatan",
          description: "Pastikan semua pelampung dalam kondisi baik",
          category: "safety",
          priority: 1,
          toJSON: () => ({
            id: "guide1",
            title: "Periksa Pelampung Keselamatan",
            description: "Pastikan semua pelampung dalam kondisi baik",
            category: "safety",
            priority: 1,
          }),
        },
      ];

      jest.spyOn(guideService, "getAllGuides").mockResolvedValue({
        guides: mockGuides,
        total: 1,
        filters: {},
      });

      const response = await request(app).get("/api/guide").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.guides).toHaveLength(1);
      expect(response.body.data.guides[0].title).toBe(
        "Periksa Pelampung Keselamatan"
      );
    });

    it("should filter guides by category", async () => {
      jest.spyOn(guideService, "getAllGuides").mockResolvedValue({
        guides: [],
        total: 0,
        filters: { category: "safety" },
      });

      const response = await request(app)
        .get("/api/guide?category=safety")
        .expect(200);

      expect(guideService.getAllGuides).toHaveBeenCalledWith(
        expect.objectContaining({ category: "safety" })
      );
    });
  });

  describe("GET /api/guide/:guideId", () => {
    it("should get guide by ID successfully", async () => {
      const mockGuide = {
        id: "guide1",
        title: "Periksa Pelampung Keselamatan",
        toJSON: () => ({
          id: "guide1",
          title: "Periksa Pelampung Keselamatan",
        }),
      };

      jest.spyOn(guideService, "getGuideById").mockResolvedValue(mockGuide);

      const response = await request(app).get("/api/guide/guide1").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe("guide1");
    });

    it("should return 404 for non-existent guide", async () => {
      jest
        .spyOn(guideService, "getGuideById")
        .mockRejectedValue(new Error("Guide not found"));

      const response = await request(app)
        .get("/api/guide/nonexistent")
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("not found");
    });
  });

  describe("POST /api/guide", () => {
    it("should create guide successfully", async () => {
      const guideData = {
        title: "Periksa Mesin Kapal",
        description: "Pastikan mesin dalam kondisi baik sebelum berlayar",
        image_url: "https://example.com/image.jpg",
        category: "safety",
        priority: 1,
      };

      const mockGuide = {
        id: "guide1",
        ...guideData,
        toJSON: () => ({ id: "guide1", ...guideData }),
      };

      jest.spyOn(guideService, "createGuide").mockResolvedValue(mockGuide);

      const response = await request(app)
        .post("/api/guide")
        .send(guideData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(guideData.title);
    });
  });

  describe("PUT /api/guide/:guideId", () => {
    it("should update guide successfully", async () => {
      const updateData = {
        title: "Updated Title",
        description: "Updated description",
      };

      const mockGuide = {
        id: "guide1",
        ...updateData,
        toJSON: () => ({ id: "guide1", ...updateData }),
      };

      jest.spyOn(guideService, "updateGuide").mockResolvedValue(mockGuide);

      const response = await request(app)
        .put("/api/guide/guide1")
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
    });
  });

  describe("DELETE /api/guide/:guideId", () => {
    it("should delete guide successfully", async () => {
      jest.spyOn(guideService, "deleteGuide").mockResolvedValue({
        success: true,
        message: "Guide deleted successfully",
        deleted_guide: { id: "guide1" },
      });

      const response = await request(app)
        .delete("/api/guide/guide1")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("deleted successfully");
    });
  });

  describe("POST /api/guide/session/start", () => {
    it("should start session successfully", async () => {
      const tripInfo = {
        trip_purpose: "fishing",
        duration_minutes: 240,
        passenger_count: 3,
        boat_type: "kapal_nelayan",
        weather_condition: "calm",
        distance_km: 15.5,
      };

      const mockSession = {
        id: "session1",
        user_id: "test-user-id",
        trip_info: tripInfo,
        toJSON: () => ({
          id: "session1",
          user_id: "test-user-id",
          trip_info: tripInfo,
        }),
      };

      jest
        .spyOn(guideService, "createOrUpdateSession")
        .mockResolvedValue(mockSession);

      const response = await request(app)
        .post("/api/guide/session/start")
        .send(tripInfo)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.trip_info.trip_purpose).toBe("fishing");
    });
  });

  describe("GET /api/guide/session/active", () => {
    it("should get active session successfully", async () => {
      const mockSession = {
        id: "session1",
        user_id: "test-user-id",
        toJSON: () => ({
          id: "session1",
          user_id: "test-user-id",
        }),
      };

      jest
        .spyOn(guideService, "getActiveSession")
        .mockResolvedValue(mockSession);

      const response = await request(app)
        .get("/api/guide/session/active")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe("session1");
    });

    it("should return 404 when no active session", async () => {
      jest.spyOn(guideService, "getActiveSession").mockResolvedValue(null);

      const response = await request(app)
        .get("/api/guide/session/active")
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("No active session");
    });
  });

  describe("POST /api/guide/session/:sessionId/checklist", () => {
    it("should generate checklist successfully", async () => {
      const mockChecklist = {
        session_id: "session1",
        checklist: [
          {
            id: "guide1",
            title: "Periksa Pelampung",
            is_completed: false,
          },
        ],
        summary: {
          total_items: 1,
          mandatory_items: 1,
        },
      };

      jest.spyOn(guideService, "getSessionById").mockResolvedValue({
        user_id: "test-user-id",
      });
      jest
        .spyOn(guideService, "generateChecklist")
        .mockResolvedValue(mockChecklist);

      const response = await request(app)
        .post("/api/guide/session/session1/checklist")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.checklist).toHaveLength(1);
    });

    it("should return 403 for unauthorized session access", async () => {
      jest.spyOn(guideService, "getSessionById").mockResolvedValue({
        user_id: "different-user-id",
      });

      const response = await request(app)
        .post("/api/guide/session/session1/checklist")
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Access denied");
    });
  });

  describe("PUT /api/guide/session/:sessionId/checklist/:guideId", () => {
    it("should update checklist progress successfully", async () => {
      const mockResult = {
        session_id: "session1",
        guide_id: "guide1",
        is_completed: true,
        progress: {
          completed_items: 1,
          total_items: 3,
        },
      };

      jest.spyOn(guideService, "getSessionById").mockResolvedValue({
        user_id: "test-user-id",
      });
      jest
        .spyOn(guideService, "updateChecklistProgress")
        .mockResolvedValue(mockResult);

      const response = await request(app)
        .put("/api/guide/session/session1/checklist/guide1")
        .send({ is_completed: true })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.is_completed).toBe(true);
    });
  });

  describe("GET /api/guide/session/:sessionId/summary", () => {
    it("should get summary successfully", async () => {
      const mockSummary = {
        session_id: "session1",
        summary: {
          completion_percentage: 100,
        },
        items: [
          {
            id: "guide1",
            title: "Periksa Pelampung",
            video_url: "https://example.com/video.mp4",
          },
        ],
      };

      jest.spyOn(guideService, "getSessionById").mockResolvedValue({
        user_id: "test-user-id",
      });
      jest.spyOn(guideService, "getSummary").mockResolvedValue(mockSummary);

      const response = await request(app)
        .get("/api/guide/session/session1/summary")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].video_url).toBeDefined();
    });
  });

  describe("POST /api/guide/session/:sessionId/complete", () => {
    it("should complete session successfully", async () => {
      const mockResult = {
        session_id: "session1",
        status: "completed",
        completed_at: new Date().toISOString(),
      };

      jest.spyOn(guideService, "getSessionById").mockResolvedValue({
        user_id: "test-user-id",
      });
      jest.spyOn(guideService, "completeSession").mockResolvedValue(mockResult);

      const response = await request(app)
        .post("/api/guide/session/session1/complete")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe("completed");
    });
  });

  describe("GET /api/guide/session/history", () => {
    it("should get user sessions history successfully", async () => {
      const mockHistory = {
        sessions: [
          {
            id: "session1",
            status: "completed",
            created_at: new Date().toISOString(),
          },
        ],
        total: 1,
      };

      jest
        .spyOn(guideService, "getUserSessions")
        .mockResolvedValue(mockHistory);

      const response = await request(app)
        .get("/api/guide/session/history")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sessions).toHaveLength(1);
    });
  });

  describe("GET /api/guide/admin/statistics", () => {
    it("should get statistics successfully", async () => {
      const mockStats = {
        guides: {
          total: 10,
          active: 8,
          by_category: {
            safety: 5,
            navigation: 3,
          },
        },
        sessions: {
          total: 25,
          completed: 20,
        },
      };

      jest.spyOn(guideService, "getStatistics").mockResolvedValue(mockStats);

      const response = await request(app)
        .get("/api/guide/admin/statistics")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.guides.total).toBe(10);
      expect(response.body.data.sessions.total).toBe(25);
    });
  });
});
