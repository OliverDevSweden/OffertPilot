"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DashboardStats } from "@/types";
import { Database } from "@/types/supabase";
import { format } from "date-fns";
import { sv } from "date-fns/locale";

type Workspace = Database["public"]["Tables"]["workspaces"]["Row"];

interface Props {
  workspace: Workspace;
  stats: DashboardStats;
}

export default function DashboardContent({ workspace, stats }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating lead:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {workspace.company_name}
              </h1>
              <p className="text-sm text-gray-500">OffertPilot Dashboard</p>
            </div>
            <div className="flex gap-4 items-center">
              <Link
                href={`/dashboard/${workspace.id}/settings`}
                className="text-gray-600 hover:text-gray-900"
              >
                Inställningar
              </Link>
              <Link
                href={`/dashboard/${workspace.id}/leads`}
                className="text-gray-600 hover:text-gray-900"
              >
                Alla leads
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                Logga ut
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">Leads denna månad</div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.leads_this_month}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">Emails skickade</div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.emails_sent}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">Svarfrekvens</div>
            <div className="text-3xl font-bold text-gray-900">
              {Math.round(stats.reply_rate * 100)}%
            </div>
          </div>
        </div>

        {/* Inbound Email Info */}
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-8">
          <h3 className="font-semibold text-blue-900 mb-2">
            📧 Din BCC-adress
          </h3>
          <p className="text-blue-800 mb-2">
            Skicka en BCC till denna adress när du skickar offerter:
          </p>
          <code className="bg-white px-3 py-2 rounded border border-blue-300 text-blue-900 inline-block">
            {workspace.inbound_email_address}
          </code>
          <p className="text-sm text-blue-700 mt-2">
            Vi kommer automatiskt följa upp med kunden efter 2, 5 och 9 dagar
          </p>
        </div>

        {/* Active Leads */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Aktiva offerter
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kund
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tjänst
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nästa utskick
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Åtgärder
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.active_leads.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Inga aktiva leads än. Skicka ett mail med BCC till din
                      inbound-adress för att komma igång!
                    </td>
                  </tr>
                ) : (
                  stats.active_leads.map((lead) => (
                    <tr key={lead.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {lead.customer_name || "Okänd"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {lead.customer_email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.service_type || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.sequence_state?.next_send_at
                          ? format(
                              new Date(lead.sequence_state.next_send_at),
                              "PPp",
                              { locale: sv }
                            )
                          : "Klar"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <select
                          onChange={(e) =>
                            updateLeadStatus(lead.id, e.target.value)
                          }
                          defaultValue=""
                          className="border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="" disabled>
                            Markera som...
                          </option>
                          <option value="WON">Vunnen</option>
                          <option value="LOST">Förlorad</option>
                          <option value="MANUAL_PAUSE">Pausa</option>
                        </select>
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
