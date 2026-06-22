import { AlertTriangle } from "lucide-react";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

import { Button } from "../Button/Button";
import { Modal } from "../Modal/Modal";
import styles from "./Confirm.module.scss";

export interface ConfirmOptions {
  title?: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Деструктивное действие — красная кнопка подтверждения + значок. */
  danger?: boolean;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [open, setOpen] = useState(false);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  // Закрываем окно и резолвим промис. options не сбрасываем — чтобы контент
  // не «мигал» во время анимации закрытия (AnimatePresence в Modal).
  const settle = useCallback((result: boolean) => {
    setOpen(false);
    resolver.current?.(result);
    resolver.current = null;
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Modal
        open={open}
        onClose={() => settle(false)}
        title={options?.title ?? "Подтвердите действие"}
        footer={
          <>
            <Button variant="secondary" onClick={() => settle(false)}>
              {options?.cancelLabel ?? "Отмена"}
            </Button>
            <Button
              variant={options?.danger ? "danger" : "primary"}
              onClick={() => settle(true)}
            >
              {options?.confirmLabel ?? "Подтвердить"}
            </Button>
          </>
        }
      >
        <div className={styles.content}>
          {options?.danger && (
            <span className={styles.iconDanger} aria-hidden>
              <AlertTriangle size={20} />
            </span>
          )}
          <p className={styles.message}>{options?.message}</p>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConfirm(): ConfirmContextValue {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm должен использоваться внутри ConfirmProvider");
  return ctx;
}
