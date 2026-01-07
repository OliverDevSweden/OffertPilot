import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">OffertPilot</h1>
          <p className="text-xl text-gray-700 mb-8">
            Automatisera dina offertuppföljningar och vinn fler kunder
          </p>
          <p className="text-lg text-gray-600 mb-12">
            Micro-SaaS för städfirmor som vill slippa manuella uppföljningar
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Kom igång gratis
            </Link>
            <Link
              href="/login"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition"
            >
              Logga in
            </Link>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">📧</div>
              <h3 className="text-xl font-semibold mb-2">
                Automatiska uppföljningar
              </h3>
              <p className="text-gray-600">
                Skicka automatiska påminnelser dag 2, 5 och 9 efter första
                kontakten
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2">
                AI-optimerade emails
              </h3>
              <p className="text-gray-600">
                OpenAI förbättrar dina meddelanden för högre svarfrekvens
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Enkel översikt</h3>
              <p className="text-gray-600">
                Se alla leads, statistik och vad som händer härnäst
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
