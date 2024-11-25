import orchestrator from "@/tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("GET /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("Retrieving current system status", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status");
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toEqual(parsedUpdatedAt);

      const database = responseBody.dependencies.database;
      expect(database).toBeDefined();
      expect(database.version).toEqual("16.0");
      expect(database.max_connections).toEqual(100);
      expect(database.opened_connections).toBeGreaterThanOrEqual(0);

      expect(Array.isArray(database.latency)).toBe(true);
      expect(database.latency).toHaveLength(3);
      database.latency.forEach((latencyValue: number) => {
        expect(latencyValue).toBeGreaterThanOrEqual(0);
      });

      expect(database.status).toBeDefined();
      expect(["healthy", "unhealthy"]).toContain(database.status);
    });
  });
});
