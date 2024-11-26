import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

type Participant = {
  name: string;
  email: string;
};

type RequestBody = {
  title: string;
  participants: Participant[];
};

function getRandomDelay(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

const MAX_REQUESTS_PER_HOUR = 100;
const requestCounts = new Map<string, { count: number; lastReset: number }>();

const RESEND_API_KEY = process.env.RESEND_API_KEY!;

const resend: Resend = new Resend(RESEND_API_KEY);

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function sendEmail(to: string, subject: string, message: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: `Amigo Secreto <no-reply@jeffymesquita.dev>`,
      to: to,
      subject: subject,
      html: message,
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}

function generateParticipantMessage(
  participant: string,
  title: string,
  receiver: string,
) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seu Amigo Secreto</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #4a0e4e; text-align: center;">🎉🎁 Olá ${participant}! 🎁🎉</h1>

    <p style="font-size: 18px; text-align: center;">Bem-vindo ao nosso incrível Amigo Secreto "${title}"! 🥳</p>

    <p style="font-size: 16px;">Temos uma surpresa especial para você... 🤫<br>
    Prepare-se para descobrir quem é a pessoa sortuda que você vai presentear! 🎁</p>

    <div style="background-color: #f0f0f0; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
        <p style="font-size: 18px; font-weight: bold; margin: 0;">🎭 Rufem os tambores... 🥁🥁🥁</p>
        <h2 style="color: #4a0e4e; font-size: 24px; margin: 10px 0;">Você tirou: 🌟 ${receiver} 🌟</h2>
    </div>

    <p style="font-size: 16px;">Agora é hora de usar sua criatividade para escolher um presente incrível! 🎨🛍️</p>

    <h3 style="color: #4a0e4e;">Lembre-se:</h3>
    <ul style="list-style-type: none; padding-left: 0;">
        <li>- Mantenha o segredo! 🤐</li>
        <li>- Escolha com carinho 💖</li>
        <li>- Divirta-se muito! 😄</li>
    </ul>

    <p style="font-size: 18px; text-align: center; font-weight: bold;">Boa sorte e feliz Amigo Secreto! 🍀</p>

    <div style="background-color: #4a0e4e; color: white; padding: 20px; border-radius: 10px; margin-top: 20px;">
        <p style="margin: 0;">💻 Confira mais no nosso site e organize você também seu sorteio de Amigo Secreto:</p>
        <p style="text-align: center; margin: 10px 0;">
            <a href="https://amigosecreto.jeffymesquita.dev" style="color: white; text-decoration: none; background-color: #ff69b4; padding: 10px 20px; border-radius: 5px; display: inline-block;">Clique aqui para começar</a>
        </p>
    </div>

    <p style="font-size: 14px; text-align: center; margin-top: 20px;">
        👨‍💻 Feito com 💙 por <strong>Jeferson Mesquita</strong>.
    </p>

     <div style="margin-top: 30px; border-top: 1px solid #4a0e4e; padding-top: 20px;">
        <h4 style="color: #4a0e4e; text-align: center;">Contato do Organizador</h4>
        <ul style="list-style-type: none; padding-left: 0; text-align: center;">
            <li style="margin-bottom: 10px;">
                <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/brands/whatsapp.svg" alt="WhatsApp" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 5px;">
                <a href="https://wa.me/5517991305254" style="color: #4a0e4e; text-decoration: none;">+55 17 99130 5254</a>
            </li>
            <li style="margin-bottom: 10px;">
                <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/regular/envelope.svg" alt="Email" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 5px;">
                <a href="mailto:je_2742@hotmail.com" style="color: #4a0e4e; text-decoration: none;">je_2742@hotmail.com</a>
            </li>
            <li style="margin-bottom: 10px;">
                <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/brands/linkedin.svg" alt="LinkedIn" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 5px;">
                <a href="https://www.linkedin.com/in/jeferson-mesquita-763bb6b8/" style="color: #4a0e4e; text-decoration: none;">LinkedIn</a>
            </li>
            <li style="margin-bottom: 10px;">
                <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/brands/github.svg" alt="GitHub" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 5px;">
                <a href="https://github.com/JeffyMesquita" style="color: #4a0e4e; text-decoration: none;">GitHub</a>
            </li>
            <li>
                <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/brands/instagram.svg" alt="Instagram" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 5px;">
                <a href="https://www.instagram.com/jeferson.mesquita/" style="color: #4a0e4e; text-decoration: none;">Instagram</a>
            </li>
        </ul>
    </div>

    <p style="font-size: 16px; text-align: center; font-style: italic;">
        🎉 Vamos lá, espalhe a diversão e compartilhe com seus amigos! 🌟
    </p>
</body>
</html>`;
}

function organizerSuccessMessage(
  title: string,
  participants: { giver: string; receiver: string }[],
) {
  const participantCount = participants.length;
  const matchList = participants
    .map((p) => `${p.giver} 🎁 ${p.receiver}`)
    .join('\n');

  return `
    <!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resumo do Amigo Secreto</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #4a0e4e; text-align: center;">🎉🎊 Parabéns! Seu Amigo Secreto foi um sucesso! 🎊🎉</h1>

    <div style="background-color: #f0f0f0; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <h2 style="color: #4a0e4e; margin-top: 0;">🌟 Título do evento: "${title}"</h2>
        <p style="font-size: 18px;">👥 Número de participantes: ${participantCount}</p>
    </div>

    <p style="font-size: 16px;">✨ Todas as mensagens foram enviadas com sucesso! Aqui está um resumo do sorteio:</p>

    <div style="background-color: #4a0e4e; color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <h3 style="margin-top: 0;">🎁 Lista de quem tirou quem:</h3>
        <pre style="white-space: pre-wrap; word-wrap: break-word; font-family: monospace;">${matchList}</pre>
    </div>

    <p style="font-size: 18px; font-weight: bold; text-align: center;">🤫 Lembre-se, isso é só para seus olhos! Mantenha o segredo! 🤐</p>

    <p style="font-size: 16px;">🎭 Que a diversão comece! Mal posso esperar para ver as surpresas e sorrisos! 😄</p>

    <div style="background-color: #f0f0f0; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
        <p style="font-size: 18px; margin: 0;">🙏 Obrigado por usar nossa plataforma para organizar seu Amigo Secreto!</p>
        <p style="font-size: 16px;">Esperamos que todos tenham uma experiência incrível! 🌈✨</p>
    </div>

    <p style="font-size: 16px; text-align: center; font-style: italic;">
        Se precisar de algo mais, estamos aqui para ajudar! 💖
    </p>
</body>
</html>
    `;
}

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

  try {
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

    for (const match of matches) {
      const message = generateParticipantMessage(
        match.giver.name,
        body.title,
        match.receiver.name,
      );
      await sendEmail(
        match.giver.email,
        `Amigo Secreto - ${body.title}`,
        message,
      );

      await new Promise((resolve) =>
        setTimeout(resolve, getRandomDelay(500, 1750)),
      );
    }

    const organizerMatches = matches.map((match) => ({
      giver: match.giver.name,
      receiver: match.receiver.name,
    }));

    const messageTome = organizerSuccessMessage(body.title, organizerMatches);

    await sendEmail(
      'je_2742@hotmail.com',
      `Resumo do Amigo Secreto - ${body.title}`,
      messageTome,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in Secret Santa API:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro ao processar sua solicitação.' },
      { status: 500 },
    );
  }
}
