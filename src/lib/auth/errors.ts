type AuthErrorLike = {
  message?: string;
  status?: number;
  code?: string;
};

export function mapAuthError(error: unknown) {
  const candidate = (error || {}) as AuthErrorLike;
  const message = candidate.message?.toLowerCase() || "";

  if (candidate.status === 429 || message.includes("rate limit")) {
    return "Слишком много попыток. Подожди немного и попробуй снова.";
  }

  if (message.includes("expired") || message.includes("invalid") || message.includes("token")) {
    return "Код не подошёл или истёк. Запроси новый.";
  }

  return "Не удалось войти. Проверь соединение и попробуй снова.";
}
