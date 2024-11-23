import { useEffect } from "react";

type TimerProps = {
  startCheck: boolean;
  setStartCheck: (value: boolean) => void;
};

export function Timer({ startCheck, setStartCheck }: TimerProps) {
  useEffect(() => {
    if (!startCheck) {
      const timer = setInterval(() => {
        setStartCheck(true); // Atualiza o estado para `true` após 3 minutos
        clearInterval(timer); // Limpa o `setInterval` depois que a ação foi executada
      }, 3 * 60 * 1000); // 3 minutos em milissegundos

      return () => clearInterval(timer); // Cleanup no desmontar ou atualização
    }
  }, [startCheck, setStartCheck]);

  return null; // Sem renderização visual
}
