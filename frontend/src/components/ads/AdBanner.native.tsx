import { useEffect, useState } from "react";
import { View } from "react-native";
import mobileAds, { AdsConsent, BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { useShowAds } from "./useShowAds";

/*
 * Google AdMob (app). ID do bloco de anúncio: EXPO_PUBLIC_ADMOB_BANNER_ANDROID
 * (variável do EAS). Sem ele — ou em desenvolvimento — usa o bloco de TESTE.
 */
const UNIT_ID = process.env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID;
const unitId = !__DEV__ && UNIT_ID ? UNIT_ID : TestIds.ADAPTIVE_BANNER;

let prepared: Promise<boolean> | null = null;

/** Consentimento (LGPD/GDPR, formulário do Google) e inicialização, uma única vez. */
function prepareAds() {
  prepared ??= (async () => {
    try {
      await AdsConsent.gatherConsent();
    } catch (error) {
      console.log("Consentimento de anúncios indisponível:", error);
    }
    try {
      const info = await AdsConsent.getConsentInfo();
      if (!info.canRequestAds) return false;
    } catch {
      // Sem informação de consentimento: segue (fora da UE não é exigido).
    }
    await mobileAds().initialize();
    return true;
  })().catch(() => false);
  return prepared;
}

export function AdBanner() {
  const show = useShowAds();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (show) prepareAds().then(setReady);
  }, [show]);

  if (!show || !ready || failed) return null;

  return (
    <View style={{ alignItems: "center", marginBottom: 8 }} accessibilityLabel="Anúncio">
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdFailedToLoad={(error) => {
          console.log("Anúncio não carregou:", error?.message);
          setFailed(true);
        }}
      />
    </View>
  );
}
