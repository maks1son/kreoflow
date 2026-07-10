import Link from "next/link";
import { HeroVideoRotator } from "@/components/hero-video-rotator";

const mediaBase = process.env.GITHUB_PAGES === "true" ? "/kreoflow" : "";

const nav = [
  ["Метод", "#method"],
  ["Выдача", "#delivery"],
  ["Пакеты", "#packages"],
  ["Бриф", "/brief"],
];

const productionRows = [
  ["01", "Бриф", "оффер, ниша, аудитория, стиль", "12 мин"],
  ["02", "Матрица", "боль, доверие, демонстрация, акция", "18 мин"],
  ["03", "Сценарии", "хуки, кадры, подписи, CTA", "40 мин"],
  ["04", "Сборка", "UGC, монтаж, субтитры, обложки", "72 ч"],
];

const delivery = [
  ["12", "коротких видео"],
  ["24", "хука и подписи"],
  ["04", "формата сценариев"],
  ["01", "страница выдачи"],
];

const proof = [
  {
    label: "Что продаем",
    title: "Поток креативов",
    text: "Не доступ к генератору. Клиент получает готовый пакет, который можно публиковать и тестировать.",
  },
  {
    label: "Почему купят",
    title: "Меньше координации",
    text: "Бриф, идеи, сценарии, статусы, файлы и правки живут в одном понятном маршруте.",
  },
  {
    label: "Первый рынок",
    title: "Визуальные бизнесы",
    text: "Кафе, шоурумы, фитнес, бьюти, курсы и локальные сервисы покупают не AI, а регулярный поток понятных видео.",
  },
];

const packages = [
  ["Mini audit", "0-5 000 ₽", "5 хуков, 3 угла, пример сценария и демо-выдача."],
  ["Test pack", "15 000-30 000 ₽", "5 роликов или production-ready концептов для проверки спроса."],
  ["Content sprint", "40 000-90 000 ₽", "10-15 роликов, подписи, обложки, календарь и правки."],
];

const businessCases = [
  {
    label: "skincare / clean launch",
    title: "Товар выглядит дороже",
    text: "Пустая этикетка, спокойный свет, крупный кадр. Подходит для косметики, ухода, wellness и small brand.",
    output: "minimal product shot",
    video: "/media/cases/kf-product-serum.mp4",
    poster: "/media/cases/kf-product-serum-poster.png",
  },
  {
    label: "beauty / detail",
    title: "Деталь продает ощущение",
    text: "Один предмет, один жест, один чистый визуальный акцент. Без логотипов и лишнего шума.",
    output: "macro desire clip",
    video: "/media/cases/kf-product-lipstick.mp4",
    poster: "/media/cases/kf-product-lipstick-poster.png",
  },
  {
    label: "premium / jewelry",
    title: "Маленький предмет становится желанием",
    text: "Украшения, подарки, лимитки, аксессуары. Кадр строится вокруг блеска, фактуры и тишины.",
    output: "luxury detail reel",
    video: "/media/cases/kf-product-ring.mp4",
    poster: "/media/cases/kf-product-ring-poster.png",
  },
  {
    label: "coffee / packaged taste",
    title: "Вкус можно показать до покупки",
    text: "Кофе, чай, десерты, напитки, локальная еда. Не кухня, а готовое желание в кадре.",
    output: "taste product reel",
    video: "/media/cases/kf-product-coffee.mp4",
    poster: "/media/cases/kf-product-coffee-poster.png",
  },
  {
    label: "home / scent",
    title: "Домашний продукт получает настроение",
    text: "Свечи, интерьер, текстиль, ароматы, декор. Минимальный кадр делает предмет теплее.",
    output: "ambient product loop",
    video: "/media/cases/kf-product-candle.mp4",
    poster: "/media/cases/kf-product-candle-poster.png",
  },
  {
    label: "table / seasonal product",
    title: "Композиция делает товар сценой",
    text: "Подарочные наборы, десерты, сервировка, локальные продукты. Атмосфера вместо случайной фотки.",
    output: "seasonal product story",
    video: "/media/cases/kf-product-table.mp4",
    poster: "/media/cases/kf-product-table-poster.png",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#080909] text-[#f5f1e8]">
      <div className="rf-noise" aria-hidden="true" />

      <Hero />
      <DemoCreative />
      <BusinessVideoCases />

      <section id="method" className="mx-auto grid max-w-[1380px] gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:px-8">
        <div className="rf-section-title">
          <p>method</p>
          <h2>Вся страница построена вокруг одного доказательства: продукт можно показать дорого.</h2>
        </div>

        <div className="rf-ledger">
          {productionRows.map(([num, title, text, time]) => (
            <div key={num} className="rf-ledger-row">
              <span>{num}</span>
              <strong>{title}</strong>
              <p>{text}</p>
              <em>{time}</em>
            </div>
          ))}
        </div>
      </section>

      <section id="delivery" className="mx-auto grid max-w-[1380px] gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="rf-delivery-board">
          <div className="rf-delivery-header">
            <span>client delivery</span>
            <span>ready for review</span>
          </div>
          <div className="rf-delivery-grid">
            {delivery.map(([value, label]) => (
              <div key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="rf-caption-stack">
            <p>Hook: “Почему первая процедура часто не продает сама себя”</p>
            <p>Caption: “Один предмет, спокойный свет и понятный оффер. Вот три кадра, которые делают продукт желанным.”</p>
            <p>CTA: “Напишите ‘уход’, пришлем свободные окна на эту неделю.”</p>
          </div>
        </div>

        <div className="rf-proof-grid">
          {proof.map((item) => (
            <article key={item.title} className="rf-proof-card">
              <p>{item.label}</p>
              <h3>{item.title}</h3>
              <span>{item.text}</span>
            </article>
          ))}
        </div>
      </section>

      <section id="packages" className="mx-auto max-w-[1380px] px-4 py-8 pb-12 sm:px-6 lg:px-8">
        <div className="rf-package-shell">
          <div className="rf-package-head">
            <div>
              <p>commercial ladder</p>
              <h2>Продаем маленький вход, а не огромный ретейнер с первого сообщения.</h2>
            </div>
            <Link href="/brief" className="rf-focus rf-main-cta rf-main-cta-dark">
              Перейти к брифу
              <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <div className="rf-package-grid">
            {packages.map(([name, price, text]) => (
              <article key={name} className="rf-package-card">
                <p>{name}</p>
                <strong>{price}</strong>
                <span>{text}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
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
        <div className="kf-hero-meta">
          <span>universal demo case</span>
          <span>brandless product mood</span>
          <span>3 calm product clips</span>
        </div>

        <div className="kf-hero-bottom">
          <h1>AI Video Lab</h1>
          <div className="kf-hero-actions">
            <p>
              Один оффер превращаем в серию роликов, хуков, подписей и страницу выдачи. Это можно показать клиенту до продажи пакета.
            </p>
            <div>
              <Link href="/brief" className="rf-focus rf-main-cta">
                Запустить бриф
                <span aria-hidden="true">↗</span>
              </Link>
              <Link href="#demo-creative" className="rf-focus rf-secondary-cta">
                Смотреть креатив
                <span aria-hidden="true">↓</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DemoCreative() {
  return (
    <section
      id="demo-creative"
      className="mx-auto grid max-w-[1380px] gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8"
    >
      <div className="kf-demo-phone">
        <video
          src={`${mediaBase}/media/kreoflow-local-retail-demo.mp4`}
          poster={`${mediaBase}/media/kreoflow-lab-poster.png`}
          controls
          muted
          playsInline
          preload="metadata"
        />
      </div>

      <div className="kf-demo-copy">
        <div className="rf-microline">
          <span>real footage sample</span>
          <span>web hero + vertical cut</span>
        </div>
        <h2>Не фон для красоты, а пример того, что мы продаем.</h2>
        <p>
          Универсальный кейс: локальный визуальный бизнес запускает оффер. Из одного кадра собирается ролик для Reels,
          Shorts или VK Clips: хук, крупная типографика, понятный результат и CTA.
        </p>
        <div className="kf-demo-prompt">
          <span>Prompt direction</span>
          <p>
            Real product footage, tactile movement, no watermark, no AI artifacts. This is the quality bar for public hero
            assets before testing custom generated client scenes.
          </p>
        </div>
      </div>
    </section>
  );
}

function BusinessVideoCases() {
  return (
    <section className="mx-auto max-w-[1380px] px-4 py-8 sm:px-6 lg:px-8" aria-labelledby="business-cases-title">
      <div className="kf-cases-head">
        <div>
          <p>business proof</p>
          <h2 id="business-cases-title">Клиент должен увидеть товар, который хочется купить.</h2>
        </div>
        <span>
          Не показываем производство ради производства. Берем предмет, свет, фактуру и настроение, а потом превращаем это в хук,
          сценарий, ролик, подпись и страницу выдачи.
        </span>
      </div>

      <div className="kf-case-grid">
        {businessCases.map((item) => (
          <article key={item.title} className="kf-case-card">
            <video
              src={`${mediaBase}${item.video}`}
              poster={`${mediaBase}${item.poster}`}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
            <div className="kf-case-overlay">
              <p>{item.label}</p>
              <h3>{item.title}</h3>
              <span>{item.text}</span>
              <strong>{item.output}</strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
