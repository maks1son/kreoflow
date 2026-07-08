"use client";

import { FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Brand } from "@/components/brand";
import { createOrderFromBrief } from "@/lib/generator";
import { upsertOrder } from "@/lib/storage";
import type { BriefInput, Goal, Niche, Style } from "@/lib/types";
import { cn, goalLabels, styleLabels } from "@/lib/utils";

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
  { title: "Бизнес", text: "Название, ниша и ссылки" },
  { title: "Оффер", text: "Что продаем и кому" },
  { title: "Стиль", text: "Цель и подача" },
  { title: "Контакт", text: "Куда отдавать демо" },
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

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stepIsValid) return;

    if (step < steps.length - 1) {
      setStep((current) => current + 1);
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

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <Brand />
          <Link
            href="/"
            className="rf-focus inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            На главную
          </Link>
        </header>

        <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="rf-panel rounded-[8px] p-5 lg:sticky lg:top-5 lg:self-start">
            <p className="rf-kicker text-rose-700">Client intake</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              Бриф для первого пакета креативов.
            </h1>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Заполни вводные как клиент. На последнем шаге система создаст
              заказ, сценарии, план и delivery-страницу.
            </p>
            <div className="mt-6 space-y-3">
              {steps.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setStep(index)}
                  className={cn(
                    "rf-focus flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-md border p-3 text-left transition",
                    index === step
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-rose-100 bg-white text-slate-700 hover:border-rose-300",
                  )}
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-md bg-white/12 font-mono text-xs font-bold">
                    0{index + 1}
                  </span>
                  <span>
                    <span className="block font-bold">{item.title}</span>
                    <span className={cn("text-xs", index === step ? "text-white/68" : "text-slate-500")}>
                      {item.text}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <form onSubmit={submit} className="rf-panel rounded-[8px] p-5 sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="rf-kicker text-blue-700">Step {step + 1} / 4</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">{steps[step].title}</h2>
              </div>
              <div className="hidden rounded-md bg-rose-50 px-3 py-2 font-mono text-xs font-semibold text-rose-700 sm:block">
                autosave on
              </div>
            </div>

            {step === 0 && (
              <section className="grid gap-4">
                <Field label="Название бизнеса" required>
                  <input
                    name="businessName"
                    value={brief.businessName}
                    onChange={(event) => update("businessName", event.target.value)}
                    className="input"
                    placeholder="Например, Luma Skin Studio"
                    autoComplete="organization"
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
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
                      className="input"
                      placeholder="VK, Instagram, Telegram"
                    />
                  </Field>
                </div>
                <Field label="Сайт или страница">
                  <input
                    value={brief.websiteUrl}
                    onChange={(event) => update("websiteUrl", event.target.value)}
                    className="input"
                    placeholder="https://..."
                    inputMode="url"
                  />
                </Field>
              </section>
            )}

            {step === 1 && (
              <section className="grid gap-4">
                <Field label="Что продвигаем" required>
                  <textarea
                    value={brief.offer}
                    onChange={(event) => update("offer", event.target.value)}
                    className="input min-h-32 resize-y"
                    placeholder="Например: первичная консультация косметолога + уход сияние"
                  />
                </Field>
                <Field label="Кому продаем" required>
                  <textarea
                    value={brief.audience}
                    onChange={(event) => update("audience", event.target.value)}
                    className="input min-h-32 resize-y"
                    placeholder="Кто эти люди, чего хотят, чего боятся перед записью"
                  />
                </Field>
              </section>
            )}

            {step === 2 && (
              <section className="grid gap-4 sm:grid-cols-2">
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
                <div className="rounded-md border border-blue-100 bg-blue-50 p-4 sm:col-span-2">
                  <Sparkles className="text-blue-700" size={20} aria-hidden="true" />
                  <p className="mt-3 text-sm leading-6 text-blue-950">
                    На основе этих двух полей генератор подберет углы, хук,
                    формат ролика и CTA. Это будущая точка подключения LLM.
                  </p>
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="grid gap-4">
                <Field label="Имя контактного человека" required>
                  <input
                    value={brief.contactName}
                    onChange={(event) => update("contactName", event.target.value)}
                    className="input"
                    placeholder="Кто будет принимать материалы"
                    autoComplete="name"
                  />
                </Field>
                <Field label="Telegram, телефон или email" required>
                  <input
                    value={brief.contactMethod}
                    onChange={(event) => update("contactMethod", event.target.value)}
                    className="input"
                    placeholder="@username или +7..."
                    autoComplete="email"
                  />
                </Field>
                <div className="rounded-md border border-emerald-100 bg-emerald-50 p-4">
                  <CheckCircle2 className="text-emerald-700" size={20} aria-hidden="true" />
                  <p className="mt-3 text-sm leading-6 text-emerald-950">
                    После отправки будет создан заказ, сценарии и ссылка на
                    клиентскую галерею. Данные сохраняются только в браузере.
                  </p>
                </div>
              </section>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                disabled={step === 0}
                onClick={() => setStep((current) => Math.max(0, current - 1))}
                className="rf-focus min-h-12 rounded-md border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 transition hover:border-slate-950 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Назад
              </button>
              <button
                type="submit"
                disabled={!stepIsValid || submitted}
                className="rf-focus inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-rose-600 px-5 py-3 font-black text-white shadow-lg shadow-rose-600/18 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
              >
                {step === steps.length - 1 ? "Создать пакет" : "Дальше"}
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            </div>
          </form>
        </div>
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
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-800">
        {label} {required && <span className="text-rose-600">*</span>}
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
    <fieldset>
      <legend className="mb-2 text-sm font-bold text-slate-800">{label}</legend>
      <div className="grid gap-2">
        {options.map(([key, text]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={cn(
              "rf-focus min-h-12 cursor-pointer rounded-md border px-4 py-3 text-left text-sm font-bold transition",
              value === key
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-rose-100 bg-white text-slate-700 hover:border-rose-300",
            )}
          >
            {text}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
