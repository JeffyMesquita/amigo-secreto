"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { zodResolver } from "@hookform/resolvers/zod";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
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
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { FaRegCopy, FaWhatsapp } from "react-icons/fa";
import * as z from "zod";

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
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(20),
  whatsapp: z
    .string()
    .regex(
      /^(\(\d{2}\)\s)?\d{4,5}-\d{4}$/,
      "Formato inválido. Use (XX) XXXX-XXXX ou (XX) XXXXX-XXXX"
    )
    .min(10, "Número de telefone inválido"),
});

const formSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres").max(50),
  participants: z
    .array(participantSchema)
    .min(3, "É necessário pelo menos 3 participantes"),
});

type FormData = z.infer<typeof formSchema>;

const STORAGE_KEY = "amigo-secreto-draft";
const STORAGE_THEME = "amigo-secreto-theme";
const PIX_KEY = process.env.NEXT_PUBLIC_PIX_KEY!;

function formatParticipants(data: FormData): FormData {
  return {
    ...data,
    participants: data.participants.map((participant) => ({
      ...participant,
      whatsapp: participant.whatsapp.replace(/\D/g, ""), // Remove qualquer caractere não numérico
    })),
  };
}

export function Form() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [participantToRemove, setParticipantToRemove] = useState<number | null>(
    null
  );
  const [showDraftSaved, setShowDraftSaved] = useState(false);

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
      title: "",
      participants: [
        { name: "", whatsapp: "" },
        { name: "", whatsapp: "" },
        { name: "", whatsapp: "" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "participants",
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
                ? "bg-purple-900"
                : "bg-gradient-to-r from-purple-500 to-pink-500"
            } text-white p-4 rounded-md shadow-lg`}
          >
            <div className="flex justify-between">
              <p className="font-semibold">Chave PIX copiada!</p>
              <ClipboardCheckIcon className="h-5 w-5" />
            </div>
            <p className="text-sm mt-2">Cole no seu aplicativo preferido.</p>
          </div>
        ),
        {
          duration: 2000,
        }
      );
    });
  };

  const handleShareWhatsApp = () => {
    const baseURL = "https://wa.me/?text=";
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
    const encodedMessage = message.replace(/\n/g, "%0A");

    // Monta o link final
    const finalURL = `${baseURL}${encodedMessage}`;

    // Abre o WhatsApp com o link gerado
    window.open(finalURL, "_blank");
  };

  const handleShareGeneral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Amigo Secreto",
          text: "Venha participar do nosso Amigo Secreto!",
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      toast.error(
        "Seu navegador não suporta a funcionalidade de compartilhamento."
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
              ? "bg-purple-900"
              : "bg-gradient-to-r from-purple-500 to-pink-500"
          } text-white p-4 rounded-md shadow-lg`}
        >
          <div className="flex items-center justify-between">
            <p className="font-semibold">Gerando Amigo Secreto...</p>
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
          <p className="text-sm mt-2">Aguarde enquanto geramos o sorteio.</p>
        </div>
      ),
      {
        duration: 10000,
      }
    );

    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/sorteio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      const result = await response.json();

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        throw new Error(result.error || "Falha ao gerar o Amigo Secreto");
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Erro ao gerar o Amigo Secreto. Por favor, tente novamente."
      );
    } finally {
      setIsSubmitting(false);
      toast.dismiss();
    }
  };

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  const handleRemoveParticipant = (index: number) => {
    setParticipantToRemove(index);
  };

  const confirmRemoveParticipant = () => {
    if (participantToRemove !== null) {
      remove(participantToRemove);
      setParticipantToRemove(null);
    }
  };

  useEffect(() => {
    const style = document.createElement("style");
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
        console.error("Error loading draft:", error);
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
      document.documentElement.classList.add("dark");
      localStorage.setItem(STORAGE_THEME, "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem(STORAGE_THEME, "false");
    }
  }, [isDarkMode]);

  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_THEME);
    if (savedTheme === "true") {
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
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: "'Metropolis', sans-serif",
          },
        }}
      />
      <TooltipProvider>
        <div className="min-h-screen flex flex-col">
          <header className="w-full bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-b-lg shadow-lg">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
              <div>
                <Button
                  title="Compartilhar no WhatsApp"
                  aria-label="Compartilhar no WhatsApp"
                  onClick={handleShareWhatsApp}
                  className="mr-2"
                >
                  <FaWhatsapp className="h-4 w-4" />
                  <span className="sr-only">Compartilhar no WhatsApp</span>
                </Button>
                <Button
                  title="Compartilhar"
                  aria-label="Compartilhar"
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
            <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 shadow-lg">
              <CardHeader className="space-y-1">
                <div className="flex justify-end items-center">
                  <Button
                    title={
                      isDarkMode
                        ? "Desativar modo escuro"
                        : "Ativar modo escuro"
                    }
                    aria-label={
                      isDarkMode
                        ? "Desativar modo escuro"
                        : "Ativar modo escuro"
                    }
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="rounded-full flex-shrink-0 hover:bg-purple-100 hover:text-purple-500 dark:hover:bg-pink-100 dark:hover:text-pink-500"
                  >
                    {isDarkMode ? (
                      <Sun className="h-5 w-5" />
                    ) : (
                      <Moon className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                <CardTitle className="text-2xl sm:text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
                  Sorteador de Amigo Secreto
                </CardTitle>
                <p className="text-center text-muted-foreground font-semibold">
                  Crie seu sorteio de forma fácil e divertida!
                </p>
                <div className="text-sm text-center text-muted-foreground font-semibold">
                  Total de participantes: {fields.length}
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.5,
                      type: "spring",
                      stiffness: 100,
                    }}
                  >
                    <Label htmlFor="title" className="font-semibold">
                      Título do Amigo Secreto
                    </Label>
                    <div className="relative bg-purple-50  rounded-md overflow-hidden">
                      <Gift className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Input
                            id="title"
                            {...register("title")}
                            className="pl-10 border-purple-300 focus:border-pink-500 focus:ring-pink-500 text-zinc-900 dark:text-zinc-900 font-semibold"
                            placeholder="Ex: Amigo Secreto da Família"
                            maxLength={50}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Digite um título para identificar seu sorteio</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">
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
                          initial={{ opacity: 0, x: -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 50 }}
                          transition={{ duration: 0.5, delay: 0.5 }}
                          className="space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row gap-4 items-start">
                            <div className="flex-1 w-full  rounded-md overflow-hidden">
                              <div className="relative bg-purple-50">
                                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" />
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Input
                                      {...register(
                                        `participants.${index}.name`
                                      )}
                                      className="pl-10 border-purple-300 focus:border-pink-500 focus:ring-pink-500 text-zinc-900 dark:text-zinc-900 font-semibold"
                                      placeholder="Nome/Apelido"
                                      maxLength={20}
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
                                <p className="text-red-500 text-sm mt-1">
                                  {errors.participants[index]?.name?.message}
                                </p>
                              )}
                            </div>
                            <div className="flex-1 w-full  rounded-md overflow-hidden">
                              <div className="relative bg-purple-50">
                                <FaWhatsapp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 size-6" />
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Controller
                                      name={`participants.${index}.whatsapp`}
                                      control={control}
                                      render={({ field }) => (
                                        <Input
                                          {...field}
                                          className="pl-10 border-purple-300 focus:border-pink-500 focus:ring-pink-500 text-zinc-900 dark:text-zinc-900 font-semibold"
                                          maxLength={15}
                                          placeholder="(XX) XXXXX-XXXX"
                                          onChange={(e) =>
                                            field.onChange(
                                              formatWhatsApp(e.target.value)
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
                                <p className="text-red-500 text-sm mt-1">
                                  {
                                    errors.participants[index]?.whatsapp
                                      ?.message
                                  }
                                </p>
                              )}
                            </div>
                            {index > 2 && (
                              <Button
                                title="Remover participante"
                                aria-label="Remover participante"
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => handleRemoveParticipant(index)}
                                className="bg-red-100 hover:bg-red-200 text-red-500 self-center sm:self-start mt-2 sm:mt-0"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          {index < fields.length - 1 && (
                            <div className="my-6 h-[2px] animated-gradient" />
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <Button
                      title="Adicionar participante"
                      aria-label="Adicionar participante"
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ name: "", whatsapp: "" })}
                      className="mt-2 bg-green-100 hover:bg-green-200 text-green-600 dark:bg-green-900 dark:hover:bg-green-800 dark:text-green-200"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Adicionar Participante
                    </Button>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      title="Gerar Amigo Secreto"
                      aria-label="Gerar Amigo Secreto"
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Gerando Amigo Secreto...
                        </>
                      ) : (
                        "Gerar Amigo Secreto"
                      )}
                    </Button>
                  </motion.div>
                </form>
                <AnimatePresence>
                  {showSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="mt-4 p-4 bg-green-200 text-green-700 rounded-md text-center font-semibold dark:bg-green-700 dark:text-green-200"
                    >
                      Amigo Secreto gerado com sucesso! Os participantes foram
                      notificados.
                    </motion.div>
                  )}
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="mt-4 p-4 bg-red-200 text-red-700 rounded-md text-center font-semibold dark:bg-red-700 dark:text-red-200"
                    >
                      {errorMessage}
                    </motion.div>
                  )}
                  {showDraftSaved && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground"
                    >
                      <Save className="h-4 w-4" />
                      Rascunho salvo automaticamente
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </main>

          <footer className="w-full bg-gradient-to-r from-purple-500 to-pink-500 p-4 mt-8 rounded-t-lg shadow-lg">
            <div className="max-w-4xl mx-auto flex flex-col items-center space-y-2">
              <div className="flex justify-center items-center space-x-4">
                <Link
                  href="https://github.com/JeffyMesquita"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="GitHub"
                  aria-label="GitHub"
                >
                  <GithubIcon className="h-6 w-6 text-white" />
                </Link>
                <Link
                  href="https://www.linkedin.com/in/jeferson-mesquita-763bb6b8/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="LinkedIn"
                  aria-label="LinkedIn"
                >
                  <LinkedinIcon className="h-6 w-6 text-white" />
                </Link>
                <Link
                  href="https://jeffymesquita.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Portfolio"
                  aria-label="Portfolio"
                >
                  <GlobeIcon className="h-6 w-6 text-white" />
                </Link>
                <Link
                  href="https://www.instagram.com/jeferson.mesquita"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Instagram"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="h-6 w-6 text-white" />
                </Link>
              </div>
              <div className="text-white text-sm">
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
                Tem certeza que deseja remover este participante? Esta ação não
                pode ser desfeita.
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
