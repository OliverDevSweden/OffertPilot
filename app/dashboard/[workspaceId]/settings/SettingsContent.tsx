"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Database } from "@/types/supabase";

type Workspace = Database["public"]["Tables"]["workspaces"]["Row"];
type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

interface Props {
  workspace: Workspace;
  subscription: Subscription;
}

export default function SettingsContent({ workspace, subscription }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [companyName, setCompanyName] = useState(workspace.company_name);
  const [senderName, setSenderName] = useState(workspace.sender_name);
  const [senderEmail, setSenderEmail] = useState(workspace.sender_email);
  const [signatureText, setSignatureText] = useState(
    workspace.signature_text || ""
  );
  const [aiEnabled, setAiEnabled] = useState(workspace.ai_enabled);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/workspaces/${workspace.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName,
          sender_name: senderName,
          sender_email: senderEmail,
          signature_text: signatureText,
          ai_enabled: aiEnabled,
        }),
      });

      if (!response.ok) throw new Error("Failed to update");

      setMessage("Inställningar sparade!");
      router.refresh();
    } catch (error) {
      setMessage("Ett fel uppstod");
    } finally {
      setLoading(false);
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
            <h1 className="text-2xl font-bold text-gray-900">Inställningar</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Subscription Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Prenumeration</h2>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-700">
                Status:{" "}
                <span className="font-semibold">{subscription.status}</span>
              </p>
              {subscription.plan && (
                <p className="text-gray-700">
                  Plan:{" "}
                  <span className="font-semibold capitalize">
                    {subscription.plan}
                  </span>
                </p>
              )}
            </div>
            <Link
              href={`/dashboard/${workspace.id}/billing`}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Hantera prenumeration
            </Link>
          </div>
        </div>

        {/* Workspace Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Workspace-inställningar
          </h2>

          {message && (
            <div
              className={`mb-4 p-3 rounded ${
                message.includes("fel")
                  ? "bg-red-50 text-red-700"
                  : "bg-green-50 text-green-700"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Företagsnamn
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Avsändarnamn
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Avsändar e-post
              </label>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-postsignatur
              </label>
              <textarea
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="aiEnabled"
                checked={aiEnabled}
                onChange={(e) => setAiEnabled(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="aiEnabled"
                className="ml-2 block text-sm text-gray-700"
              >
                Aktivera AI-förbättrade emails (kräver Professional plan eller
                högre)
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                BCC-adress för inkommande leads
              </label>
              <code className="block bg-gray-100 px-4 py-2 rounded border border-gray-300 text-gray-900">
                {workspace.inbound_email_address}
              </code>
              <p className="text-sm text-gray-500 mt-1">
                Denna adress kan inte ändras
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Sparar..." : "Spara ändringar"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
