const request = require("supertest");
const app = require("../server");

describe("Pelaut Hebat API", () => {
  describe("GET /health", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/health").expect(200);

      expect(response.body).toHaveProperty("status", "OK");
      expect(response.body).toHaveProperty(
        "message",
        "Pelaut Hebat API is running"
      );
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("environment");
    });
  });

  describe("GET /api", () => {
    it("should return API information", async () => {
      const response = await request(app).get("/api").expect(200);

      expect(response.body).toHaveProperty("message", "Pelaut Hebat API");
      expect(response.body).toHaveProperty("version", "1.0.0");
      expect(response.body).toHaveProperty("endpoints");
    });
  });

  describe("GET /nonexistent", () => {
    it("should return 404 for non-existent endpoints", async () => {
      const response = await request(app).get("/nonexistent").expect(404);

      expect(response.body).toHaveProperty("error", "Endpoint tidak ditemukan");
    });
  });
});
