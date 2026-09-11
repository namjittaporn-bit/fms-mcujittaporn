"use client";

import { FileText, Clock, CheckCircle2, RotateCcw } from "lucide-react";
import { useT } from "@/shared/lib/i18n/client";
import { LiyonCard } from "@/shared/components/liyon";

interface EdocumentStatsBarProps {
  totalCount: number;
  pendingCount: number;
  approvedCount: number;
  changesCount: number;
}

export function EdocumentStatsBar({
  totalCount,
  pendingCount,
  approvedCount,
  changesCount,
}: EdocumentStatsBarProps) {
  const t = useT();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <LiyonCard className="p-4 space-y-1">
        <div className="flex items-center justify-between text-muted-foreground text-xs">
          <span>{t("edocument.stats.total")}</span>
          <FileText className="h-4 w-4 text-primary" />
        </div>
        <p className="text-2xl font-bold text-foreground">{totalCount}</p>
      </LiyonCard>

      <LiyonCard className="p-4 space-y-1">
        <div className="flex items-center justify-between text-muted-foreground text-xs">
          <span>{t("edocument.stats.pending")}</span>
          <Clock className="h-4 w-4 text-amber-500" />
        </div>
        <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
      </LiyonCard>

      <LiyonCard className="p-4 space-y-1">
        <div className="flex items-center justify-between text-muted-foreground text-xs">
          <span>{t("edocument.stats.approved")}</span>
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </div>
        <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
      </LiyonCard>

      <LiyonCard className="p-4 space-y-1">
        <div className="flex items-center justify-between text-muted-foreground text-xs">
          <span>{t("edocument.stats.changes")}</span>
          <RotateCcw className="h-4 w-4 text-orange-500" />
        </div>
        <p className="text-2xl font-bold text-foreground">{changesCount}</p>
      </LiyonCard>
    </div>
  );
}
