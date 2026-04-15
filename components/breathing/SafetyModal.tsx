"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";

const STORAGE_KEY = "whf-safety-acknowledged";

type Props = {
  onAcknowledge: () => void;
  onCancel: () => void;
};

export default function SafetyModal({ onAcknowledge, onCancel }: Props) {
  const [open, setOpen] = useState(false);
  const [dontShow, setDontShow] = useState(false);

  useEffect(() => {
    const acknowledged = localStorage.getItem(STORAGE_KEY);
    if (acknowledged === "true") {
      onAcknowledge();
    } else {
      setOpen(true);
    }
  }, [onAcknowledge]);

  const handleBegin = () => {
    if (dontShow) {
      localStorage.setItem(STORAGE_KEY, "true");
    }
    setOpen(false);
    onAcknowledge();
  };

  const handleCancel = () => {
    setOpen(false);
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleCancel(); }}>
      <DialogContent className="max-w-md border-red-900/30 bg-slate-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Before You Begin
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-lg border border-red-500/30 bg-red-950/30 p-3">
          <p className="text-sm font-semibold text-red-400">
            Important Safety Warning
          </p>
          <p className="mt-1 text-sm text-red-300/80">
            This technique can cause dizziness or temporary loss of consciousness.
          </p>
        </div>

        <ul className="space-y-2 text-sm text-white/80">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-red-400">✕</span>
            <span>
              <strong className="text-white">Never</strong> practice near water,
              while driving, or during any activity requiring motor control.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-amber-400">⚠</span>
            <span>
              Always be <strong className="text-white">seated or lying down</strong>{" "}
              before you begin.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-amber-400">⚠</span>
            <span>
              Dizziness, tingling, and light-headedness are normal — stay calm.
            </span>
          </li>
        </ul>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
            Do not practice if you have:
          </p>
          <div className="grid grid-cols-2 gap-1">
            {[
              "Epilepsy",
              "Heart conditions",
              "High blood pressure",
              "Pregnancy",
              "History of fainting",
              "Severe asthma",
            ].map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-xs text-white/60">
                <div className="h-1 w-1 rounded-full bg-white/30" />
                {item}
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-white/40">
            Consult a physician before starting if you have any medical conditions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="dont-show"
            type="checkbox"
            checked={dontShow}
            onChange={(e) => setDontShow(e.target.checked)}
            className="h-3.5 w-3.5 accent-cyan-500"
          />
          <label htmlFor="dont-show" className="text-xs text-white/40 cursor-pointer">
            Don&apos;t show this again
          </label>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 border-white/10 bg-transparent text-white/60 hover:bg-white/5 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleBegin}
            className="flex-1 bg-cyan-600 text-white hover:bg-cyan-500"
          >
            I Understand — Begin
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
