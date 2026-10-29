import { ComponentRef, useEffect, useRef } from "react";
import { View } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useShowAds } from "./useShowAds";

/*
 * Google AdSense (site). Variáveis do build na Vercel:
 *   EXPO_PUBLIC_ADSENSE_CLIENT  ex.: ca-pub-1234567890123456
 *   EXPO_PUBLIC_ADSENSE_SLOT    ID do bloco de anúncio (ex.: 1234567890)
 * Sem elas, nada aparece.
 */
const CLIENT = process.env.EXPO_PUBLIC_ADSENSE_CLIENT;
const SLOT = process.env.EXPO_PUBLIC_ADSENSE_SLOT;

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

function loadScript() {
  const id = "adsbygoogle-js";
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  s.async = true;
  s.crossOrigin = "anonymous";
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(CLIENT!)}`;
  document.head.appendChild(s);
}

export function AdBanner() {
  const show = useShowAds() && Boolean(CLIENT && SLOT);
  const { theme } = useTheme();
  const box = useRef<ComponentRef<typeof View>>(null);

  useEffect(() => {
    const host = box.current as unknown as HTMLElement | null;
    if (!show || !host) return;
    loadScript();
    const ins = document.createElement("ins");
    ins.className = "adsbygoogle";
    ins.style.display = "block";
    ins.style.width = "100%";
    ins.style.height = "60px";
    ins.setAttribute("data-ad-client", CLIENT!);
    ins.setAttribute("data-ad-slot", SLOT!);
    ins.setAttribute("data-ad-format", "horizontal");
    ins.setAttribute("data-full-width-responsive", "false");
    host.appendChild(ins);
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.log("AdSense:", error);
    }
    return () => {
      host.removeChild(ins);
    };
  }, [show]);

  if (!show) return null;
  return (
    <View
      ref={box}
      accessibilityLabel="Anúncio"
      style={{ width: "100%", maxWidth: 728, height: 60, alignSelf: "center", marginBottom: 8, backgroundColor: theme.surfaceMuted, borderRadius: 10, overflow: "hidden" }}
    />
  );
}
