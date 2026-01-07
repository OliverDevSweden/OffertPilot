"use client";

import Link from "next/link";
import { Database } from "@/types/supabase";
import { LeadWithSequence } from "@/types";
import { formatDateTime } from "@/lib/utils/date";

type Workspace = Database["public"]["Tables"]["workspaces"]["Row"];

interface Props {
  workspace: Workspace;
  leads: LeadWithSequence[];
}

export default function LeadsContent({ workspace, leads }: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "SENT":
        return "bg-blue-100 text-blue-800";
      case "REPLIED":
        return "bg-green-100 text-green-800";
      case "WON":
        return "bg-emerald-100 text-emerald-800";
      case "LOST":
        return "bg-red-100 text-red-800";
      case "MANUAL_PAUSE":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/dashboard/${workspace.id}`}
              className="text-blue-600 hover:text-blue-700"
            >
              ← Tillbaka till Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Alla Leads</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {leads.length} leads totalt
            </h2>
            <div className="flex gap-2">
              <select className="border border-gray-300 rounded px-3 py-1 text-sm">
                <option value="">Alla status</option>
                <option value="SENT">Skickat</option>
                <option value="REPLIED">Svarat</option>
                <option value="WON">Vunnen</option>
                <option value="LOST">Förlorad</option>
                <option value="MANUAL_PAUSE">Pausad</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Kund
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tjänst
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Skapad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nästa steg
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Inga leads ännu
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {lead.customer_name || "Okänd"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {lead.customer_email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {lead.service_type || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            lead.status
                          )}`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDateTime(lead.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {(lead.sequence_state as any)?.is_paused
                          ? "Pausad"
                          : (lead.sequence_state as any)?.is_completed
                          ? "Klar"
                          : (lead.sequence_state as any)?.next_send_at
                          ? formatDateTime(
                              (lead.sequence_state as any).next_send_at
                            )
                          : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
