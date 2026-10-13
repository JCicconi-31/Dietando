"use client";

import React, { useState } from "react";
import {
  X,
  FileJson,
  Copy,
  Check,
  Upload,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
} from "lucide-react";
import { EXTRACTOR_AI_PROMPT } from "@/lib/ai-prompt";
import { PlanImportSchema, ValidatedPlan } from "@/lib/plan-schema";
import { Plan } from "@/types/diet";

interface ImportJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanImported: (plan: Plan) => void;
}

export function ImportJsonModal({
  isOpen,
  onClose,
  onPlanImported,
}: ImportJsonModalProps) {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validatedPlan, setValidatedPlan] = useState<ValidatedPlan | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(EXTRACTOR_AI_PROMPT);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = EXTRACTOR_AI_PROMPT;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setJsonText(content);
        validateJson(content);
      }
    };
    reader.readAsText(file);
  };

  const validateJson = (rawContent: string) => {
    setValidationErrors([]);
    setValidatedPlan(null);

    let parsed: any;
    try {
      // Pulisci eventuali backtick markdown (\`\`\`json ...) se l'utente ha copiato l'intero blocco
      let cleaned = rawContent.trim();
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "").trim();
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```/, "").replace(/```$/, "").trim();
      }
      parsed = JSON.parse(cleaned);
    } catch (err: any) {
      setValidationErrors([`Errore sintattico JSON: ${err.message}`]);
      return;
    }

    const result = PlanImportSchema.safeParse(parsed);
    if (!result.success) {
      const errors = result.error.issues.map(
        (issue) => `[${issue.path.join(" -> ")}]: ${issue.message}`
      );
      setValidationErrors(errors);
    } else {
      setValidatedPlan(result.data);
    }
  };

  const handleConfirmImport = () => {
    if (!validatedPlan) return;
    onPlanImported(validatedPlan as unknown as Plan);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-[#1a1a1e] rounded-3xl max-w-2xl w-full p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4 my-8 max-h-[90vh] flex flex-col">
        {/* Header Modale */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-850 shrink-0">
          <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-base">
            <FileJson size={20} className="text-[#F7931E]" />
            Importa Piano Alimentare (File JSON)
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Corpo con scroll */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1">
          {/* STEP 1: Genera il JSON con Gemini / Claude */}
          <div className="p-4 rounded-2xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/40 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#ea580c] dark:text-orange-400 flex items-center gap-1.5">
                <Sparkles size={14} /> 1. Genera il JSON dal tuo PDF con AI
              </span>
              <button
                onClick={handleCopyPrompt}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#F7931E] hover:bg-[#ea580c] text-white flex items-center gap-1.5 transition-colors shadow-sm"
              >
                {copiedPrompt ? <Check size={13} strokeWidth={3} /> : <Copy size={13} />}
                <span>{copiedPrompt ? "Copiato!" : "Copia Prompt"}</span>
              </button>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Carica il tuo PDF su <strong>Gemini</strong> o <strong>Claude</strong>, incolla il prompt
              copiato con il pulsante sopra e otterrai il codice JSON con tutti i pasti e le regole nel
              formato esatto per questa app.
            </p>
          </div>

          {/* STEP 2: Carica il file JSON o incolla il testo */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              2. Carica il file .json o incolla il contenuto
            </label>

            {/* Input File Drag & Drop */}
            <div className="border-2 border-dashed border-stone-200 dark:border-stone-800 hover:border-[#F7931E] rounded-2xl p-4 text-center cursor-pointer transition-colors">
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
                id="json-file-input"
              />
              <label
                htmlFor="json-file-input"
                className="cursor-pointer flex flex-col items-center gap-1.5"
              >
                <Upload size={22} className="text-[#F7931E]" />
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                  Seleziona file .json dal tuo dispositivo
                </span>
                <span className="text-[11px] text-stone-400">oppure incolla il testo nel box qui sotto</span>
              </label>
            </div>

            {/* Textarea per incollare direttamente */}
            <textarea
              rows={4}
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                if (e.target.value.trim()) {
                  validateJson(e.target.value);
                } else {
                  setValidatedPlan(null);
                  setValidationErrors([]);
                }
              }}
              placeholder='Incolla qui il codice JSON generato da Gemini o Claude {"title": "...", "days": [...]}'
              className="w-full p-3 text-xs font-mono rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#202025] text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-[#F7931E]"
            />
          </div>

          {/* Errori di validazione */}
          {validationErrors.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400">
                <AlertTriangle size={15} /> Errori di validazione nel file JSON:
              </div>
              <ul className="list-disc pl-5 text-[11px] text-rose-600 dark:text-rose-300 space-y-1 max-h-32 overflow-y-auto">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* STEP 3: Revisione Obbligatoria prima del salvataggio */}
          {validatedPlan && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 size={16} /> 3. Schermata di Revisione del Piano
              </div>

              <div className="space-y-1.5 text-xs text-stone-800 dark:text-stone-200">
                <div>
                  <strong>Titolo:</strong> {validatedPlan.title}
                </div>
                {validatedPlan.notes && (
                  <div>
                    <strong>Note:</strong> {validatedPlan.notes}
                  </div>
                )}
                <div className="flex items-center gap-3 pt-1 text-stone-600 dark:text-stone-400">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} /> {validatedPlan.days.length} giorni trovati
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers size={13} /> {validatedPlan.rules.length} regole rilevate
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleConfirmImport}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Check size={16} />
                  Conferma e Applica Piano all&apos;App
                </button>
              </div>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 text-center font-bold text-xs">
              Piano importato e applicato con successo!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
