"use client";

import { useState, useTransition } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  exportProgressAction,
  importProgressAction,
  resetProgressAction,
} from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { THEME_STORAGE_KEY } from "@/lib/constants";
import type { ExportFile } from "@/types";

export function SettingsPanel() {
  const { theme, setTheme } = useTheme();
  const activeTheme = theme === "light" ? "light" : "dark";
  const [pending, startTransition] = useTransition();
  const [importFile, setImportFile] = useState<ExportFile | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  function download(data: ExportFile) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "camo-command-export.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function onExport() {
    startTransition(async () => {
      const result = await exportProgressAction();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      const themeValue: "dark" | "light" | undefined =
        stored === "light" || stored === "dark"
          ? stored
          : theme === "light" || theme === "dark"
            ? theme
            : undefined;
      const data: ExportFile = themeValue
        ? { ...result.data, theme: themeValue }
        : result.data;
      download(data);
      toast.success("Exported progress.");
    });
  }

  function onFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as ExportFile;
        setImportFile(parsed);
        setImportOpen(true);
      } catch {
        toast.error("That file is not JSON.");
      }
    };
    reader.readAsText(file);
  }

  function confirmImport() {
    if (!importFile) return;
    startTransition(async () => {
      const result = await importProgressAction(importFile);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      if (importFile.theme === "dark" || importFile.theme === "light") {
        setTheme(importFile.theme);
      }
      setImportOpen(false);
      setImportFile(null);
      toast.success("Imported progress and recomputed Gold.");
    });
  }

  function confirmReset() {
    startTransition(async () => {
      const result = await resetProgressAction(confirmation);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setResetOpen(false);
      setConfirmation("");
      toast.success("Progress reset. The catalogue is unchanged.");
    });
  }

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <section>
        <h2 className="font-heading text-2xl font-semibold">Theme</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Stored in this browser only, under {THEME_STORAGE_KEY}. Dark is the default.
        </p>
        <div className="mt-3 flex gap-2">
          <Button
            type="button"
            className="h-11"
            variant={activeTheme === "dark" ? "default" : "outline"}
            onClick={() => setTheme("dark")}
          >
            Dark
          </Button>
          <Button
            type="button"
            className="h-11"
            variant={activeTheme === "light" ? "default" : "outline"}
            onClick={() => setTheme("light")}
          >
            Light
          </Button>
        </div>
      </section>
      <Separator />
      <section>
        <h2 className="font-heading text-2xl font-semibold">Export</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Schema version 1. Challenge progress is keyed by weapon slug, camo category, camo name, and challenge order. Gold flags in the file are ignored on import. The catalogue is not included.
        </p>
        <Button type="button" className="mt-3 h-11" disabled={pending} onClick={onExport}>
          Download JSON
        </Button>
      </section>
      <Separator />
      <section>
        <h2 className="font-heading text-2xl font-semibold">Import</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Replaces challenge progress and the roadmap, then runs the same recompute the checkboxes use. Imported percentages and Gold flags are ignored.
        </p>
        <Input
          type="file"
          accept="application/json,.json"
          className="mt-3 h-11"
          aria-label="Import JSON file"
          onChange={(event) => onFile(event.target.files?.[0])}
        />
      </section>
      <Separator />
      <section>
        <h2 className="font-heading text-2xl font-semibold">Reset progress</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Deletes challenge progress, weapon progress, and roadmap order for the local user. Weapons, camos, and challenges stay.
        </p>
        <Button
          type="button"
          variant="destructive"
          className="mt-3 h-11"
          onClick={() => setResetOpen(true)}
        >
          Reset progress
        </Button>
      </section>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Overwrite local progress?</DialogTitle>
            <DialogDescription>
              This replaces challenge checkboxes and the roadmap, then recomputes Gold from the challenges in the file.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setImportOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={pending} onClick={confirmImport}>
              Import and overwrite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset the local grind?</DialogTitle>
            <DialogDescription>
              Type RESET to delete progress and the roadmap. The SMG catalogue stays.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            aria-label="Type RESET to confirm"
            placeholder="RESET"
            className="h-11"
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={pending || confirmation !== "RESET"}
              onClick={confirmReset}
            >
              Reset progress
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
