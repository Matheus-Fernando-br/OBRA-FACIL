import { ScrollView } from "react-native";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { globalStyles, COLORS } from "@/styles/globalStyles";
import { router } from "expo-router";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { SettingsItem } from "@/components/settings/SettingsItem";
import { AppSwitch } from "@/components/settings/AppSwitch";
import { SettingsSelect } from "@/components/settings/SettingsSelect";

import { DeleteAccountModal } from "@/components/modals/DeleteAccountModal";

export default function ConfiguracoesScreen() {
  const [deleteVisible, setDeleteVisible] = useState(false);

  const [tema, setTema] = useState("Sistema");
  const [animacoes, setAnimacoes] = useState(true);

  const [inicioAutomatico, setInicioAutomatico] = useState(true);
  const [lembrarFiltros, setLembrarFiltros] = useState(true);
  const [abrirUltimaTela, setAbrirUltimaTela] = useState(false);

  const [backupAutomatico, setBackupAutomatico] = useState(true);
  const [sincronizacao, setSincronizacao] =
    useState("Automática");

  return (
    <>
      <ScrollView
        style={globalStyles.container}
        showsVerticalScrollIndicator={false}
      >

        <PageHeader
        title="Configurações"
        subtitle="Ajuste as configurações do aplicativo"
      />


        <SettingsSection title="Aparência">

          <SettingsItem
            icon="moon"
            title="Tema"
            description="Modo de aparência"
            rightComponent={
              <SettingsSelect
                title="Tema"
                value={tema}
                options={[
                  "Sistema",
                  "Claro",
                  "Escuro",
                ]}
                onChange={setTema}
              />
            }
          />

          <SettingsItem
            icon="sparkles"
            title="Animações"
            description="Ativar animações"
            rightComponent={
              <AppSwitch
                value={animacoes}
                onValueChange={setAnimacoes}
              />
            }
          />

        </SettingsSection>

        <SettingsSection title="Aplicativo">

          <SettingsItem
            icon="rocket"
            title="Inicialização rápida"
            description="Abrir o app mais rápido"
            rightComponent={
              <AppSwitch
                value={inicioAutomatico}
                onValueChange={setInicioAutomatico}
              />
            }
          />

          <SettingsItem
            icon="filter"
            title="Salvar filtros"
            description="Memorizar filtros utilizados"
            rightComponent={
              <AppSwitch
                value={lembrarFiltros}
                onValueChange={setLembrarFiltros}
              />
            }
          />

          <SettingsItem
            icon="layers"
            title="Última tela"
            description="Abrir última tela acessada"
            rightComponent={
              <AppSwitch
                value={abrirUltimaTela}
                onValueChange={setAbrirUltimaTela}
              />
            }
          />

        </SettingsSection>

        <SettingsSection title="Sincronização">

          <SettingsItem
            icon="cloud-upload"
            title="Backup automático"
            description="Enviar dados automaticamente"
            rightComponent={
              <AppSwitch
                value={backupAutomatico}
                onValueChange={setBackupAutomatico}
              />
            }
          />

          <SettingsItem
            icon="sync"
            title="Modo"
            description="Forma de sincronização"
            rightComponent={
              <SettingsSelect
                title="Modo"
                value={sincronizacao}
                options={[
                  "Automática",
                  "Manual",
                  "Somente Wi-Fi",
                ]}
                onChange={setSincronizacao}
              />
            }
          />

        </SettingsSection>

        <SettingsSection title="Conta">

          <SettingsItem
            icon="shield-checkmark"
            title="Privacidade e Segurança"
            description="Senha e autenticação"
            onPress={() =>
              router.push("../seguranca")
            }
          />

          <SettingsItem
            icon="trash"
            title="Excluir Conta"
            description="Remover permanentemente"
            danger
            onPress={() =>
              setDeleteVisible(true)
            }
          />

        </SettingsSection>

      </ScrollView>

      <DeleteAccountModal
        visible={deleteVisible}
        onClose={() => setDeleteVisible(false)}
      />
    </>
  );
}