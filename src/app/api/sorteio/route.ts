/* eslint-disable @typescript-eslint/no-unsafe-return */
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

type Participant = {
  name: string;
  whatsapp: string;
};

type RequestBody = {
  title: string;
  participants: Participant[];
};

const MAX_REQUESTS_PER_HOUR = 100;
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

async function sendWithRetries(
  to: string,
  message: string,
  retries = 3,
): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await sendWhatsAppMessage(to, message);
      console.log(`Mensagem enviada para ${to}`);
      return;
    } catch (error) {
      console.error(`Erro no envio para ${to}, tentativa ${attempt}:`, error);
      if (attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 segundos entre tentativas
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
  const ip = headers().get('x-forwarded-for') || 'unknown';
  const now = Date.now();

  // Check rate limit
  const userRequests = requestCounts.get(ip) || { count: 0, lastReset: now };
  if (now - userRequests.lastReset > 3600000) {
    userRequests.count = 1;
    userRequests.lastReset = now;
  } else {
    userRequests.count++;
  }
  requestCounts.set(ip, userRequests);

  if (userRequests.count > MAX_REQUESTS_PER_HOUR) {
    return NextResponse.json(
      { error: 'Muitas requisições. Tente novamente mais tarde.' },
      { status: 429 },
    );
  }

  const body: RequestBody = await request.json();

  if (body.participants.length < 3) {
    return NextResponse.json(
      { error: 'É necessário pelo menos 3 participantes' },
      { status: 400 },
    );
  }

  const shuffled = shuffleArray([...body.participants]);
  const matches = shuffled.map((participant, index) => ({
    giver: participant,
    receiver: shuffled[(index + 1) % shuffled.length],
  }));

  // Enviar mensagens usando a Evolution API
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

    const randomDelay = getRandomDelay(1000, 5000);

    try {
      await sendWithRetries(match.giver.whatsapp, message);
      console.log(message);
      console.log(
        `Mensagem enviada para ${match.giver.name} (${match.giver.whatsapp})`,
      );
    } catch (error) {
      console.error(`Erro ao enviar mensagem para ${match.giver.name}:`, error);
    }
    await new Promise((resolve) => setTimeout(resolve, randomDelay)); // Esperar 1 segundo entre cada envio
  }

  // Enviar mensagem para o organizador com a lista de quem tirou quem e uma mensagem de sucesso
  await new Promise((resolve) => setTimeout(resolve, 10000)); // Esperar 10 segundos antes de enviar a mensagem para o organizador

  const organizerMatches = matches.map((match) => ({
    giver: match.giver.name,
    receiver: match.receiver.name,
  }));

  const messageTome = organizerSuccessMessage(body.title, organizerMatches);

  try {
    await sendWhatsAppMessage(MY_WHATSAPP_NUMBER, messageTome);
    console.log('Mensagem de sucesso enviada para o organizador');
  } catch (error) {
    console.error(
      'Erro ao enviar mensagem de sucesso para o organizador:',
      error,
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Sorteio realizado e mensagens enviadas com sucesso',
  });
}
