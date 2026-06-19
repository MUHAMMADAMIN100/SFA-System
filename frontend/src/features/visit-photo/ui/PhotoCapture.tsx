import imageCompression from "browser-image-compression";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Loader2 } from "lucide-react";
import { ChangeEvent, useState } from "react";

import { dur, ease } from "@/shared/config/motion";

import styles from "./PhotoCapture.module.scss";

interface PhotoCaptureProps {
  onChange: (file: File | null) => void;
  error?: string;
}

export function PhotoCapture({ onChange, error }: PhotoCaptureProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    try {
      // Сжатие строго на клиенте до 1–2 МБ перед отправкой.
      // useWebWorker: false — не тянем библиотеку с CDN в воркер; работает
      // офлайн / при слабой связи «в полях».
      const compressed = await imageCompression(file, {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: false,
      });
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(compressed));
      onChange(compressed);
    } catch {
      onChange(null);
    } finally {
      setProcessing(false);
      // Сброс value, чтобы повторный выбор того же файла срабатывал.
      e.target.value = "";
    }
  }

  return (
    <div className={styles.wrapper}>
      <motion.label
        className={`${styles.button} ${error ? styles.invalid : ""}`}
        whileTap={{ scale: 0.99 }}
      >
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className={styles.input}
          onChange={handleFile}
        />
        {processing ? (
          <Loader2 size={18} className={styles.spin} aria-hidden />
        ) : (
          <Camera size={18} aria-hidden />
        )}
        {processing
          ? "Обработка фото…"
          : preview
            ? "Переснять фото накладной"
            : "Сделать фото накладной"}
      </motion.label>

      <AnimatePresence>
        {preview && (
          <motion.div
            className={styles.previewBox}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: dur.base, ease }}
          >
            <img src={preview} alt="Превью накладной" className={styles.preview} />
          </motion.div>
        )}
      </AnimatePresence>

      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
