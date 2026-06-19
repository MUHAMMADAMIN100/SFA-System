import { ImgHTMLAttributes, useState } from "react";

import styles from "./FadeImg.module.scss";

// Картинка с плавным появлением после загрузки (fade-in).
export function FadeImg({
  className,
  onLoad,
  ...rest
}: ImgHTMLAttributes<HTMLImageElement>) {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      {...rest}
      className={`${styles.img} ${loaded ? styles.loaded : ""} ${className ?? ""}`}
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
    />
  );
}
