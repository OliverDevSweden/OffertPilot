"use client";

import { useState } from "react";
import Link from "next/link";
import { Database } from "@/types/supabase";
import { STRIPE_PLANS } from "@/lib/stripe";

type Workspace = Database["public"]["Tables"]["workspaces"]["Row"];
type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

interface Props {
  workspace: Workspace;
  subscription: Subscription;
}

export default function BillingContent({ workspace, subscription }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: string) => {
    setLoading(plan);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.id,
          plan,
        }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoading("portal");
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.id,
        }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Error creating portal session:", error);
      setLoading(null);
    }
  };

  const isActive = subscription.status === "active";

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
            <h1 className="text-2xl font-bold text-gray-900">Fakturering</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Current Subscription */}
        {isActive && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Din prenumeration</h2>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-700">
                  Plan:{" "}
                  <span className="font-semibold capitalize">
                    {subscription.plan}
                  </span>
                </p>
                <p className="text-gray-700">
                  Status:{" "}
                  <span className="font-semibold">{subscription.status}</span>
                </p>
                {subscription.current_period_end && (
                  <p className="text-sm text-gray-500 mt-1">
                    Förnyas:{" "}
                    {new Date(
                      subscription.current_period_end
                    ).toLocaleDateString("sv-SE")}
                  </p>
                )}
              </div>
              <button
                onClick={handleManageSubscription}
                disabled={loading === "portal"}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
              >
                {loading === "portal" ? "Laddar..." : "Hantera prenumeration"}
              </button>
            </div>
          </div>
        )}

        {/* Plans */}
        <h2 className="text-2xl font-bold text-center mb-8">
          {isActive ? "Uppgradera din plan" : "Välj en plan"}
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {Object.entries(STRIPE_PLANS).map(([key, plan]) => (
            <div
              key={key}
              className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                subscription.plan === key ? "ring-2 ring-blue-600" : ""
              }`}
            >
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 ml-2">SEK/mån</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {subscription.plan === key ? (
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-600 py-2 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Nuvarande plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(key)}
                    disabled={loading === key}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {loading === key ? "Laddar..." : "Välj plan"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {!isActive && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">
              ⚠️ Begränsningar utan aktiv prenumeration
            </h3>
            <ul className="text-yellow-800 space-y-1">
              <li>• Max 10 leads per månad</li>
              <li>• Inga automatiska utskick</li>
              <li>• Begränsad tillgång till funktioner</li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
