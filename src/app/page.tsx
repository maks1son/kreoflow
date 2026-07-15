import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const mediaBase = process.env.GITHUB_PAGES === "true" ? "/kreoflow" : "";
const asset = (path: string) => `${mediaBase}${path}`;

const heroShots = [
  {
    src: "/media/campaign/kreoflow-editorial-watch-still-life.webp",
    alt: "Предметная фотосессия серебристых часов в бумажном коллаже с ручной краской",
    className: "kfn-hero-shot kfn-hero-shot--cover",
  },
  {
    src: "/media/campaign/kreoflow-editorial-portrait.webp",
    alt: "Редакционный портрет в очках с ручной коллажной обработкой",
    className: "kfn-hero-shot kfn-hero-shot--portrait",
  },
  {
    src: "/media/campaign/kreoflow-editorial-group.webp",
    alt: "Кампания с людьми и предметами в цветном студийном свете",
    className: "kfn-hero-shot kfn-hero-shot--group",
  },
  {
    src: "/media/campaign/kreoflow-editorial-center.webp",
    alt: "Fashion-портрет с флаконом и ручными штрихами краски",
    className: "kfn-hero-shot kfn-hero-shot--center",
  },
  {
    src: "/media/campaign/kreoflow-editorial-sneakers.webp",
    alt: "Девушка с белыми кроссовками в рекламной фотосессии",
    className: "kfn-hero-shot kfn-hero-shot--sneakers",
  },
  {
    src: "/media/campaign/kreoflow-editorial-backpack.webp",
    alt: "Рекламный кадр технического рюкзака в формате contact sheet",
    className: "kfn-hero-shot kfn-hero-shot--backpack",
  },
];

const formats = [
  ["01", "Первый кадр", "Образ, который останавливает скролл и сразу показывает характер продукта."],
  ["02", "Деталь", "Фактура, свет и крупный план, чтобы вещь захотелось рассмотреть."],
  ["03", "В движении", "Продукт на человеке или в живой сцене, а не в пустом мокапе."],
  ["04", "Оффер", "Понятная версия под запуск, акцию или конкретную аудиторию."],
  ["05", "Соцсети", "Нативный монтаж и подача для Reels, Shorts и рекламных лент."],
  ["06", "Серия", "Несколько визуальных ходов из одной идеи для быстрого теста."],
];

const steps = [
  ["01", "Показываешь продукт", "Ссылка, фотографии, описание и задача. Без длинного технического задания."],
  ["02", "Выбираешь направление", "Сначала видишь идею, кадры и характер кампании. Потом запускаем производство."],
  ["03", "Получаешь креативы", "Готовые ролики, обложки и версии под нужные площадки в одной выдаче."],
];

export default function Home() {
  return (
    <main id="main-content" className="kfn-page">
      <Hero />
      <CampaignIntro />
      <FormatBoard />
      <ProductCase />
      <Method />
      <Access />
      <Footer />
    </main>
  );
}

function Hero() {
  return (
    <section className="kfn-hero" aria-labelledby="hero-title">
      <header className="kfn-header">
        <Link href="/" className="kfn-wordmark" aria-label="KreoFlow, на главную">
          KreoFlow
        </Link>
        <nav className="kfn-nav" aria-label="Основная навигация">
          <a href="#work">Кампания</a>
          <a href="#method">Процесс</a>
          <a href="#access">Старт</a>
        </nav>
        <Link href="/brief" prefetch={false} className="kfn-header-link">
          Обсудить проект
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </header>

      <div className="kfn-hero-stage">
        <h1 className="kfn-hero-title" id="hero-title">
          <span className="kfn-hero-line kfn-hero-line--serif">Создаём</span>
          <span className="kfn-hero-line kfn-hero-line--serif">рекламу</span>
          <span className="kfn-hero-line kfn-hero-line--solid">которую</span>
          <span className="kfn-hero-line kfn-hero-line--serif">не пролистать</span>
        </h1>

        {heroShots.map((shot, index) => (
          <figure className={shot.className} key={shot.src}>
            <Image
              src={asset(shot.src)}
              alt={shot.alt}
              fill
              priority={index < 4}
              sizes="(max-width: 767px) 38vw, (max-width: 1199px) 24vw, 16vw"
            />
          </figure>
        ))}

        <span className="kfn-signal-doodle" aria-hidden="true">
          <Image
            src={asset("/media/campaign/kreoflow-signal-flame.png")}
            alt=""
            fill
            priority
            sizes="140px"
            style={{ objectFit: "contain", transform: "scale(1.6)" }}
          />
        </span>
        <span className="kfn-pencil-note" aria-hidden="true">art / product / motion</span>
      </div>

      <Link
        href="/brief"
        prefetch={false}
        className="kfn-hero-cta"
      >
        <span className="kfn-hero-cta__liquid" aria-hidden="true" />
        <span className="kfn-hero-cta__label">Запустить кампанию</span>
        <ArrowUpRight aria-hidden="true" />
      </Link>
    </section>
  );
}

function CampaignIntro() {
  return (
    <section className="kfn-proof" id="work" aria-labelledby="proof-title">
      <div className="kfn-proof-copy">
        <p className="kfn-kicker">Не шаблон. Кампания.</p>
        <h2 id="proof-title">Один продукт.<br />Целый мир.</h2>
        <p>
          Собираем визуальную идею, в которой продукт живёт: в руках, на человеке, в свете, фактуре и движении. Потом превращаем её в серию рекламных креативов.
        </p>
        <Button asChild className="kfn-button kfn-button--signal">
          <Link href="/brief" prefetch={false}>
            Показать продукт
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </Button>
      </div>

      <div className="kfn-proof-collage" aria-label="Фрагменты рекламной кампании">
        <figure className="kfn-proof-image kfn-proof-image--main">
          <Image
            src={asset("/media/campaign/kreoflow-editorial-center.webp")}
            alt="Портретная рекламная кампания для продукта"
            fill
            sizes="(max-width: 767px) 64vw, 31vw"
          />
        </figure>
        <figure className="kfn-proof-image kfn-proof-image--top">
          <Image
            src={asset("/media/campaign/kreoflow-editorial-headphones.webp")}
            alt="Редакционный кадр продукта на человеке"
            fill
            sizes="(max-width: 767px) 42vw, 19vw"
          />
        </figure>
        <figure className="kfn-proof-image kfn-proof-image--bottom">
          <Image
            src={asset("/media/campaign/kreoflow-editorial-group.webp")}
            alt="Групповой рекламный кадр с несколькими продуктами"
            fill
            sizes="(max-width: 767px) 48vw, 23vw"
          />
        </figure>
      </div>
    </section>
  );
}

function FormatBoard() {
  return (
    <section className="kfn-system" aria-labelledby="system-title">
      <div className="kfn-system-media" aria-hidden="true">
        <Image
          src={asset("/media/campaign/kreoflow-editorial-group.webp")}
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

function ProductCase() {
  return (
    <section className="kfn-case" aria-labelledby="case-title">
      <div className="kfn-case-copy">
        <p className="kfn-kicker">Продукт в центре</p>
        <h2 id="case-title">Вещь,<br />которую<br /><em>хочется.</em></h2>
        <p>
          Не прячем товар за эффектами. Показываем его так, чтобы человек почувствовал характер, материал и желание выбрать именно его.
        </p>
        <a href="#method" className="kfn-inline-link">
          Как это работает
          <ArrowUpRight aria-hidden="true" />
        </a>
      </div>

      <div className="kfn-case-gallery">
        <figure className="kfn-case-image kfn-case-image--primary">
          <Image
            src={asset("/media/campaign/kreoflow-editorial-sneakers.webp")}
            alt="Fashion-кампания с кроссовками на человеке"
            fill
            sizes="(max-width: 767px) 100vw, 42vw"
          />
        </figure>
        <figure className="kfn-case-image kfn-case-image--secondary">
          <Image
            src={asset("/media/campaign/kreoflow-editorial-backpack.webp")}
            alt="Редакционный рекламный кадр рюкзака"
            fill
            sizes="(max-width: 767px) 58vw, 25vw"
          />
        </figure>
        <p className="kfn-case-caption">Product / people / desire</p>
      </div>
    </section>
  );
}

function Method() {
  return (
    <section className="kfn-method" id="method" aria-labelledby="method-title">
      <div className="kfn-method-head">
        <p className="kfn-kicker">Три шага вместо продакшн-хаоса</p>
        <h2 id="method-title">Как<br />работаем.</h2>
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
      <p className="kfn-kicker">Первый запуск</p>
      <h2 id="access-title">Покажи продукт.<br />Мы покажем идею.</h2>
      <div className="kfn-access-offer">
        <p>Короткий бриф, визуальное направление и первый набор сцен для твоей рекламы.</p>
        <Button asChild className="kfn-button kfn-button--dark">
          <Link href="/brief" prefetch={false}>
            Начать проект
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
      <a href="#main-content">Наверх</a>
    </footer>
  );
}
