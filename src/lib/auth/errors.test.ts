import { describe, expect, it } from "vitest";
import { mapAuthError } from "./errors";

describe("mapAuthError", () => {
  it("maps expired tokens without exposing provider text", () => {
    expect(mapAuthError({ message: "Token has expired or is invalid" })).toBe(
      "Код не подошёл или истёк. Запроси новый.",
    );
  });

  it("maps rate limits and unknown failures", () => {
    expect(mapAuthError({ status: 429, message: "rate limit" })).toBe(
      "Слишком много попыток. Подожди немного и попробуй снова.",
    );
    expect(mapAuthError(new Error("provider detail"))).toBe(
      "Не удалось войти. Проверь соединение и попробуй снова.",
    );
  });
});
