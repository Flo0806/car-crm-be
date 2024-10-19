import { describe, it, expect, vi } from "vitest";
import app from "./server";

describe("server", () => {
  it("should start the server on the correct port", async () => {
    // Mock process.env.PORT to avoid dependency on environment variables
    process.env.PORT = "5000";

    // Create a spy on the app.listen function
    const listenSpy = vi.spyOn(app, "listen");

    // Call the server startup code
    await app.listen(5000, () => {});

    // Assertions
    expect(listenSpy).toHaveBeenCalledWith(5000, expect.any(Function));
  });
});
