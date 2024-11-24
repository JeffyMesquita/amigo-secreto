/* eslint-disable @typescript-eslint/no-unsafe-member-access */
'use client';

import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ClipboardCheckIcon,
  Gift,
  GithubIcon,
  GlobeIcon,
  InstagramIcon,
  LinkedinIcon,
  Loader2,
  Minus,
  Moon,
  Plus,
  Save,
  ShareIcon,
  Sun,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaRegCopy, FaWhatsapp } from 'react-icons/fa';
import * as z from 'zod';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useCheckServerIsAlive } from '@/hooks';

import { Timer } from '../Timer';

const animatedGradient = `
  @keyframes gradientAnimation {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .animated-gradient {
    background: linear-gradient(90deg, #8B5CF6, #EC4899, #8B5CF6);
    background-size: 200% 200%;
    animation: gradientAnimation 3s ease infinite;
  }
`;

const participantSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(20),
  whatsapp: z
    .string()
    .regex(
      /^(\(\d{2}\)\s)?\d{4,5}-\d{4}$/,
      'Formato inválido. Use (XX) XXXX-XXXX ou (XX) XXXXX-XXXX',
    )
    .min(10, 'Número de telefone inválido'),
});

const formSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').max(50),
  participants: z
    .array(participantSchema)
    .min(3, 'É necessário pelo menos 3 participantes'),
});

type FormData = z.infer<typeof formSchema>;

const STORAGE_KEY = 'amigo-secreto-draft';
const STORAGE_THEME = 'amigo-secreto-theme';
const PIX_KEY = process.env.NEXT_PUBLIC_PIX_KEY!;

function formatParticipants(data: FormData): FormData {
  return {
    ...data,
    participants: data.participants.map((participant) => ({
      ...participant,
      whatsapp: participant.whatsapp.replace(/\D/g, ''), // Remove qualquer caractere não numérico
    })),
  };
}

type ParticipantToRemove = {
  id: number;
  name: string;
  whatsapp: string;
};

export function Form() {
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [participantToRemove, setParticipantToRemove] =
    useState<ParticipantToRemove | null>(null);
  const [showDraftSaved, setShowDraftSaved] = useState(false);

  useCheckServerIsAlive({
    started: isStarted,
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      participants: [
        { name: '', whatsapp: '' },
        { name: '', whatsapp: '' },
        { name: '', whatsapp: '' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'participants',
  });

  // Watch form changes for auto-save
  const formValues = watch();

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_KEY).then(() => {
      toast.custom(
        (t) => (
          <div
            key={t.id}
            className={`${
              isDarkMode
                ? 'bg-purple-900'
                : 'bg-gradient-to-r from-purple-500 to-pink-500'
            } rounded-md p-4 text-white shadow-lg`}
          >
            <div className="flex justify-between">
              <p className="font-semibold">Chave PIX copiada!</p>
              <ClipboardCheckIcon className="h-5 w-5" />
            </div>
            <p className="mt-2 text-sm">Cole no seu aplicativo preferido.</p>
          </div>
        ),
        {
          duration: 2000,
        },
      );
    });
  };

  const handleShareWhatsApp = () => {
    const baseURL = 'https://wa.me/?text=';
    const message = `🎉✨ Ei, você aí! 🙋‍♂️🙋‍♀️

    
🎁 Que tal fazer o sorteio do seu Amigo Secreto de um jeito SUPER divertido? 🥳

🚀 Use nossa plataforma incrível e descubra como é fácil e empolgante organizar seu Amigo Secreto!

✨ Recursos incríveis:
🔒 Sorteio 100% seguro e aleatório
📱 Notificações por WhatsApp
🌈 Interface colorida e intuitiva
🎨 Personalização total

🤫 Psiu... Tem até um modo secreto para quem adora mistério! 🕵️‍♂️

🔗 Clique no link e comece a diversão agora:
${window.location.href}

🎭 Vamos lá, surpreenda seus amigos e faça deste Amigo Secreto o melhor de todos! 🌟🎊`;

    // Usa encodeURIComponent apenas nos caracteres essenciais
    const encodedMessage = message.replace(/\n/g, '%0A');

    // Monta o link final
    const finalURL = `${baseURL}${encodedMessage}`;

    // Abre o WhatsApp com o link gerado
    window.open(finalURL, '_blank');
  };

  const handleShareGeneral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Amigo Secreto',
          text: 'Venha participar do nosso Amigo Secreto!',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      toast.error(
        'Seu navegador não suporta a funcionalidade de compartilhamento.',
      );
    }
  };

  const onSubmit = async (data: FormData) => {
    const formattedData = formatParticipants(data);

    toast.custom(
      (t) => (
        <div
          key={t.id}
          className={`${
            isDarkMode
              ? 'bg-purple-900'
              : 'bg-gradient-to-r from-purple-500 to-pink-500'
          } rounded-md p-4 text-white shadow-lg`}
        >
          <div className="flex items-center justify-between">
            <p className="font-semibold">Gerando Amigo Secreto...</p>
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
          <p className="mt-2 text-sm">Aguarde enquanto geramos o sorteio.</p>
        </div>
      ),
      {
        duration: 10000,
      },
    );

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const response = await fetch('/api/sorteio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      const result = await response.json();

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        throw new Error(result.error || 'Falha ao gerar o Amigo Secreto');
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Erro ao gerar o Amigo Secreto. Por favor, tente novamente.',
      );
    } finally {
      setIsSubmitting(false);
      toast.dismiss();
    }
  };

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const handleRemoveParticipant = (
    index: number,
    participantObjs: {
      name: string;
      whatsapp: string;
    } = { name: '', whatsapp: '' },
  ) => {
    if (participantObjs.name === '' && participantObjs.whatsapp === '') {
      remove(index);
      return;
    }

    setParticipantToRemove({
      id: index,
      name: participantObjs.name,
      whatsapp: participantObjs.whatsapp,
    });
  };

  const confirmRemoveParticipant = () => {
    if (participantToRemove !== null) {
      remove(participantToRemove.id);
      setParticipantToRemove(null);
    }
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = animatedGradient;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        reset(parsedDraft);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, [reset]);

  // Auto-save draft
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formValues));
      setShowDraftSaved(true);
      setTimeout(() => setShowDraftSaved(false), 5000);
    }, 20000);

    return () => clearTimeout(saveTimeout);
  }, [formValues]);

  // Dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_THEME, 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_THEME, 'false');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_THEME);
    if (savedTheme === 'true') {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false);
    }
  }, []);

  useEffect(() => {
    if (showSuccess) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [showSuccess]);

  return (
    <>
      <Timer setStartCheck={setIsStarted} startCheck={isStarted} />

      <TooltipProvider>
        <div className="flex min-h-screen flex-col">
          <header className="w-full rounded-b-lg bg-gradient-to-r from-purple-500 to-pink-500 p-4 shadow-lg">
            <div className="mx-auto flex max-w-4xl items-center justify-between">
              <div>
                <Button
                  aria-label="Compartilhar no WhatsApp"
                  className="mr-2"
                  title="Compartilhar no WhatsApp"
                  onClick={handleShareWhatsApp}
                >
                  <FaWhatsapp className="h-4 w-4" />
                  <span className="sr-only">Compartilhar no WhatsApp</span>
                </Button>
                <Button
                  aria-label="Compartilhar"
                  title="Compartilhar"
                  onClick={handleShareGeneral}
                >
                  <ShareIcon className="h-4 w-4" />
                  <span className="sr-only">Compartilhar</span>
                </Button>
              </div>
              <div className="text-white">
                <p>Ajude-nos com uma doação:</p>
                <div className="flex justify-end">
                  <Button variant="secondary" onClick={handleCopyPix}>
                    Chave PIX <FaRegCopy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-grow py-8">
            <Card className="mx-auto w-full max-w-2xl bg-gradient-to-br from-purple-100 to-pink-100 shadow-lg dark:from-purple-900 dark:to-pink-900">
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-end">
                  <Button
                    aria-label={
                      isDarkMode
                        ? 'Desativar modo escuro'
                        : 'Ativar modo escuro'
                    }
                    className="flex-shrink-0 rounded-full hover:bg-purple-100 hover:text-purple-500 dark:hover:bg-pink-100 dark:hover:text-pink-500"
                    size="icon"
                    title={
                      isDarkMode
                        ? 'Desativar modo escuro'
                        : 'Ativar modo escuro'
                    }
                    variant="ghost"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                  >
                    {isDarkMode ? (
                      <Sun className="h-5 w-5" />
                    ) : (
                      <Moon className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                <CardTitle className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-center text-2xl font-bold text-transparent sm:text-4xl">
                  Sorteador de Amigo Secreto
                </CardTitle>
                <p className="text-center font-semibold text-muted-foreground">
                  Crie seu sorteio de forma fácil e divertida!
                </p>
                <div className="text-center text-sm font-semibold text-muted-foreground">
                  Total de participantes: {fields.length}
                </div>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: -20 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.5,
                      type: 'spring',
                      stiffness: 100,
                    }}
                  >
                    <Label className="font-semibold" htmlFor="title">
                      Título do Amigo Secreto
                    </Label>
                    <div className="relative overflow-hidden rounded-md bg-purple-50">
                      <Gift className="absolute left-3 top-1/2 -translate-y-1/2 transform text-purple-500" />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Input
                            id="title"
                            {...register('title')}
                            className="border-purple-300 pl-10 font-semibold text-zinc-900 focus:border-pink-500 focus:ring-pink-500 dark:text-zinc-900"
                            maxLength={50}
                            placeholder="Ex: Amigo Secreto da Família"
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Digite um título para identificar seu sorteio</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.title.message}
                      </p>
                    )}
                  </motion.div>
                  <div className="space-y-4">
                    <Label className="font-semibold">
                      Participantes (mínimo 3)
                    </Label>
                    <AnimatePresence>
                      {fields.map((field, index) => (
                        <motion.div
                          key={field.id}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-4"
                          exit={{ opacity: 0, x: 50 }}
                          initial={{ opacity: 0, x: -50 }}
                          transition={{ duration: 0.5, delay: 0.5 }}
                        >
                          <div className="flex flex-col items-start gap-4 sm:flex-row">
                            <div className="w-full flex-1 overflow-hidden rounded-md">
                              <div className="relative bg-purple-50">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 transform text-purple-500" />
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Input
                                      {...register(
                                        `participants.${index}.name`,
                                      )}
                                      className="border-purple-300 pl-10 font-semibold text-zinc-900 focus:border-pink-500 focus:ring-pink-500 dark:text-zinc-900"
                                      maxLength={20}
                                      placeholder="Nome/Apelido"
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      Digite o nome ou apelido do participante
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              {errors.participants?.[index]?.name && (
                                <p className="mt-1 text-sm text-red-500">
                                  {errors.participants[index]?.name?.message}
                                </p>
                              )}
                            </div>
                            <div className="w-full flex-1 overflow-hidden rounded-md">
                              <div className="relative bg-purple-50">
                                <FaWhatsapp className="absolute left-3 top-1/2 size-6 -translate-y-1/2 transform text-purple-500" />
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Controller
                                      control={control}
                                      name={`participants.${index}.whatsapp`}
                                      render={({ field }) => (
                                        <Input
                                          {...field}
                                          className="border-purple-300 pl-10 font-semibold text-zinc-900 focus:border-pink-500 focus:ring-pink-500 dark:text-zinc-900"
                                          maxLength={15}
                                          placeholder="(XX) XXXXX-XXXX"
                                          onChange={(e) =>
                                            field.onChange(
                                              formatWhatsApp(e.target.value),
                                            )
                                          }
                                        />
                                      )}
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Digite o número do WhatsApp com DDD</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              {errors.participants?.[index]?.whatsapp && (
                                <p className="mt-1 text-sm text-red-500">
                                  {
                                    errors.participants[index]?.whatsapp
                                      ?.message
                                  }
                                </p>
                              )}
                            </div>
                            {formValues.participants.length > 3 && (
                              <Button
                                aria-label="Remover participante"
                                className="mt-2 self-center bg-red-100 text-red-500 hover:bg-red-200 sm:mt-0 sm:self-start"
                                size="icon"
                                title="Remover participante"
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  handleRemoveParticipant(index, field)
                                }
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          {index < fields.length - 1 && (
                            <div className="animated-gradient my-6 h-[2px]" />
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <Button
                      aria-label="Adicionar participante"
                      className="mt-2 bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
                      size="sm"
                      title="Adicionar participante"
                      type="button"
                      variant="outline"
                      onClick={() => append({ name: '', whatsapp: '' })}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Adicionar Participante
                    </Button>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      aria-label="Gerar Amigo Secreto"
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                      disabled={isSubmitting}
                      title="Gerar Amigo Secreto"
                      type="submit"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Gerando Amigo Secreto...
                        </>
                      ) : (
                        'Gerar Amigo Secreto'
                      )}
                    </Button>
                  </motion.div>
                </form>
                <AnimatePresence>
                  {showSuccess && (
                    <motion.div
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 rounded-md bg-green-200 p-4 text-center font-semibold text-green-700 dark:bg-green-700 dark:text-green-200"
                      exit={{ opacity: 0, y: -20 }}
                      initial={{ opacity: 0, y: 20 }}
                    >
                      Amigo Secreto gerado com sucesso! Os participantes foram
                      notificados.
                    </motion.div>
                  )}
                  {errorMessage && (
                    <motion.div
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 rounded-md bg-red-200 p-4 text-center font-semibold text-red-700 dark:bg-red-700 dark:text-red-200"
                      exit={{ opacity: 0, y: -20 }}
                      initial={{ opacity: 0, y: 20 }}
                    >
                      {errorMessage}
                    </motion.div>
                  )}
                  {showDraftSaved && (
                    <motion.div
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground"
                      exit={{ opacity: 0, y: -20 }}
                      initial={{ opacity: 0, y: 20 }}
                    >
                      <Save className="h-4 w-4" />
                      Rascunho salvo automaticamente
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </main>

          <footer className="mt-8 w-full rounded-t-lg bg-gradient-to-r from-purple-500 to-pink-500 p-4 shadow-lg">
            <div className="mx-auto flex max-w-4xl flex-col items-center space-y-2">
              <div className="flex items-center justify-center space-x-4">
                <Link
                  aria-label="GitHub"
                  href="https://github.com/JeffyMesquita"
                  rel="noopener noreferrer"
                  target="_blank"
                  title="GitHub"
                >
                  <GithubIcon className="h-6 w-6 text-white" />
                </Link>
                <Link
                  aria-label="LinkedIn"
                  href="https://www.linkedin.com/in/jeferson-mesquita-763bb6b8/"
                  rel="noopener noreferrer"
                  target="_blank"
                  title="LinkedIn"
                >
                  <LinkedinIcon className="h-6 w-6 text-white" />
                </Link>
                <Link
                  aria-label="Portfolio"
                  href="https://jeffymesquita.dev"
                  rel="noopener noreferrer"
                  target="_blank"
                  title="Portfolio"
                >
                  <GlobeIcon className="h-6 w-6 text-white" />
                </Link>
                <Link
                  aria-label="Instagram"
                  href="https://www.instagram.com/jeferson.mesquita"
                  rel="noopener noreferrer"
                  target="_blank"
                  title="Instagram"
                >
                  <InstagramIcon className="h-6 w-6 text-white" />
                </Link>
              </div>
              <div className="text-sm text-white">
                &copy; {new Date().getFullYear()} JeffyMesquita. Todos os
                direitos reservados.
              </div>
            </div>
          </footer>
        </div>

        <AlertDialog
          open={participantToRemove !== null}
          onOpenChange={() => setParticipantToRemove(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover Participante</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover o participante{' '}
                <strong className="font-semibold text-purple-600">
                  {participantToRemove?.name}
                </strong>{' '}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmRemoveParticipant}>
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TooltipProvider>
    </>
  );
}
