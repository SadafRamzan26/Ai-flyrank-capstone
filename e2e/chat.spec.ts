import { expect, test } from "@playwright/test";

test("user sends a message and receives a streamed AI response", async ({ page }) => {
  await page.route("**/api/chat", async (route) => {
    const stream = [
      `data: ${JSON.stringify({ type: "text-start", id: "text-1" })}\n\n`,
      `data: ${JSON.stringify({ type: "text-delta", id: "text-1", delta: "Mocked streamed response" })}\n\n`,
      `data: ${JSON.stringify({ type: "text-end", id: "text-1" })}\n\n`,
      `data: ${JSON.stringify({ type: "finish", finishReason: "stop" })}\n\n`,
    ].join("");

    await route.fulfill({
      status: 200,
      contentType: "text/plain; charset=utf-8",
      headers: { "x-vercel-ai-ui-message-stream": "v1" },
      body: stream,
    });
  });

  await page.goto("/");
  const input = page.getByPlaceholder(/message mine ai/i);
  await input.fill("Say hello");
  await expect(page.getByRole("button", { name: "Send message" })).toBeEnabled();
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(page.getByText("Mocked streamed response")).toBeVisible();
});