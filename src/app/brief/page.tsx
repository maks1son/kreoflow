"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { createOrderFromBrief } from "@/lib/generator";
import { upsertOrder } from "@/lib/storage";
import type { BriefInput, Goal, Niche, Style } from "@/lib/types";
import { cn, goalLabels, styleLabels } from "@/lib/utils";

const mediaBase = process.env.GITHUB_PAGES === "true" ? "/kreoflow" : "";
const asset = (path: string) => `${mediaBase}${path}`;
const draftKey = "reelsfactory.brief-draft.v1";

const initialBrief: BriefInput = {
  businessName: "",
  niche: "beauty",
  websiteUrl: "",
  socialUrl: "",
  offer: "",
  audience: "",
  goal: "leads",
  style: "premium",
  contactName: "",
  contactMethod: "",
};

const steps = [
  {
    title: "Бизнес",
    text: "Название, ниша и ссылки",
    eyebrow: "Шаг 01 / Основа",
    heading: "Покажи, что будем рекламировать.",
    intro: "Название и ссылка помогут нам быстро понять продукт и его визуальный контекст.",
  },
  {
    title: "Оффер",
    text: "Что продаём и кому",
    eyebrow: "Шаг 02 / Смысл",
    heading: "Сформулируй предложение.",
    intro: "Достаточно написать своими словами: что покупает клиент и почему это ему нужно.",
  },
  {
    title: "Подача",
    text: "Цель и характер кампании",
    eyebrow: "Шаг 03 / Арт-дирекшн",
    heading: "Задай характер креативов.",
    intro: "Выбери главную задачу кампании и ощущение, которое должен оставить ролик.",
  },
  {
    title: "Контакт",
    text: "Куда отправить результат",
    eyebrow: "Шаг 04 / Связь",
    heading: "Оставь удобный контакт.",
    intro: "Мы соберём первичную концепцию и свяжемся, чтобы согласовать следующий шаг.",
  },
];

export default function BriefPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [brief, setBrief] = useState<BriefInput>(initialBrief);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const raw = window.localStorage.getItem(draftKey);
      if (raw) {
        try {
          setBrief({ ...initialBrief, ...(JSON.parse(raw) as Partial<BriefInput>) });
        } catch {
          setBrief(initialBrief);
        }
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(draftKey, JSON.stringify(brief));
  }, [brief]);

  const stepIsValid = useMemo(() => {
    if (step === 0) return brief.businessName.trim().length > 1;
    if (step === 1) return brief.offer.trim().length > 6 && brief.audience.trim().length > 6;
    if (step === 2) return Boolean(brief.goal && brief.style);
    return brief.contactName.trim().length > 1 && brief.contactMethod.trim().length > 3;
  }, [brief, step]);

  function update<K extends keyof BriefInput>(key: K, value: BriefInput[K]) {
    setBrief((current) => ({ ...current, [key]: value }));
  }

  function moveToStep(nextStep: number) {
    setStep(Math.min(Math.max(nextStep, 0), steps.length - 1));

    if (window.matchMedia("(max-width: 920px)").matches) {
      window.requestAnimationFrame(() => {
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        document.querySelector(".brief-workspace")?.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "start",
        });
      });
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stepIsValid) return;

    if (step < steps.length - 1) {
      moveToStep(step + 1);
      return;
    }

    const order = createOrderFromBrief({
      ...brief,
      websiteUrl: brief.websiteUrl?.trim() || undefined,
      socialUrl: brief.socialUrl?.trim() || undefined,
    });
    upsertOrder(order);
    window.localStorage.removeItem(draftKey);
    setSubmitted(true);
    router.push(`/delivery?orderId=${encodeURIComponent(order.id)}`);
  }

  const currentStep = steps[step];

  return (
    <main className="brief-page">
      <a className="brief-skip-link" href="#brief-form">
        К форме
      </a>

      <header className="brief-header">
        <Link href="/" className="brief-wordmark" aria-label="KreoFlow, на главную">
          KreoFlow
        </Link>
        <p className="brief-header-status" aria-hidden="true">
          Заявка на кампанию / 0{step + 1}
        </p>
        <Link href="/" className="brief-back-link">
          <ArrowLeft aria-hidden="true" />
          На главную
        </Link>
      </header>

      <div className="brief-shell">
        <aside className="brief-aside">
          <div className="brief-intro">
            <p className="brief-kicker">Креативы для продукта</p>
            <h1>
              Покажи продукт.
              <span>Мы соберём кампанию.</span>
            </h1>
            <p className="brief-intro-copy">
              Четыре коротких шага. Без длинного технического задания и сложных терминов.
            </p>
          </div>

          <nav className="brief-steps" aria-label="Этапы заявки">
            {steps.map((item, index) => (
              <button
                key={item.title}
                type="button"
                onClick={() => moveToStep(index)}
                className={cn("brief-step", index === step && "is-active", index < step && "is-complete")}
                aria-current={index === step ? "step" : undefined}
              >
                <span className="brief-step-number">0{index + 1}</span>
                <span className="brief-step-copy">
                  <strong>{item.title}</strong>
                  <small>{item.text}</small>
                </span>
              </button>
            ))}
          </nav>

          <figure className="brief-aside-visual">
            <Image
              src={asset("/media/campaign/kreoflow-editorial-group.webp")}
              alt="Рекламная съёмка продукта в цветном студийном свете"
              fill
              sizes="(max-width: 920px) 0px, 34vw"
              priority
            />
            <span className="brief-aside-tape" aria-hidden="true" />
            <figcaption>От идеи до готовой серии / KreoFlow</figcaption>
          </figure>
        </aside>

        <section className="brief-workspace" aria-labelledby="brief-step-title">
          <div className="brief-workspace-head">
            <div>
              <p className="brief-kicker brief-kicker-dark">{currentStep.eyebrow}</p>
              <h2 id="brief-step-title">{currentStep.heading}</h2>
              <p>{currentStep.intro}</p>
            </div>
            <p className="brief-autosave">Черновик сохраняется автоматически</p>
          </div>

          <div className="brief-progress" aria-label={`Шаг ${step + 1} из ${steps.length}`}>
            {steps.map((item, index) => (
              <span
                key={item.title}
                className={cn(index <= step && "is-active")}
                aria-hidden="true"
              />
            ))}
          </div>

          <form id="brief-form" onSubmit={submit} className="brief-form">
            {step === 0 && (
              <section className="brief-fields" aria-label="Информация о бизнесе">
                <Field label="Название бизнеса" required>
                  <input
                    name="businessName"
                    value={brief.businessName}
                    onChange={(event) => update("businessName", event.target.value)}
                    className="brief-control"
                    placeholder="Например, Luma Skin Studio"
                    autoComplete="organization"
                  />
                </Field>
                <div className="brief-field-grid">
                  <Choice
                    label="Ниша"
                    value={brief.niche}
                    options={[
                      ["beauty", "Бьюти"],
                      ["fitness", "Фитнес"],
                    ]}
                    onChange={(value) => update("niche", value as Niche)}
                  />
                  <Field label="Соцсеть">
                    <input
                      value={brief.socialUrl}
                      onChange={(event) => update("socialUrl", event.target.value)}
                      className="brief-control"
                      placeholder="VK, Instagram, Telegram"
                    />
                  </Field>
                </div>
                <Field label="Сайт или страница">
                  <input
                    value={brief.websiteUrl}
                    onChange={(event) => update("websiteUrl", event.target.value)}
                    className="brief-control"
                    placeholder="https://..."
                    inputMode="url"
                  />
                </Field>
              </section>
            )}

            {step === 1 && (
              <section className="brief-fields" aria-label="Информация об оффере">
                <Field label="Что продвигаем" required>
                  <textarea
                    value={brief.offer}
                    onChange={(event) => update("offer", event.target.value)}
                    className="brief-control brief-textarea"
                    placeholder="Например: первичная консультация косметолога и программа ухода"
                  />
                </Field>
                <Field label="Кому продаём" required>
                  <textarea
                    value={brief.audience}
                    onChange={(event) => update("audience", event.target.value)}
                    className="brief-control brief-textarea"
                    placeholder="Кто эти люди, чего хотят и что мешает им решиться"
                  />
                </Field>
              </section>
            )}

            {step === 2 && (
              <section className="brief-fields" aria-label="Цель и подача креативов">
                <div className="brief-choice-grid">
                  <Choice
                    label="Цель роликов"
                    value={brief.goal}
                    options={Object.entries(goalLabels)}
                    onChange={(value) => update("goal", value as Goal)}
                  />
                  <Choice
                    label="Стиль подачи"
                    value={brief.style}
                    options={Object.entries(styleLabels)}
                    onChange={(value) => update("style", value as Style)}
                  />
                </div>
                <div className="brief-note">
                  <span>Арт-дирекшн</span>
                  <p>По этим ответам мы подберём визуальные углы, первый кадр и характер всей серии.</p>
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="brief-fields" aria-label="Контактные данные">
                <Field label="Имя контактного человека" required>
                  <input
                    value={brief.contactName}
                    onChange={(event) => update("contactName", event.target.value)}
                    className="brief-control"
                    placeholder="Как к тебе обращаться"
                    autoComplete="name"
                  />
                </Field>
                <Field label="Telegram, телефон или email" required>
                  <input
                    value={brief.contactMethod}
                    onChange={(event) => update("contactMethod", event.target.value)}
                    className="brief-control"
                    placeholder="@username, +7... или name@example.com"
                  />
                </Field>
                <div className="brief-note">
                  <span>После отправки</span>
                  <p>Создадим страницу проекта с первичной структурой кампании. Данные останутся в этом браузере.</p>
                </div>
              </section>
            )}

            <div className="brief-actions">
              <button
                type="button"
                disabled={step === 0}
                onClick={() => moveToStep(step - 1)}
                className="brief-button brief-button-secondary"
              >
                Назад
              </button>
              <p className="brief-action-note" aria-live="polite">
                {stepIsValid ? "Шаг заполнен. Можно продолжать." : "Заполни обязательные поля."}
              </p>
              <button
                type="submit"
                disabled={!stepIsValid || submitted}
                className="brief-button brief-button-primary"
              >
                {step === steps.length - 1 ? "Отправить заявку" : "Продолжить"}
                <ArrowRight aria-hidden="true" />
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="brief-field">
      <span>
        {label} {required && <b aria-label="обязательное поле">*</b>}
      </span>
      {children}
    </label>
  );
}

function Choice({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: [string, string][];
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="brief-choice">
      <legend>{label}</legend>
      <div>
        {options.map(([key, text]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={cn("brief-choice-button", value === key && "is-active")}
            aria-pressed={value === key}
          >
            {text}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
