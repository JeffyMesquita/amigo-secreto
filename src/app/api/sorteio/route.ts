import { NextResponse } from "next/server";
import { headers } from "next/headers";

type Participant = {
  name: string;
  whatsapp: string;
};

type RequestBody = {
  title: string;
  participants: Participant[];
};

const MAX_REQUESTS_PER_HOUR = 6;
const requestCounts = new Map<string, { count: number; lastReset: number }>();

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL!;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY!;

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function sendWhatsAppMessage(to: string, message: string) {
  const response = await fetch(
    `${EVOLUTION_API_URL}/message/sendText/amigosecreto`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: EVOLUTION_API_KEY,
      },
      body: JSON.stringify({
        number: `55${to}`,
        options: {
          delay: 1200,
          presence: "composing",
          linkPreview: false,
        },

        text: message,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to send WhatsApp message: ${response.statusText}`);
  }

  return await response.json();
}

export async function POST(request: Request) {
  const ip = headers().get("x-forwarded-for") || "unknown";
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
      { error: "Muitas requisições. Tente novamente mais tarde." },
      { status: 429 }
    );
  }

  const body: RequestBody = await request.json();

  if (body.participants.length < 3) {
    return NextResponse.json(
      { error: "É necessário pelo menos 3 participantes" },
      { status: 400 }
    );
  }

  const shuffled = shuffleArray([...body.participants]);
  const matches = shuffled.map((participant, index) => ({
    giver: participant,
    receiver: shuffled[(index + 1) % shuffled.length],
  }));

  // Enviar mensagens usando a Evolution API
  for (const match of matches) {
    const message = `🎉🎁 Olá ${match.giver.name}! 🎁🎉

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

Boa sorte e feliz Amigo Secreto! 🍀🎊`;
    try {
      await sendWhatsAppMessage(match.giver.whatsapp, message);
      console.log(message);
      console.log(
        `Mensagem enviada para ${match.giver.name} (${match.giver.whatsapp})`
      );
    } catch (error) {
      console.error(`Erro ao enviar mensagem para ${match.giver.name}:`, error);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Esperar 1 segundo entre cada envio
  }

  return NextResponse.json({
    success: true,
    message: "Sorteio realizado e mensagens enviadas com sucesso",
  });
}
