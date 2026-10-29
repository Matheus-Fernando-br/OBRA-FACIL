/*
 * Configuração dinâmica (estende o app.json).
 * IDs do AdMob vêm das variáveis do EAS (ambiente "preview"/"production"):
 *   ADMOB_ANDROID_APP_ID  ex.: ca-app-pub-1234567890123456~1234567890
 * Sem elas, usa o ID de TESTE do Google (anúncios de teste, sem receita).
 */
const TEST_ANDROID_APP_ID = "ca-app-pub-3940256099942544~3347511713";
const TEST_IOS_APP_ID = "ca-app-pub-3940256099942544~1458002511";

module.exports = ({ config }) => ({
  ...config,
  plugins: config.plugins.map((plugin) =>
    plugin === "react-native-google-mobile-ads"
      ? [
          "react-native-google-mobile-ads",
          {
            androidAppId: process.env.ADMOB_ANDROID_APP_ID || TEST_ANDROID_APP_ID,
            iosAppId: process.env.ADMOB_IOS_APP_ID || TEST_IOS_APP_ID,
            // Só inicia a coleta depois do consentimento (LGPD).
            delayAppMeasurementInit: true,
          },
        ]
      : plugin,
  ),
});
