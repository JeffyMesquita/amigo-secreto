/* eslint-disable @typescript-eslint/no-unsafe-return */
import { NextResponse } from 'next/server';

type Participant = {
  name: string;
  whatsapp: string;
};

type RequestBody = {
  title: string;
  participants: Participant[];
};

// Limites de requisições
const MAX_REQUESTS_PER_HOUR = 6;
const SORT_MAX_REQUESTS = 100;
const requestCounts = new Map<string, { count: number; lastReset: number }>();

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL!;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY!;
const MY_WHATSAPP_NUMBER = process.env.MY_WHATSAPP_NUMBER!;

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getRandomDelay(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// Função para registrar requisições
function registerRequest(ip: string) {
  const now = Date.now();
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, { count: 1, lastReset: now });
    return true;
  }

  const data = requestCounts.get(ip)!;
  if (now - data.lastReset > 60 * 60 * 1000) {
    requestCounts.set(ip, { count: 1, lastReset: now });
    return true;
  }

  data.count += 1;
  return data.count <= MAX_REQUESTS_PER_HOUR;
}

async function sendWithRetries(to: string, message: string, retries = 3) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      console.log(`Enviando mensagem para ${to}: ${message}`);
      // Substitua pela função de envio real:
      // await sendWhatsAppMessage(to, message);
      console.log(`Mensagem enviada com sucesso para ${to}`);
      return;
    } catch (error) {
      console.error(`Erro no envio. Tentativa ${attempt + 1} de ${retries}`);
      attempt++;
      if (attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Espera 2 segundos antes de tentar novamente
    }
  }
}

async function sendWhatsAppMessage(to: string, message: string) {
  const delay = getRandomDelay(1000, 3000);

  const response = await fetch(
    `${EVOLUTION_API_URL}/message/sendText/amigosecreto`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: EVOLUTION_API_KEY,
      },
      body: JSON.stringify({
        number: `55${to}`,
        options: {
          delay,
          presence: 'composing',
          linkPreview: false,
        },

        text: message,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to send WhatsApp message: ${response.statusText}`);
  }

  return await response.json();
}

const organizerSuccessMessage = (
  title: string,
  participants: { giver: string; receiver: string }[],
) => {
  const participantCount = participants.length;
  const matchList = participants
    .map((p) => `${p.giver} 🎁 ${p.receiver}`)
    .join('\n');

  return `🎉🎊 Parabéns! Seu Amigo Secreto foi um sucesso! 🎊🎉

🌟 Título do evento: "${title}"

👥 Número de participantes: ${participantCount}

✨ Todas as mensagens foram enviadas com sucesso! Aqui está um resumo do sorteio:

🎁 Lista de quem tirou quem:
${matchList}

🤫 Lembre-se, isso é só para seus olhos! Mantenha o segredo! 🤐

🎭 Que a diversão comece! Mal posso esperar para ver as surpresas e sorrisos! 😄

🙏 Obrigado por usar nossa plataforma para organizar seu Amigo Secreto!
Esperamos que todos tenham uma experiência incrível! 🌈✨

Se precisar de algo mais, estamos aqui para ajudar! 💖
`;
};

export async function POST(request: Request) {
  const now = Date.now();

  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  if (!registerRequest(ip)) {
    return NextResponse.json({ error: 'Muitas requisições.' }, { status: 429 });
  }

  try {
    const body: RequestBody = await request.json();
    const { participants } = body;

    if (!participants || participants.length < 2) {
      return NextResponse.json(
        { error: 'Número insuficiente de participantes.' },
        { status: 400 },
      );
    }

    if (participants.length > SORT_MAX_REQUESTS) {
      return NextResponse.json(
        {
          error: `Número máximo de participantes excedido. Limite: ${SORT_MAX_REQUESTS}.`,
        },
        { status: 400 },
      );
    }

    const shuffled = shuffleArray([...body.participants]);
    const matches = shuffled.map((participant, index) => ({
      giver: participant,
      receiver: shuffled[(index + 1) % shuffled.length],
    }));

    for (const match of matches) {
      const message = `
🎉🎁 Olá ${match.giver.name}! 🎁🎉

Bem-vindo ao nosso incrível Amigo Secreto "${body.title}"! 🥳

Temos uma surpresa especial para você... 🤫
Prepare-se para descobrir quem é a pessoa sortuda que você vai presentear! 🎁

*🎭 Rufem os tambores... 🥁🥁🥁*

Você tirou: 🌟 ${match.receiver.name} 🌟

Agora é hora de usar sua criatividade para escolher um presente incrível! 🎨🛍️

Lembre-se:
- Mantenha o segredo! 🤐
- Escolha com carinho 💖
- Divirta-se muito! 😄

Boa sorte e feliz Amigo Secreto! 🍀

💻 Confira mais no nosso site e organize você também seu sorteio de Amigo Secreto:  
🔗 [Clique aqui para começar](https://amigosecreto.jeffymesquita.dev)  

👨‍💻 Feito com 💙 por *Jeferson Mesquita*.

🎉 Vamos lá, espalhe a diversão e compartilhe com seus amigos! 🌟
`;

      await sendWithRetries(match.giver.whatsapp, message);
      const delay = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000; // Delay aleatório entre 1-5s
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    const organizerMatches = matches.map((match) => ({
      giver: match.giver.name,
      receiver: match.receiver.name,
    }));

    const messageTome = organizerSuccessMessage(body.title, organizerMatches);
    await new Promise((resolve) => setTimeout(resolve, 10000)); // Esperar 10 segundos antes de enviar a mensagem para o organizador
    await sendWhatsAppMessage(MY_WHATSAPP_NUMBER, messageTome);
    console.log('Mensagem de sucesso enviada para o organizador', now);

    return NextResponse.json({
      success: true,
      message: 'Sorteio concluído com sucesso!',
    });
  } catch (error) {
    console.error('Erro durante o sorteio:', error, now);
    return NextResponse.json(
      { error: 'Erro ao processar o sorteio.' },
      { status: 500 },
    );
  }
}
