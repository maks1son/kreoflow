import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const mediaBase = process.env.GITHUB_PAGES === "true" ? "/kreoflow" : "";
const asset = (path: string) => `${mediaBase}${path}`;

const heroShots = [
  {
    src: "/media/campaign/kreoflow-watch.webp",
    alt: "Рекламный кадр минималистичных часов",
    className: "kfn-hero-shot kfn-hero-shot--watch",
  },
  {
    src: "/media/campaign/kreoflow-sneaker.webp",
    alt: "Рекламный кадр белых кроссовок",
    className: "kfn-hero-shot kfn-hero-shot--sneaker",
  },
  {
    src: "/media/campaign/kreoflow-eyewear.webp",
    alt: "Рекламный кадр чёрных очков",
    className: "kfn-hero-shot kfn-hero-shot--eyewear",
  },
  {
    src: "/media/campaign/kreoflow-perfume.webp",
    alt: "Рекламный кадр флакона парфюма",
    className: "kfn-hero-shot kfn-hero-shot--perfume",
  },
  {
    src: "/media/campaign/kreoflow-headphones.webp",
    alt: "Рекламный кадр чёрных наушников",
    className: "kfn-hero-shot kfn-hero-shot--headphones",
  },
  {
    src: "/media/campaign/kreoflow-speaker.webp",
    alt: "Рекламный кадр беспроводной колонки",
    className: "kfn-hero-shot kfn-hero-shot--speaker",
  },
];

const formats = [
  ["01", "Product hero", "Товар становится главным объектом кадра."],
  ["02", "Detail film", "Фактура, свет и детали, которые хочется рассмотреть."],
  ["03", "Lifestyle", "Продукт в живой сцене без дорогой съёмки."],
  ["04", "Offer cut", "Цена, выгода и CTA без визуального шума."],
  ["05", "UGC angle", "Нативная подача под Reels, Shorts и Ads."],
  ["06", "Adaptations", "Версии под площадки, форматы и новые офферы."],
];

const steps = [
  ["01", "Ссылка", "Даёшь карточку товара, сайт или фото."],
  ["02", "Направление", "Получаешь визуальную идею до производства."],
  ["03", "Креатив", "Забираешь готовый рекламный ролик."],
];

export default function Home() {
  return (
    <main id="main-content" className="kfn-page">
      <Hero />
      <Proof />
      <CreativeSystem />
      <CampaignCase />
      <Method />
      <Access />
      <Footer />
    </main>
  );
}

function Hero() {
  return (
    <section className="kfn-hero" aria-labelledby="hero-title">
      <div className="kfn-rail" aria-hidden="true">
        <span className="kfn-rail-mark">K</span>
        <span className="kfn-rail-copy">AI creative production</span>
      </div>

      <header className="kfn-header">
        <Link href="/" className="kfn-wordmark" aria-label="KreoFlow, на главную">
          KreoFlow
        </Link>
        <nav className="kfn-nav" aria-label="Основная навигация">
          <a href="#work">Работы</a>
          <a href="#method">Процесс</a>
          <a href="#access">Доступ</a>
        </nav>
        <Link href="/brief" prefetch={false} className="kfn-header-link">
          Начать
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </header>

      <div className="kfn-hero-stage">
        <h1 className="kfn-hero-title" id="hero-title">
          <span className="kfn-hero-line kfn-hero-line--serif">Создаём</span>
          <span className="kfn-hero-line kfn-hero-line--solid">креативы</span>
          <span className="kfn-hero-line kfn-hero-line--serif">для продукта</span>
        </h1>

        {heroShots.map((shot, index) => (
          <figure className={shot.className} key={shot.src}>
            <Image
              src={asset(shot.src)}
              alt={shot.alt}
              fill
              priority
              sizes={index === 5 ? "(max-width: 767px) 36vw, 15vw" : "(max-width: 767px) 34vw, 13vw"}
            />
          </figure>
        ))}

        <span className="kfn-signal-mark" aria-hidden="true">*</span>
      </div>

      <div className="kfn-hero-foot">
        <p>AI-реклама для товаров и услуг</p>
        <Link href="/brief" prefetch={false} className="kfn-text-cta">
          Создать первый креатив
          <ArrowUpRight aria-hidden="true" />
        </Link>
        <p className="kfn-hero-location">KreoFlow / 2026</p>
      </div>
    </section>
  );
}

function Proof() {
  return (
    <section className="kfn-proof" id="work" aria-labelledby="proof-title">
      <div className="kfn-proof-copy">
        <p className="kfn-kicker">Не шаблон. Рекламная идея.</p>
        <h2 id="proof-title">Один товар.<br />Серия сцен.</h2>
        <p>
          Из ссылки на продукт собираем цельную визуальную кампанию: от первого кадра до готового ролика.
        </p>
        <Button asChild className="kfn-button kfn-button--signal">
          <Link href="/brief" prefetch={false}>
            Показать продукт
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </Button>
      </div>

      <div className="kfn-proof-collage" aria-label="Примеры рекламных направлений">
        <figure className="kfn-proof-image kfn-proof-image--main">
          <Image
            src={asset("/media/campaign/kreoflow-perfume.webp")}
            alt="Креатив для парфюмерного продукта"
            fill
            sizes="(max-width: 767px) 62vw, 28vw"
          />
        </figure>
        <figure className="kfn-proof-image kfn-proof-image--top">
          <Image
            src={asset("/media/campaign/kreoflow-eyewear.webp")}
            alt="Креатив для модных очков"
            fill
            sizes="(max-width: 767px) 42vw, 18vw"
          />
        </figure>
        <figure className="kfn-proof-image kfn-proof-image--bottom">
          <Image
            src={asset("/media/campaign/kreoflow-sneaker.webp")}
            alt="Креатив для спортивной обуви"
            fill
            sizes="(max-width: 767px) 44vw, 19vw"
          />
        </figure>
      </div>
    </section>
  );
}

function CreativeSystem() {
  return (
    <section className="kfn-system" aria-labelledby="system-title">
      <div className="kfn-system-media" aria-hidden="true">
        <Image
          src={asset("/media/campaign/kreoflow-speaker.webp")}
          alt=""
          fill
          sizes="100vw"
        />
      </div>
      <div className="kfn-system-head">
        <p className="kfn-kicker">Creative system / 01—06</p>
        <h2 id="system-title">Из продукта<br />в кампанию.</h2>
      </div>
      <div className="kfn-format-grid">
        {formats.map(([number, title, copy]) => (
          <article className="kfn-format" key={number}>
            <span>{number}</span>
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function CampaignCase() {
  return (
    <section className="kfn-case" aria-labelledby="case-title">
      <div className="kfn-case-copy">
        <p className="kfn-kicker">Один объект / три характера</p>
        <h2 id="case-title">Не просто<br />показать.<br /><em>Продать.</em></h2>
        <p>
          Для одного продукта можно проверить разные эмоции, аудитории и офферы, не организуя новую съёмку.
        </p>
        <a href="#method" className="kfn-inline-link">
          Как это работает
          <ArrowUpRight aria-hidden="true" />
        </a>
      </div>

      <div className="kfn-case-gallery">
        <figure className="kfn-case-image kfn-case-image--watch">
          <Image
            src={asset("/media/campaign/kreoflow-watch.webp")}
            alt="Минималистичный креатив для часов"
            fill
            sizes="(max-width: 767px) 62vw, 28vw"
          />
          <figcaption>Precision / 01</figcaption>
        </figure>
        <figure className="kfn-case-image kfn-case-image--headphones">
          <Image
            src={asset("/media/campaign/kreoflow-headphones.webp")}
            alt="Технологичный креатив для наушников"
            fill
            sizes="(max-width: 767px) 54vw, 23vw"
          />
          <figcaption>Energy / 02</figcaption>
        </figure>
      </div>
    </section>
  );
}

function Method() {
  return (
    <section className="kfn-method" id="method" aria-labelledby="method-title">
      <div className="kfn-method-head">
        <p className="kfn-kicker">От ссылки до выдачи</p>
        <h2 id="method-title">Три шага.<br />Ничего лишнего.</h2>
      </div>
      <div className="kfn-steps">
        {steps.map(([number, title, copy]) => (
          <article className="kfn-step" key={number}>
            <span>{number}</span>
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Access() {
  return (
    <section className="kfn-access" id="access" aria-labelledby="access-title">
      <p className="kfn-kicker">Early access / первые пользователи</p>
      <div className="kfn-access-layout">
        <h2 id="access-title">Твой продукт.<br />Наша подача.</h2>
        <div className="kfn-access-offer">
          <p><strong>100</strong> credits</p>
          <p><strong>990 ₽</strong> на старте</p>
          <p>Готовые ролики — от 590 ₽</p>
        </div>
        <Button asChild className="kfn-button kfn-button--dark">
          <Link href="/brief" prefetch={false}>
            Попробовать KreoFlow
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="kfn-footer">
      <Link href="/" className="kfn-footer-brand">KreoFlow</Link>
      <p>AI creative production</p>
      <div>
        <Link href="/brief" prefetch={false}>Бриф</Link>
        <Link href="/studio">Studio</Link>
      </div>
    </footer>
  );
}
