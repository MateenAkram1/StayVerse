import { useEffect, useState } from "react";
import { format } from "date-fns";
import { api } from "@/api/client";
import type { TransactionRow } from "@/types";

type Sum = { totalCredit: number; totalDebit: number; net: number };

export function CashflowPage() {
  const [rows, setRows] = useState<TransactionRow[]>([]);
  const [sum, setSum] = useState<Sum | null>(null);

  useEffect(() => {
    const run = async () => {
      const { data } = await api.get("/cashflow");
      setRows(data.transactions);
      setSum(data.summary);
    };
    void run();
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl text-paper">Cashflow statement</h1>
      <p className="text-sm text-ink-200">Academic “debt + credit” view: every demo payment records a guest debit and a host credit. Refunds post opposite entries.</p>
      {sum && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="panel p-3 text-sm">
            <p className="text-ink-200/80">Total credits</p>
            <p className="text-lg text-ember">{sum.totalCredit.toFixed(2)}</p>
          </div>
          <div className="panel p-3 text-sm">
            <p className="text-ink-200/80">Total debits</p>
            <p className="text-lg text-ink-100">{sum.totalDebit.toFixed(2)}</p>
          </div>
          <div className="panel p-3 text-sm">
            <p className="text-ink-200/80">Net (credits − debits)</p>
            <p className="text-lg text-paper">{sum.net.toFixed(2)}</p>
          </div>
        </div>
      )}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[500px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-ink-200/80">
              <th className="p-2">Date</th>
              <th className="p-2">Type</th>
              <th className="p-2">Label</th>
              <th className="p-2 text-right">$</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id} className="border-b border-white/5">
                <td className="p-2 text-ink-200/90">{format(new Date(r.createdAt), "MMM d, yyyy HH:mm")}</td>
                <td className="p-2 text-ink-100/90">{r.kind}</td>
                <td className="p-2">{r.label}</td>
                <td className="p-2 text-right font-mono">{r.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="mt-4 text-ink-200">No entries yet. Run a demo payment on a booking to populate this ledger.</p>}
      </div>
    </div>
  );
}
