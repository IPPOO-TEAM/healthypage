import { ImgHTMLAttributes, useState } from 'react';

/**
 * <img> performant : lazy loading + décodage asynchrone par défaut, fade-in
 * doux une fois l'image chargée. Drop-in pour remplacer `<img>` quand on n'a
 * pas besoin du fallback "image cassée" d'ImageWithFallback.
 *
 * Pour les images critiques au-dessus de la ligne de flottaison, passez
 * `priority` qui désactive le lazy loading.
 */
export type LazyImgProps = ImgHTMLAttributes<HTMLImageElement> & {
  priority?: boolean;
  /** Aspect ratio CSS (ex: "16/9", "1/1") pour réserver la place avant chargement. */
  aspect?: string;
};

export function LazyImg({ priority, aspect, className = '', style, onLoad, ...rest }: LazyImgProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      {...rest}
      onLoad={(e) => { setLoaded(true); onLoad?.(e); }}
      className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      style={{ aspectRatio: aspect, ...style }}
    />
  );
}

export default LazyImg;
