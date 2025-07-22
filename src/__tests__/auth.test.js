const request = require("supertest");
const app = require("../server");

describe("Authentication Endpoints", () => {
  let testUser = {
    email: "test@example.com",
    password: "password123",
    name: "Test User",
  };

  let authToken = null;
  let userId = null;

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send(testUser)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Registrasi berhasil");
      expect(response.body.data).toHaveProperty("uid");
      expect(response.body.data).toHaveProperty("email", testUser.email);
      expect(response.body.data).toHaveProperty("customToken");

      userId = response.body.data.uid;
    });

    it("should fail with missing email", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({ password: "password123", name: "Test" })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Email dan password diperlukan");
    });

    it("should fail with weak password", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({ email: "test2@example.com", password: "123", name: "Test" })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Password minimal 6 karakter");
    });

    it("should fail with duplicate email", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send(testUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Email sudah terdaftar");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with email and password for existing user", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Login berhasil");
      expect(response.body.data).toHaveProperty("customToken");
      expect(response.body.data).toHaveProperty("uid");
      expect(response.body.data).toHaveProperty("email", testUser.email);
    });

    it("should fail with missing email", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ password: "password123" })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Email dan password diperlukan");
    });

    it("should fail with missing password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: testUser.email })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Email dan password diperlukan");
    });

    it("should fail with non-existent email", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "nonexistent@example.com", password: "password123" })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Email atau password salah");
    });
  });

  describe("POST /api/auth/google-signin", () => {
    it("should fail without idToken", async () => {
      const response = await request(app)
        .post("/api/auth/google-signin")
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Google ID Token diperlukan");
    });

    it("should fail with invalid idToken", async () => {
      const response = await request(app)
        .post("/api/auth/google-signin")
        .send({ idToken: "invalid-token" })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/verify", () => {
    it("should fail without authorization header", async () => {
      const response = await request(app).post("/api/auth/verify").expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Token autentikasi diperlukan");
    });

    it("should fail with invalid token format", async () => {
      const response = await request(app)
        .post("/api/auth/verify")
        .set("Authorization", "InvalidFormat")
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Format token tidak valid");
    });

    it("should fail with invalid token", async () => {
      const response = await request(app)
        .post("/api/auth/verify")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Token tidak valid");
    });
  });

  describe("GET /api/auth/profile", () => {
    it("should fail without authorization", async () => {
      const response = await request(app).get("/api/auth/profile").expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Token autentikasi diperlukan");
    });
  });

  describe("PUT /api/auth/profile", () => {
    it("should fail without authorization", async () => {
      const response = await request(app)
        .put("/api/auth/profile")
        .send({ name: "Updated Name" })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Token autentikasi diperlukan");
    });
  });

  describe("POST /api/auth/send-verification-email", () => {
    it("should fail without authorization", async () => {
      const response = await request(app)
        .post("/api/auth/send-verification-email")
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Token autentikasi diperlukan");
    });
  });

  describe("POST /api/auth/forgot-password", () => {
    it("should fail without email", async () => {
      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Email diperlukan");
    });

    it("should handle non-existent email gracefully", async () => {
      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "nonexistent@example.com" })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        "Jika email terdaftar, link reset password akan dikirim"
      );
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should fail without authorization", async () => {
      const response = await request(app).post("/api/auth/logout").expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Token autentikasi diperlukan");
    });
  });

  describe("DELETE /api/auth/account", () => {
    it("should fail without authorization", async () => {
      const response = await request(app)
        .delete("/api/auth/account")
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Token autentikasi diperlukan");
    });
  });

  describe("Health Check", () => {
    it("should return API status", async () => {
      const response = await request(app).get("/health").expect(200);

      expect(response.body.status).toBe("OK");
      expect(response.body.message).toBe("Pelaut Hebat API is running");
    });
  });

  describe("API Info", () => {
    it("should return API endpoints info", async () => {
      const response = await request(app).get("/api").expect(200);

      expect(response.body.message).toBe("Pelaut Hebat API");
      expect(response.body.endpoints).toHaveProperty("auth");
      expect(response.body.endpoints.auth).toHaveProperty("register");
      expect(response.body.endpoints.auth).toHaveProperty("google-signin");
    });
  });

  // Cleanup: Delete test user if created
  afterAll(async () => {
    if (userId) {
      try {
        const { getAuthAdmin } = require("../config/firebase");
        const authAdmin = getAuthAdmin();
        if (authAdmin) {
          await authAdmin.deleteUser(userId);
          console.log("Test user cleaned up");
        }
      } catch (error) {
        console.log(
          "Cleanup error (expected in test environment):",
          error.message
        );
      }
    }
  });
});
