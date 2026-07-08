import Link from "next/link";
import { Brand } from "@/components/brand";

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

const shots = [
  ["H01", "Первый визит без страха", "UGC"],
  ["E04", "Эксперт объясняет процедуру", "Expert"],
  ["O12", "Запись на пробную неделю", "Offer"],
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
    title: "Бьюти и фитнес",
    text: "Там постоянно нужны Reels, Shorts и VK Clips, а результат легко показать через доверие, процесс и запись.",
  },
];

const packages = [
  ["Mini audit", "0-5 000 ₽", "5 хуков, 3 угла, пример сценария и демо-выдача."],
  ["Test pack", "15 000-30 000 ₽", "5 роликов или production-ready концептов для проверки спроса."],
  ["Content sprint", "40 000-90 000 ₽", "10-15 роликов, подписи, обложки, календарь и правки."],
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#080909] text-[#f5f1e8]">
      <div className="rf-noise" aria-hidden="true" />

      <header className="mx-auto flex w-full max-w-[1380px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Brand />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Основная навигация">
          {nav.map(([label, href]) => (
            <Link key={label} href={href} className="rf-focus rf-nav-link">
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <section className="mx-auto grid max-w-[1380px] gap-5 px-4 pb-8 pt-4 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:px-8">
        <div className="rf-plate rf-hero-copy">
          <div className="rf-microline">
            <span>creative production desk</span>
            <span>72h sprint</span>
          </div>

          <h1 className="rf-hero-title">
            Не SMM. Не генератор. Линия производства роликов.
          </h1>

          <p className="rf-hero-text">
            KreoFlow превращает бриф бьюти или фитнес-бизнеса в сценарии, короткие креативы,
            подписи и страницу выдачи. Без случайных идей, потерянных файлов и бесконечных чатов.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/brief" className="rf-focus rf-main-cta">
              Запустить тестовый пакет
              <span aria-hidden="true">↗</span>
            </Link>
            <Link href="/delivery?orderId=rf-demo-beauty" className="rf-focus rf-secondary-cta">
              Смотреть выдачу
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <ProductionDesk />
      </section>

      <section id="method" className="mx-auto grid max-w-[1380px] gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:px-8">
        <div className="rf-section-title">
          <p>method</p>
          <h2>Вся страница построена вокруг одного доказательства: процесс виден.</h2>
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
            <p>Caption: “Покажите процесс, а не только результат. Вот три кадра, которые снимают тревогу клиента.”</p>
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

function ProductionDesk() {
  return (
    <div className="rf-desk" aria-label="Пример производственного стола KreoFlow">
      <div className="rf-desk-top">
        <span>order KF-072</span>
        <span>beauty studio launch</span>
        <span>stage 03 / scripts</span>
      </div>

      <div className="rf-shot-grid">
        {shots.map(([code, title, type], index) => (
          <figure key={code} className="rf-shot-card">
            <div className={`rf-shot-visual rf-shot-visual-${index + 1}`}>
              <span>{code}</span>
            </div>
            <figcaption>
              <strong>{title}</strong>
              <span>{type}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="rf-script-panel">
        <div>
          <span>script extract</span>
          <strong>“Покажите не идеальную картинку, а момент решения: человек понимает, что ему не надо разбираться самому.”</strong>
        </div>
        <div>
          <span>output</span>
          <strong>12 роликов, 24 подписи, 4 CTA, 1 delivery page</strong>
        </div>
      </div>
    </div>
  );
}
