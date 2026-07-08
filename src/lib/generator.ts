import type {
  BriefInput,
  CreativeAsset,
  CreativePlan,
  Goal,
  Niche,
  Order,
  Platform,
  Style,
} from "./types";

const platforms: Platform[] = ["Reels", "Shorts", "VK Clips"];

const nicheCopy: Record<Niche, { client: string; proof: string; scene: string }> = {
  beauty: {
    client: "клиентка",
    proof: "видимый результат и доверие к мастеру",
    scene: "светлая студия, крупные планы результата, руки мастера в работе",
  },
  fitness: {
    client: "клиент",
    proof: "прогресс, энергия и понятный путь к форме",
    scene: "зал, тренировка, короткие динамичные подходы, кадры до и после",
  },
};

const goalCopy: Record<Goal, string> = {
  leads: "заявку на консультацию",
  sales: "покупку или запись на услугу",
  awareness: "узнаваемость и доверие",
  content: "регулярный контент без выгорания",
};

const styleCopy: Record<Style, string> = {
  premium: "спокойно, дорого, с акцентом на качество",
  friendly: "тепло, живо, как рекомендация от знакомого",
  bold: "ярко, быстро, с сильным первым кадром",
  expert: "уверенно, с объяснением и доказательством",
};

export function generateCreativePlan(brief: BriefInput): CreativePlan {
  const niche = nicheCopy[brief.niche];
  const targetAction = goalCopy[brief.goal];
  const tone = styleCopy[brief.style];
  const offer = brief.offer.trim() || "основная услуга";
  const audience = brief.audience.trim() || "люди, которым нужен быстрый и понятный результат";

  return {
    angles: [
      `Боль аудитории: ${audience} откладывает запись, потому что не видит понятного результата.`,
      `Доказательство: показать ${niche.proof} через короткую историю клиента.`,
      `Оффер: упаковать "${offer}" как простой следующий шаг без давления.`,
      `Процесс: показать, что происходит внутри услуги, чтобы снять страх перед записью.`,
      `Сравнение: до обращения и после первого контакта с ${brief.businessName}.`,
    ],
    hooks: [
      `Если ты давно хотел(а) ${offer.toLowerCase()}, начни с этого.`,
      `Вот почему ${brief.businessName} снимает лишние сомнения перед записью.`,
      `3 кадра, после которых понятнее, подойдет ли тебе эта услуга.`,
      `Не покупай услугу вслепую: смотри, как выглядит процесс.`,
      `Самый короткий путь к результату: ${targetAction}.`,
      `Что обычно не показывают в рекламе, но важно знать до записи.`,
    ],
    scripts: [
      {
        title: "UGC-отзыв с первым сомнением",
        format: "ugc",
        durationSec: 20,
        script: `Кадр 1: ${niche.client} говорит: "Я долго сомневалась, но решила попробовать ${offer}". Кадр 2: показываем ${niche.scene}. Кадр 3: короткий результат и фраза "В ${brief.businessName} мне объяснили все до записи". Финал: CTA на ${targetAction}. Тон: ${tone}.`,
        caption: `Сомневаешься насчет ${offer.toLowerCase()}? Показываем процесс честно и понятно. Напиши нам, подберем время и формат.`,
      },
      {
        title: "Экспертный разбор частой ошибки",
        format: "expert",
        durationSec: 30,
        script: `Первый кадр: специалист в кадре. Текст: "Ошибка, из-за которой результат выглядит хуже, чем мог бы". Дальше 2-3 коротких объяснения простыми словами. Вставки: ${niche.scene}. Финал: "${brief.businessName} сначала разбирает задачу, потом предлагает решение".`,
        caption: `Перед записью важно понять не только цену, но и подход. В ${brief.businessName} объясняем, что подойдет именно вам.`,
      },
      {
        title: "До и после без агрессивной продажи",
        format: "before_after",
        durationSec: 15,
        script: `Монтаж из 5 коротких кадров: проблема, подготовка, процесс, деталь результата, спокойный финальный кадр. На экране: "Было непонятно, с чего начать. Стало понятно, что делать дальше". CTA: ${targetAction}.`,
        caption: `Один короткий ролик лучше длинных обещаний. Посмотрите результат и задайте вопрос в сообщениях.`,
      },
      {
        title: "Оффер недели",
        format: "offer",
        durationSec: 15,
        script: `Первый кадр с сильной подписью: "${offer}". Второй кадр: кому подходит - ${audience}. Третий кадр: что входит. Четвертый кадр: ограничение по времени или свободным окнам. Финал: кнопка/текст "Записаться".`,
        caption: `${offer}. Подойдет, если вы хотите ${goalCopy[brief.goal]}. Напишите нам слово "старт" и мы пришлем детали.`,
      },
    ],
    contentCalendar: [
      {
        day: "Понедельник",
        idea: "Экспертный ролик: частая ошибка клиента до записи",
        platform: "Reels",
      },
      {
        day: "Среда",
        idea: "UGC-история клиента с первым сомнением и результатом",
        platform: "Shorts",
      },
      {
        day: "Пятница",
        idea: "Оффер недели с четким CTA и свободными окнами",
        platform: "VK Clips",
      },
      {
        day: "Воскресенье",
        idea: "Закулисье: как готовится услуга и почему это безопасно",
        platform: "Reels",
      },
    ],
  };
}

export function createAssetsFromPlan(orderId: string, plan: CreativePlan): CreativeAsset[] {
  return plan.scripts.map((script, index) => ({
    id: `${orderId}-asset-${index + 1}`,
    orderId,
    title: script.title,
    angle: plan.angles[index % plan.angles.length],
    platform: platforms[index % platforms.length],
    caption: script.caption,
    status: index === 0 ? "uploaded" : "planned",
    thumbnailUrl: index === 0 ? "gradient-rose" : undefined,
  }));
}

export function createOrderFromBrief(brief: BriefInput): Order {
  const id = `rf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const plan = generateCreativePlan(brief);

  return {
    id,
    status: "strategy",
    brief,
    plan,
    assets: createAssetsFromPlan(id, plan),
    createdAt: new Date().toISOString(),
  };
}
