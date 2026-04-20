"use client";

import React from "react";
import dynamic from "next/dynamic";
import { PageHeader } from "../../../components/PageHeader";
import "swagger-ui-react/swagger-ui.css";

// Swagger UI doesn't support SSR easily
const SwaggerUI = dynamic(() => import("swagger-ui-react"), {
  ssr: false,
  loading: () => (
    <div className="p-12 text-center text-mistral-black/40 animate-pulse font-bold tracking-widest uppercase text-xs">
      Loading API Documentation...
    </div>
  ),
}) as any;

export default function ApiReferencePage() {
  const [spec, setSpec] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';
    fetch(`${baseUrl}/api/docs-json`)
      .then((res) => {
        if (!res.ok) throw new Error("API is not reachable");
        return res.json();
      })
      .then((data) => setSpec(data))
      .catch((err) => {
        console.error("Failed to fetch swagger spec:", err);
        setError(
          "Could not connect to the API. Make sure the backend server is running and accessible.",
        );
      });
  }, []);

  return (
    <div className="flex flex-col min-h-full bg-warm-ivory">
      <PageHeader
        title="API Reference"
        description="Interactive OpenAPI documentation. Test the SMS and OTP endpoints directly from this interface."
      />

      <div className="flex-1 px-4 md:px-8 pb-12">
        <div className="bg-white rounded-none border border-block-gold overflow-hidden shadow-sm min-h-[600px]">
          {error ? (
            <div className="p-20 text-center space-y-4">
              <div className="text-mistral-orange font-bold text-xl uppercase tracking-tighter italic">
                Offline
              </div>
              <p className="text-mistral-black/70 max-w-md mx-auto text-sm">
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-mistral-orange text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-mistral-flame transition-all active:scale-95"
              >
                Reconnect to API
              </button>
            </div>
          ) : (
            <div className="swagger-ui-custom-theme">
              <style jsx global>{`
                .swagger-ui .topbar {
                  display: none !important;
                }
                .swagger-ui .info {
                  padding: 40px 30px;
                }
                .swagger-ui .info .title {
                  color: #1f1f1f !important;
                  font-family: inherit;
                  font-weight: 900;
                  text-transform: uppercase;
                  letter-spacing: -0.05em;
                }
                .swagger-ui .scheme-container {
                  display: none !important;
                }
                .swagger-ui .opblock-tag {
                  font-family: inherit;
                  color: #1f1f1f;
                  border-bottom: 2px solid #ffe295;
                  padding: 10px 0;
                }
                .swagger-ui .btn.execute {
                  background-color: #fa520f !important;
                  border-color: #fa520f !important;
                  border-radius: 0;
                  color: white !important;
                  font-weight: bold;
                  text-transform: uppercase;
                }
                .swagger-ui .btn.authorize {
                  color: #fa520f !important;
                  border-color: #fa520f !important;
                  border-radius: 0;
                  font-weight: bold;
                }
                .swagger-ui .btn.authorize svg {
                  fill: #fa520f !important;
                }
                .swagger-ui .opblock {
                  border-radius: 0 !important;
                  box-shadow: none !important;
                  border: 1px solid #ffe295 !important;
                }
                .swagger-ui .opblock.opblock-post {
                  background: #fffaf0;
                }
                .swagger-ui .opblock.opblock-get {
                  background: #f0f7ff;
                  border-color: #b8daff !important;
                }
                .swagger-ui input,
                .swagger-ui select,
                .swagger-ui textarea {
                  border-radius: 0 !important;
                  border: 1px solid #ffe295 !important;
                  padding: 8px !important;
                }
                .swagger-ui .model-box-control:focus,
                .swagger-ui .models-control:focus,
                .swagger-ui .opblock-summary-control:focus {
                  outline: none !important;
                }
                .swagger-ui .model-container {
                  background: #fffdf7 !important;
                  border: 1px solid #ffe295 !important;
                }
              `}</style>
              {spec && <SwaggerUI spec={spec} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
