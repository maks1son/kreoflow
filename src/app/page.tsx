import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { AmbientVideo } from "@/components/ambient-video";
import { FinalCta } from "@/components/final-cta";
import { HeroVideoRotator } from "@/components/hero-video-rotator";
import { Button } from "@/components/ui/button";

const mediaBase = process.env.GITHUB_PAGES === "true" ? "/kreoflow" : "";

const nav = [
  ["Метод", "#method"],
  ["Работы", "#work"],
  ["Пакеты", "#packages"],
  ["Бриф", "/brief"],
];

const methodSteps = [
  {
    number: "01",
    title: "Сначала оффер",
    text: "Вынимаем одну сильную мысль, которую зритель должен понять за первые секунды.",
  },
  {
    number: "02",
    title: "Затем визуальный язык",
    text: "Фиксируем свет, фактуру, движение, композицию и правила для всей серии роликов.",
  },
  {
    number: "03",
    title: "Не один вариант",
    text: "Собираем разные хуки и монтажные версии под Reels, Shorts и VK Clips.",
  },
  {
    number: "04",
    title: "Готово к запуску",
    text: "Передаем ролики, подписи, обложки и понятную последовательность публикации.",
  },
];

const selectedWork = [
  {
    label: "Launch macro / 01",
    title: "Фактура делает продукт новым",
    video: "/media/cases/kf-style-speaker.mp4",
    poster: "/media/cases/kf-style-speaker-poster.png",
    className: "kf-work-card--wide",
  },
  {
    label: "Monochrome / 02",
    title: "Движение вместо лишних слов",
    video: "/media/cases/kf-style-ink.mp4",
    poster: "/media/cases/kf-style-ink-poster.png",
    className: "",
  },
  {
    label: "Future space / 03",
    title: "Запуск ощущается как событие",
    video: "/media/cases/kf-style-cubes.mp4",
    poster: "/media/cases/kf-style-cubes-poster.png",
    className: "",
  },
  {
    label: "Material detail / 04",
    title: "Крупная деталь повышает ценность",
    video: "/media/cases/kf-style-ring.mp4",
    poster: "/media/cases/kf-style-ring-poster.png",
    className: "kf-work-card--wide",
  },
];

const packages = [
  {
    number: "01",
    name: "Тест",
    description: "5 коротких креативов, сценарии и подписи",
    price: "от 15 000 ₽",
  },
  {
    number: "02",
    name: "Поток",
    description: "12 роликов, 24 хука и страница выдачи",
    price: "от 35 000 ₽",
  },
  {
    number: "03",
    name: "Месяц",
    description: "30 креативов и еженедельные новые углы",
    price: "от 75 000 ₽",
  },
];

export default function Home() {
  return (
    <main className="kf-page">
      <Hero />
      <EditorialIntro />
      <Method />
      <SelectedWork />
      <Delivery />
      <Packages />
      <FinalCta />
      <Footer />
    </main>
  );
}

function Hero() {
  return (
    <section className="kf-hero" aria-label="KreoFlow video creative lab">
      <HeroVideoRotator mediaBase={mediaBase} />
      <div className="kf-hero-grade" aria-hidden="true" />

      <header className="kf-hero-top">
        <Link href="/" className="rf-focus kf-wordmark" aria-label="KreoFlow на главную">
          KreoFlow
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Основная навигация">
          {nav.map(([label, href]) => (
            <Link key={label} href={href} className="rf-focus rf-nav-link kf-nav-link">
              {label}
            </Link>
          ))}
        </nav>
        <Link href="/brief" className="rf-focus kf-menu-link" aria-label="Перейти к брифу">
          <span />
          <span />
          <span />
        </Link>
      </header>

      <div className="kf-hero-content">
        <div className="kf-hero-bottom kf-hero-bottom--clean">
          <h1>AI Video Lab</h1>
          <div className="kf-hero-actions">
            <Button asChild className="kf-hero-cta">
              <Link href="/brief">
                Оставить заявку
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="kf-hero-cta kf-hero-cta--secondary">
              <Link href="#work">
                Смотреть работы
                <ArrowDown aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function EditorialIntro() {
  return (
    <section id="demo-creative" className="kf-intro-band" aria-labelledby="intro-title">
      <div className="kf-band-inner kf-intro-layout">
        <div className="kf-intro-copy">
          <p className="kf-kicker">Creative production / 01</p>
          <h2 id="intro-title">От идеи до ролика, который хочется досмотреть.</h2>
          <p>
            KreoFlow превращает оффер бизнеса в визуальную систему: сценарии, короткие видео, подписи и готовую страницу
            выдачи.
          </p>
          <Button asChild className="kf-inline-cta">
            <Link href="/brief">
              Собрать тестовый пакет
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="kf-media-mosaic" aria-label="Примеры визуальных направлений">
          <figure className="kf-mosaic-main">
            <AmbientVideo
              src={`${mediaBase}/media/cases/kf-style-clock.mp4`}
              poster={`${mediaBase}/media/cases/kf-style-clock-poster.png`}
            />
            <figcaption>Precision / product film</figcaption>
          </figure>
          <figure>
            <AmbientVideo
              src={`${mediaBase}/media/cases/kf-style-smoke.mp4`}
              poster={`${mediaBase}/media/cases/kf-style-smoke-poster.png`}
            />
            <figcaption>Atmosphere / reveal</figcaption>
          </figure>
          <figure>
            <AmbientVideo
              src={`${mediaBase}/media/cases/kf-style-ink.mp4`}
              poster={`${mediaBase}/media/cases/kf-style-ink-poster.png`}
            />
            <figcaption>Motion / identity</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

function Method() {
  return (
    <section id="method" className="kf-method-band" aria-labelledby="method-title">
      <div className="kf-band-inner">
        <div className="kf-editorial-heading">
          <p className="kf-kicker">Method / 02</p>
          <h2 id="method-title">Не промпты. Визуальная система.</h2>
          <p>Каждый ролик отличается, но вся серия говорит одним языком и ведет к одному офферу.</p>
        </div>

        <div className="kf-method-grid">
          {methodSteps.map((step) => (
            <article key={step.number}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SelectedWork() {
  return (
    <section id="work" className="kf-work-band" aria-labelledby="work-title">
      <div className="kf-band-inner">
        <div className="kf-work-heading">
          <p className="kf-kicker">Selected directions / 03</p>
          <h2 id="work-title">Один продукт. Несколько рекламных языков.</h2>
        </div>

        <div className="kf-work-grid">
          {selectedWork.map((item) => (
            <article key={item.title} className={`kf-work-card ${item.className}`.trim()}>
              <AmbientVideo
                src={`${mediaBase}${item.video}`}
                poster={`${mediaBase}${item.poster}`}
              />
              <div>
                <p>{item.label}</p>
                <h3>{item.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Delivery() {
  const metrics = [
    ["12", "готовых роликов"],
    ["24", "хука и подписи"],
    ["03", "формата площадок"],
    ["72", "часа на пакет"],
  ];

  return (
    <section id="delivery" className="kf-delivery-band" aria-labelledby="delivery-title">
      <div className="kf-band-inner">
        <p className="kf-kicker">Delivery / 04</p>
        <h2 id="delivery-title">Пакет, который можно запускать.</h2>
        <div className="kf-delivery-metrics">
          {metrics.map(([value, label]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Packages() {
  return (
    <section id="packages" className="kf-packages-band" aria-labelledby="packages-title">
      <div className="kf-band-inner">
        <div className="kf-packages-heading">
          <p className="kf-kicker">Packages / 05</p>
          <h2 id="packages-title">Выберите объем.</h2>
        </div>

        <div className="kf-package-list">
          {packages.map((item) => (
            <article key={item.number}>
              <span>{item.number}</span>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <strong>{item.price}</strong>
              <Link href="/brief" aria-label={`Выбрать пакет ${item.name}`}>
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="kf-footer">
      <div className="kf-band-inner">
        <strong>KreoFlow</strong>
        <p>AI video creative production</p>
        <Link href="/brief">Начать проект</Link>
      </div>
    </footer>
  );
}
