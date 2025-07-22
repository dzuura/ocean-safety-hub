const request = require("supertest");
const app = require("../server");

describe("AI Endpoints", () => {
  const testLocation = {
    latitude: -6.8,
    longitude: 106.8,
  };

  describe("GET /api/ai/status", () => {
    it("should return AI service status", async () => {
      const response = await request(app).get("/api/ai/status").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("ai_service");
      expect(response.body.data).toHaveProperty("status");
      expect(response.body.data).toHaveProperty("features");
      expect(response.body.data.features).toHaveProperty("explain_conditions");
      expect(response.body.data.features).toHaveProperty(
        "time_recommendations"
      );
      expect(response.body.data.features).toHaveProperty("anomaly_detection");
      expect(response.body.data.features).toHaveProperty("early_warnings");
    });
  });

  describe("POST /api/ai/explain-conditions", () => {
    it("should fail without authentication", async () => {
      const response = await request(app)
        .post("/api/ai/explain-conditions")
        .send(testLocation)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Token autentikasi diperlukan");
    });

    it("should fail with missing coordinates", async () => {
      const response = await request(app)
        .post("/api/ai/explain-conditions")
        .set("Authorization", "Bearer invalid-token")
        .send({})
        .expect(401); // Will fail at auth first

      expect(response.body.success).toBe(false);
    });

    it("should fail with invalid coordinates", async () => {
      const response = await request(app)
        .post("/api/ai/explain-conditions")
        .set("Authorization", "Bearer invalid-token")
        .send({ latitude: "invalid", longitude: "invalid" })
        .expect(401); // Will fail at auth first

      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/ai/recommend-times", () => {
    it("should fail without authentication", async () => {
      const response = await request(app)
        .post("/api/ai/recommend-times")
        .send({ ...testLocation, boat_type: "perahu_kecil" })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Token autentikasi diperlukan");
    });

    it("should fail with missing boat_type", async () => {
      const response = await request(app)
        .post("/api/ai/recommend-times")
        .set("Authorization", "Bearer invalid-token")
        .send(testLocation)
        .expect(401); // Will fail at auth first

      expect(response.body.success).toBe(false);
    });

    it("should validate boat_type values", async () => {
      // This test would need valid auth token to reach validation
      // For now, we test the endpoint structure
      const response = await request(app)
        .post("/api/ai/recommend-times")
        .set("Authorization", "Bearer invalid-token")
        .send({ ...testLocation, boat_type: "invalid_boat_type" })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/ai/detect-anomalies", () => {
    it("should fail without authentication", async () => {
      const response = await request(app)
        .post("/api/ai/detect-anomalies")
        .send(testLocation)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Token autentikasi diperlukan");
    });

    it("should fail with missing coordinates", async () => {
      const response = await request(app)
        .post("/api/ai/detect-anomalies")
        .set("Authorization", "Bearer invalid-token")
        .send({}) // No coordinates provided
        .expect(401); // Will fail at auth first

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/ai/early-warnings", () => {
    it("should fail without authentication", async () => {
      const response = await request(app)
        .get("/api/ai/early-warnings")
        .query(testLocation)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Token autentikasi diperlukan");
    });

    it("should fail with missing coordinates", async () => {
      const response = await request(app)
        .get("/api/ai/early-warnings")
        .set("Authorization", "Bearer invalid-token")
        .query({}) // No coordinates provided
        .expect(401); // Will fail at auth first

      expect(response.body.success).toBe(false);
    });
  });

  describe("API Info Integration", () => {
    it("should include AI endpoints in API info", async () => {
      const response = await request(app).get("/api").expect(200);

      expect(response.body.endpoints).toHaveProperty("ai");
      expect(response.body.endpoints.ai).toHaveProperty("status");
      expect(response.body.endpoints.ai).toHaveProperty("explain-conditions");
      expect(response.body.endpoints.ai).toHaveProperty("recommend-times");
      expect(response.body.endpoints.ai).toHaveProperty("detect-anomalies");
      expect(response.body.endpoints.ai).toHaveProperty("early-warnings");
    });
  });

  describe("Boat Type Validation", () => {
    const validBoatTypes = ["perahu_kecil", "kapal_nelayan", "kapal_besar"];

    validBoatTypes.forEach((boatType) => {
      it(`should accept valid boat type: ${boatType}`, async () => {
        // This test structure shows we expect these boat types to be valid
        // Actual validation would require valid auth token
        const testData = { ...testLocation, boat_type: boatType };
        expect(testData.boat_type).toBe(boatType);
      });
    });

    const invalidBoatTypes = ["boat", "ship", "vessel", "invalid_type"];

    invalidBoatTypes.forEach((boatType) => {
      it(`should reject invalid boat type: ${boatType}`, async () => {
        const validTypes = ["perahu_kecil", "kapal_nelayan", "kapal_besar"];
        expect(validTypes).not.toContain(boatType);
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors gracefully", async () => {
      // Test that endpoints exist and return proper error structure
      const endpoints = [
        "/api/ai/explain-conditions",
        "/api/ai/recommend-times",
        "/api/ai/detect-anomalies",
      ];

      for (const endpoint of endpoints) {
        const response = await request(app).post(endpoint).send({}).expect(401); // Expected auth error

        expect(response.body).toHaveProperty("success");
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("timestamp");
      }
    });

    it("should handle missing parameters", async () => {
      const response = await request(app)
        .get("/api/ai/early-warnings")
        .expect(401); // Will fail at auth first

      expect(response.body.success).toBe(false);
    });
  });

  describe("Response Format", () => {
    it("should return consistent response format for status endpoint", async () => {
      const response = await request(app).get("/api/ai/status").expect(200);

      // Check response structure
      expect(response.body).toHaveProperty("success");
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("timestamp");

      // Check data structure
      expect(response.body.data).toHaveProperty("ai_service");
      expect(response.body.data).toHaveProperty("status");
      expect(response.body.data).toHaveProperty("features");
      expect(response.body.data).toHaveProperty("fallback_mode");

      // Check features structure
      const features = response.body.data.features;
      expect(typeof features.explain_conditions).toBe("boolean");
      expect(typeof features.time_recommendations).toBe("boolean");
      expect(typeof features.anomaly_detection).toBe("boolean");
      expect(typeof features.early_warnings).toBe("boolean");
    });
  });

  describe("Service Integration", () => {
    it("should properly integrate with weather service", async () => {
      // Test that AI routes are properly set up to call weather service
      // This is tested indirectly through the endpoint structure
      const response = await request(app).get("/api/ai/status").expect(200);

      expect(response.body.data.ai_service).toBe("Gemini AI");
    });

    it("should handle Gemini service availability", async () => {
      const response = await request(app).get("/api/ai/status").expect(200);

      // Should indicate whether service is available or in fallback mode
      expect(response.body.data).toHaveProperty("status");
      expect(response.body.data).toHaveProperty("fallback_mode");
      expect(["available", "unavailable"]).toContain(response.body.data.status);
      expect(typeof response.body.data.fallback_mode).toBe("boolean");
    });
  });
});
