import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { AmbientVideo } from "@/components/ambient-video";
import { FinalCta } from "@/components/final-cta";
import { HeroVideoRotator } from "@/components/hero-video-rotator";
import { Button } from "@/components/ui/button";

const mediaBase = process.env.GITHUB_PAGES === "true" ? "/kreoflow" : "";

const nav = [
  ["Работы", "#work"],
  ["Процесс", "#method"],
  ["Пакеты", "#packages"],
  ["Бриф", "/brief"],
];

const productFilms = [
  {
    number: "01",
    category: "Аудио",
    title: "Колонка",
    video: "/media/cases/kf-style-speaker.mp4",
    poster: "/media/cases/kf-style-speaker-poster.png",
    className: "kf-product-film--wide",
  },
  {
    number: "02",
    category: "Оптика",
    title: "Объектив",
    video: "/media/kf-product-lens.mp4",
    poster: "/media/kf-product-lens-poster.jpg",
    className: "",
  },
  {
    number: "03",
    category: "Wearables",
    title: "Наушники",
    video: "/media/kf-product-headphones.mp4",
    poster: "/media/kf-product-headphones-poster.jpg",
    className: "",
  },
  {
    number: "04",
    category: "Detail",
    title: "Украшение",
    video: "/media/cases/kf-style-ring.mp4",
    poster: "/media/cases/kf-style-ring-poster.png",
    className: "kf-product-film--wide",
  },
];

const processSteps = [
  ["01", "Оффер"],
  ["02", "Арт-дирекшн"],
  ["03", "Готовые ролики"],
];

const packages = [
  { number: "01", name: "100 credits", volume: "для первых пользователей", price: "990 ₽" },
];

export default function Home() {
  return (
    <main className="kf-page">
      <Hero />
      <ProductShowcase />
      <CompactMethod />
      <Delivery />
      <Packages />
      <FinalCta />
      <Footer />
    </main>
  );
}

function Hero() {
  return (
    <section className="kf-hero" aria-label="KreoFlow — рекламные видео для продуктов">
      <HeroVideoRotator mediaBase={mediaBase} />
      <div className="kf-hero-grade" aria-hidden="true" />

      <header className="kf-hero-top">
        <Link href="/" className="rf-focus kf-wordmark" aria-label="KreoFlow на главную">
          KreoFlow
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Основная навигация">
          {nav.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              prefetch={href === "/brief" ? false : undefined}
              className="rf-focus rf-nav-link kf-nav-link"
            >
              {label}
            </Link>
          ))}
        </nav>
        <Link href="/brief" prefetch={false} className="rf-focus kf-menu-link" aria-label="Перейти к брифу">
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
              <Link href="/brief" prefetch={false}>
                Создать видео
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

function ProductShowcase() {
  return (
    <section id="work" className="kf-product-showcase" aria-labelledby="product-showcase-title">
      <div className="kf-band-inner">
        <header className="kf-product-showcase__heading">
          <h2 id="product-showcase-title">Ваш продукт. Главный герой.</h2>
          <p>Рекламные ролики, которые хочется досмотреть.</p>
        </header>

        <div className="kf-product-film-grid">
          {productFilms.map((film) => (
            <article key={film.number} className={`kf-product-film ${film.className}`.trim()}>
              <div className="kf-product-film__media">
                <AmbientVideo
                  src={`${mediaBase}${film.video}`}
                  poster={`${mediaBase}${film.poster}`}
                />
              </div>
              <footer>
                <span>{film.number}</span>
                <p>{film.category}</p>
                <h3>{film.title}</h3>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CompactMethod() {
  return (
    <section id="method" className="kf-compact-method" aria-labelledby="method-title">
      <div className="kf-band-inner">
        <header>
          <p>От продукта до запуска</p>
          <h2 id="method-title">Один продукт. Серия креативов.</h2>
        </header>

        <div className="kf-compact-method__steps">
          {processSteps.map(([number, title]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Delivery() {
  return (
    <section className="kf-compact-delivery" aria-labelledby="delivery-title">
      <div className="kf-band-inner">
        <h2 id="delivery-title">Готово к публикации.</h2>
        <div>
          <strong>от 590 ₽</strong>
          <span>за готовое видео</span>
        </div>
      </div>
    </section>
  );
}

function Packages() {
  return (
    <section id="packages" className="kf-packages-band kf-packages-band--compact" aria-labelledby="packages-title">
      <div className="kf-band-inner">
        <div className="kf-packages-heading">
          <p className="kf-kicker">Пакеты</p>
          <h2 id="packages-title">Ранний доступ.</h2>
        </div>

        <div className="kf-package-list kf-package-list--compact">
          {packages.map((item) => (
            <article key={item.number}>
              <span>{item.number}</span>
              <h3>{item.name}</h3>
              <p>{item.volume}</p>
              <strong>{item.price}</strong>
              <Link href="/brief" prefetch={false} aria-label={`Выбрать пакет ${item.name}`}>
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
        <p>Product video creatives</p>
        <Link href="/brief" prefetch={false}>Начать проект</Link>
      </div>
    </footer>
  );
}
