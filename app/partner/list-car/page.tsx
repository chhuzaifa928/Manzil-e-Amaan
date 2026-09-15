// app/partner/list-car/page.tsx
import React from "react";
import CascadingCarForm from "@/components/partner/CascadingCarForm";

export default function PartnerListCarPage() {
    // Valid standard UUIDv4 format for local development
    const testPartnerId = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex items-center justify-center">
            <div className="w-full max-w-2xl space-y-4">
                <div className="text-center space-y-1">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                        Manzil-e-Amaan Partner Hub
                    </span>
                    <h1 className="text-2xl font-black">Vehicle Registration</h1>
                </div>

                <CascadingCarForm partnerId={testPartnerId} partnerType="showroom_owner" />
            </div>
        </div>
    );
}