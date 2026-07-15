"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, LockKeyhole, Mail, RefreshCw } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { mapAuthError } from "@/lib/auth/errors";
import { safeReturnPath } from "@/lib/auth/return-path";
import { isValidEmail, normalizeEmail, normalizeOtp } from "@/lib/auth/validation";
import "./login.css";

type LoginStep = "email" | "code";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { configured, loading: sessionLoading, user, requestEmailCode, verifyEmailCode } = useAuth();
  const [step, setStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const returnTo = useMemo(
    () => safeReturnPath(searchParams.get("returnTo"), "/studio"),
    [searchParams],
  );

  useEffect(() => {
    if (!sessionLoading && user) router.replace(returnTo);
  }, [returnTo, router, sessionLoading, user]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setInterval(() => setResendIn((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendIn]);

  async function sendCode(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const normalized = normalizeEmail(email);
    if (!isValidEmail(normalized)) {
      setError("Проверь адрес почты.");
      return;
    }

    setSubmitting(true);
    setError("");
    setNotice("");
    try {
      await requestEmailCode(normalized);
      setEmail(normalized);
      setCode("");
      setStep("code");
      setResendIn(60);
      setNotice("Код отправлен. Проверь входящие и папку «Спам».");
    } catch (authError) {
      setError(mapAuthError(authError));
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedCode = normalizeOtp(code);
    if (normalizedCode.length !== 6) {
      setError("Введи все шесть цифр кода.");
      return;
    }

    setSubmitting(true);
    setError("");
    setNotice("");
    try {
      await verifyEmailCode(email, normalizedCode);
      setNotice("Готово. Открываем Studio…");
      router.replace(returnTo);
    } catch (authError) {
      setError(mapAuthError(authError));
    } finally {
      setSubmitting(false);
    }
  }

  function editEmail() {
    setStep("email");
    setCode("");
    setError("");
    setNotice("");
    setResendIn(0);
  }

  return (
    <main className="auth-shell">
      <section className="auth-proof" aria-label="KreoFlow creative production">
        <Image
          src="/media/campaign/kreoflow-editorial-watch-still-life.webp"
          alt="Editorial product campaign created for KreoFlow"
          fill
          priority
          sizes="(max-width: 800px) 100vw, 52vw"
          className="auth-proof__image"
        />
        <div className="auth-proof__veil" />
        <Link href="/" className="auth-wordmark rf-focus">KreoFlow</Link>
        <div className="auth-proof__copy">
          <p className="auth-proof__label">Creative production system</p>
          <h1>От идеи<br />до готового<br /><em>кадра.</em></h1>
        </div>
        <div className="auth-proof__route" aria-label="Процесс KreoFlow">
          <span>Brief</span><ArrowRight aria-hidden="true" /><span>Frame</span><ArrowRight aria-hidden="true" /><span>Delivery</span>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-panel__top">
          <Link href="/" className="auth-back rf-focus">
            <ArrowLeft size={16} aria-hidden="true" /> На главную
          </Link>
          <span className="auth-secure"><LockKeyhole size={14} aria-hidden="true" /> Без пароля</span>
        </div>

        <div className="auth-card">
          <div className="auth-card__index">{step === "email" ? "01" : "02"} / 02</div>
          <div className="auth-card__icon" aria-hidden="true">
            {step === "email" ? <Mail /> : <span>•••</span>}
          </div>

          {step === "email" ? (
            <>
              <p className="auth-eyebrow">Личный кабинет</p>
              <h2>Войти в KreoFlow</h2>
              <p className="auth-intro">Пришлём шестизначный код. Введёшь его один раз — дальше останешься в аккаунте.</p>

              <form onSubmit={sendCode} className="auth-form" noValidate>
                <label htmlFor="auth-email">Электронная почта</label>
                <div className="auth-input-wrap">
                  <Mail size={18} aria-hidden="true" />
                  <input
                    id="auth-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    disabled={submitting || !configured}
                    aria-describedby="auth-feedback"
                  />
                </div>
                <button type="submit" className="auth-submit rf-focus" disabled={submitting || !configured}>
                  {submitting ? "Отправляем…" : "Получить код"}
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </form>
            </>
          ) : (
            <>
              <p className="auth-eyebrow">Проверь почту</p>
              <h2>Введи код</h2>
              <p className="auth-intro">Шесть цифр отправлены на <strong>{email}</strong></p>

              <form onSubmit={verifyCode} className="auth-form" noValidate>
                <label htmlFor="auth-code">Код из письма</label>
                <input
                  id="auth-code"
                  className="auth-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  value={code}
                  onChange={(event) => setCode(normalizeOtp(event.target.value))}
                  placeholder="000000"
                  maxLength={6}
                  disabled={submitting}
                  aria-describedby="auth-feedback"
                />
                <button type="submit" className="auth-submit rf-focus" disabled={submitting || code.length !== 6}>
                  {submitting ? "Проверяем…" : "Войти"}
                  <Check size={18} aria-hidden="true" />
                </button>
              </form>

              <div className="auth-secondary">
                <button type="button" onClick={editEmail} disabled={submitting}>Изменить почту</button>
                <button type="button" onClick={() => sendCode()} disabled={submitting || resendIn > 0}>
                  <RefreshCw size={14} aria-hidden="true" />
                  {resendIn > 0 ? `Повторить через ${resendIn} сек.` : "Отправить снова"}
                </button>
              </div>
            </>
          )}

          <div id="auth-feedback" className="auth-feedback" aria-live="polite">
            {!configured ? (
              <p className="auth-feedback__setup">Экран готов. Подключение Supabase ожидает ключи проекта.</p>
            ) : error ? (
              <p className="auth-feedback__error">{error}</p>
            ) : notice ? (
              <p className="auth-feedback__success">{notice}</p>
            ) : null}
          </div>

          <p className="auth-privacy">Вход не подписывает тебя на рекламные рассылки. Сессия хранится безопасно и обновляется автоматически.</p>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="auth-shell" aria-label="Загрузка входа" />}>
      <LoginContent />
    </Suspense>
  );
}
