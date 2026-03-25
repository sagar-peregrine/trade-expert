"use client";
import { useState, useEffect, useCallback } from "react";
import { useDashboardStore } from "@/store/dashboard";
import { createApiClient } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Send, MessageCircle, CheckCircle2, XCircle,
  Eye, EyeOff, Loader2, RefreshCw, ToggleLeft, ToggleRight,
  Info, ExternalLink,
} from "lucide-react";

interface NotifConfig {
  telegram: { bot_token: string; chat_id: string; enabled: boolean; configured: boolean };
  whatsapp: { account_sid: string; auth_token: string; from_number: string; to_number: string; enabled: boolean; configured: boolean };
}

function StatusBadge({ configured, enabled }: { configured: boolean; enabled: boolean }) {
  if (!configured) return (
    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-border-subtle border border-border-default text-text-muted">
      NOT CONFIGURED
    </span>
  );
  if (!enabled) return (
    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
      DISABLED
    </span>
  );
  return (
    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
      ACTIVE
    </span>
  );
}

export function NotificationsPanel() {
  const { config } = useDashboardStore();
  const api = createApiClient(config.ngrokUrl);

  const [notifCfg, setNotifCfg] = useState<NotifConfig | null>(null);
  const [loading, setLoading] = useState(false);

  // Telegram form
  const [tgToken, setTgToken] = useState("");
  const [tgChatId, setTgChatId] = useState("");
  const [tgEnabled, setTgEnabled] = useState(true);
  const [showTgToken, setShowTgToken] = useState(false);
  const [tgSaving, setTgSaving] = useState(false);
  const [tgTesting, setTgTesting] = useState(false);

  // WhatsApp form
  const [waSid, setWaSid] = useState("");
  const [waToken, setWaToken] = useState("");
  const [waFrom, setWaFrom] = useState("+14155238886");
  const [waTo, setWaTo] = useState("");
  const [waEnabled, setWaEnabled] = useState(true);
  const [showWaToken, setShowWaToken] = useState(false);
  const [waSaving, setWaSaving] = useState(false);
  const [waTesting, setWaTesting] = useState(false);

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getNotificationConfig();
      setNotifCfg(data);
      // Pre-fill chat_id (not secret)
      setTgChatId(data.telegram.chat_id || "");
      setTgEnabled(data.telegram.enabled);
      setWaFrom(data.whatsapp.from_number || "+14155238886");
      setWaTo(data.whatsapp.to_number || "");
      setWaEnabled(data.whatsapp.enabled);
    } catch {
      toast.error("Could not load notification config — check backend connection");
    } finally {
      setLoading(false);
    }
  }, [config.ngrokUrl]);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  // ── Telegram ──────────────────────────────────────────────────────

  const saveTelegram = async () => {
    if (!tgToken || !tgChatId) return toast.error("Bot token and chat ID are required");
    setTgSaving(true);
    try {
      await api.setTelegramConfig(tgToken, tgChatId, tgEnabled);
      toast.success("✅ Telegram credentials saved");
      setTgToken(""); // clear token field after save (security)
      await loadConfig();
    } catch (e: unknown) {
      toast.error(`Failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setTgSaving(false);
    }
  };

  const testTelegram = async () => {
    setTgTesting(true);
    try {
      await api.testTelegram();
      toast.success("✅ Test message sent to Telegram!");
    } catch (e: unknown) {
      toast.error(`Telegram test failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setTgTesting(false);
    }
  };

  const toggleTelegram = async (enabled: boolean) => {
    try {
      await api.toggleTelegram(enabled);
      setTgEnabled(enabled);
      setNotifCfg((prev) => prev ? { ...prev, telegram: { ...prev.telegram, enabled } } : prev);
      toast.success(enabled ? "Telegram enabled" : "Telegram disabled");
    } catch {
      toast.error("Failed to toggle Telegram");
    }
  };

  // ── WhatsApp ──────────────────────────────────────────────────────

  const saveWhatsApp = async () => {
    if (!waSid || !waToken || !waFrom || !waTo)
      return toast.error("All Twilio fields are required");
    setWaSaving(true);
    try {
      await api.setWhatsAppConfig(waSid, waToken, waFrom, waTo, waEnabled);
      toast.success("✅ WhatsApp credentials saved");
      setWaSid(""); setWaToken("");
      await loadConfig();
    } catch (e: unknown) {
      toast.error(`Failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setWaSaving(false);
    }
  };

  const testWhatsApp = async () => {
    setWaTesting(true);
    try {
      await api.testWhatsApp();
      toast.success("✅ Test message sent via WhatsApp!");
    } catch (e: unknown) {
      toast.error(`WhatsApp test failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setWaTesting(false);
    }
  };

  const toggleWhatsApp = async (enabled: boolean) => {
    try {
      await api.toggleWhatsApp(enabled);
      setWaEnabled(enabled);
      setNotifCfg((prev) => prev ? { ...prev, whatsapp: { ...prev.whatsapp, enabled } } : prev);
      toast.success(enabled ? "WhatsApp enabled" : "WhatsApp disabled");
    } catch {
      toast.error("Failed to toggle WhatsApp");
    }
  };

  // ── Render ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 gap-3 text-text-muted">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading notification config…</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">

      {/* ── TELEGRAM ─────────────────────────────────────────────── */}
      <section className="bg-bg-card border border-border-default rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#229ED9]/10 border border-[#229ED9]/30 flex items-center justify-center">
              <Send className="w-4 h-4 text-[#229ED9]" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm text-text-primary">Telegram</h3>
              <p className="text-[11px] text-text-muted">via Telegram Bot API</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {notifCfg && (
              <StatusBadge configured={notifCfg.telegram.configured} enabled={notifCfg.telegram.enabled} />
            )}
            {notifCfg?.telegram.configured && (
              <button onClick={() => toggleTelegram(!tgEnabled)} className="text-text-muted hover:text-text-primary transition-colors">
                {tgEnabled
                  ? <ToggleRight className="w-5 h-5 text-accent-cyan" />
                  : <ToggleLeft className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* How to get bot token */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-[#229ED9]/5 border border-[#229ED9]/15 text-xs text-text-muted">
            <Info className="w-3.5 h-3.5 text-[#229ED9] shrink-0 mt-0.5" />
            <span>
              Create a bot via{" "}
              <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-[#229ED9] hover:underline inline-flex items-center gap-0.5">
                @BotFather <ExternalLink className="w-2.5 h-2.5" />
              </a>{" "}
              → copy the token. For chat ID, message your bot then visit
              {" "}<code className="bg-bg-elevated px-1 rounded">api.telegram.org/bot&lt;TOKEN&gt;/getUpdates</code>
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* Bot Token */}
            <div className="space-y-1.5">
              <label className="text-xs text-text-muted font-mono">Bot Token</label>
              <div className="relative">
                <input
                  type={showTgToken ? "text" : "password"}
                  value={tgToken}
                  onChange={(e) => setTgToken(e.target.value)}
                  placeholder={notifCfg?.telegram.configured ? notifCfg.telegram.bot_token + " (enter new to update)" : "123456789:ABCdef..."}
                  className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2 pr-10 text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none focus:border-[#229ED9]/50 transition-colors"
                />
                <button
                  onClick={() => setShowTgToken(!showTgToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showTgToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Chat ID */}
            <div className="space-y-1.5">
              <label className="text-xs text-text-muted font-mono">Chat ID</label>
              <input
                type="text"
                value={tgChatId}
                onChange={(e) => setTgChatId(e.target.value)}
                placeholder="-100123456789 or 123456789"
                className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2 text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none focus:border-[#229ED9]/50 transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={saveTelegram}
              disabled={tgSaving}
              className="flex-1 py-2.5 rounded-lg bg-[#229ED9]/10 border border-[#229ED9]/30 text-[#229ED9] hover:bg-[#229ED9]/20 transition-all text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {tgSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Save Credentials
            </button>
            <button
              onClick={testTelegram}
              disabled={tgTesting || !notifCfg?.telegram.configured}
              className="px-4 py-2.5 rounded-lg bg-bg-elevated border border-border-default text-text-secondary hover:text-text-primary hover:border-border-bright transition-all text-sm disabled:opacity-40 flex items-center gap-2"
            >
              {tgTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Test
            </button>
          </div>
        </div>
      </section>

      {/* ── WHATSAPP ─────────────────────────────────────────────── */}
      <section className="bg-bg-card border border-border-default rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm text-text-primary">WhatsApp</h3>
              <p className="text-[11px] text-text-muted">via Twilio WhatsApp API</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {notifCfg && (
              <StatusBadge configured={notifCfg.whatsapp.configured} enabled={notifCfg.whatsapp.enabled} />
            )}
            {notifCfg?.whatsapp.configured && (
              <button onClick={() => toggleWhatsApp(!waEnabled)} className="text-text-muted hover:text-text-primary transition-colors">
                {waEnabled
                  ? <ToggleRight className="w-5 h-5 text-accent-cyan" />
                  : <ToggleLeft className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* How to setup Twilio */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-[#25D366]/5 border border-[#25D366]/15 text-xs text-text-muted">
            <Info className="w-3.5 h-3.5 text-[#25D366] shrink-0 mt-0.5" />
            <span>
              Sign up at{" "}
              <a href="https://www.twilio.com" target="_blank" rel="noopener noreferrer" className="text-[#25D366] hover:underline inline-flex items-center gap-0.5">
                twilio.com <ExternalLink className="w-2.5 h-2.5" />
              </a>
              . Get Account SID + Auth Token from the console.
              For sandbox testing, send <code className="bg-bg-elevated px-1 rounded">join &lt;word&gt;</code> to <strong>+1 415 523 8886</strong> on WhatsApp first.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Account SID */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-xs text-text-muted font-mono">Account SID</label>
              <input
                type="text"
                value={waSid}
                onChange={(e) => setWaSid(e.target.value)}
                placeholder={notifCfg?.whatsapp.configured ? notifCfg.whatsapp.account_sid : "ACxxxxxxxxxxxxxxxx"}
                className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2 text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none focus:border-[#25D366]/50 transition-colors"
              />
            </div>

            {/* Auth Token */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-xs text-text-muted font-mono">Auth Token</label>
              <div className="relative">
                <input
                  type={showWaToken ? "text" : "password"}
                  value={waToken}
                  onChange={(e) => setWaToken(e.target.value)}
                  placeholder={notifCfg?.whatsapp.configured ? notifCfg.whatsapp.auth_token : "your_auth_token"}
                  className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2 pr-10 text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none focus:border-[#25D366]/50 transition-colors"
                />
                <button
                  onClick={() => setShowWaToken(!showWaToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showWaToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* From number */}
            <div className="space-y-1.5">
              <label className="text-xs text-text-muted font-mono">From Number</label>
              <input
                type="text"
                value={waFrom}
                onChange={(e) => setWaFrom(e.target.value)}
                placeholder="+14155238886"
                className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2 text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none focus:border-[#25D366]/50 transition-colors"
              />
              <p className="text-[10px] text-text-muted">Twilio sandbox: +14155238886</p>
            </div>

            {/* To number */}
            <div className="space-y-1.5">
              <label className="text-xs text-text-muted font-mono">Your WhatsApp Number</label>
              <input
                type="text"
                value={waTo}
                onChange={(e) => setWaTo(e.target.value)}
                placeholder="+919876543210"
                className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2 text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none focus:border-[#25D366]/50 transition-colors"
              />
              <p className="text-[10px] text-text-muted">Include country code, e.g. +91…</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={saveWhatsApp}
              disabled={waSaving}
              className="flex-1 py-2.5 rounded-lg bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/20 transition-all text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {waSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
              Save Credentials
            </button>
            <button
              onClick={testWhatsApp}
              disabled={waTesting || !notifCfg?.whatsapp.configured}
              className="px-4 py-2.5 rounded-lg bg-bg-elevated border border-border-default text-text-secondary hover:text-text-primary hover:border-border-bright transition-all text-sm disabled:opacity-40 flex items-center gap-2"
            >
              {waTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Test
            </button>
          </div>
        </div>
      </section>

      {/* Per-rule toggle reminder */}
      <p className="text-xs text-text-muted px-1">
        💡 After saving credentials, enable Telegram/WhatsApp notifications per-alert rule in the
        {" "}<strong className="text-text-secondary">Alerts → Rules</strong> tab using the notification toggles on each rule.
      </p>
    </div>
  );
}
