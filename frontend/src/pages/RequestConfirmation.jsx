/**
 * Request Confirmation Page
 *
 * Shown after a successful Item Request submission.
 * Confirms the request was received and gives next steps.
 */

import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useState } from "react";

function RequestConfirmation() {
    const location = useLocation();
    const navigate = useNavigate();
    const requestId = location.state?.requestId;
    const [selectionOpen, setSelectionOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header onSelectionOpen={() => setSelectionOpen(true)} />

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">

                    {/* Success icon */}
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold text-wa-navy mb-2">
                        Request Submitted!
                    </h1>

                    {requestId && (
                        <p className="text-sm text-gray-400 mb-4">
                            Request #{requestId}
                        </p>
                    )}

                    <p className="text-gray-600 mb-8">
                        Your request has been received by the preparation team.
                        You will be notified when your items are ready for collection.
                    </p>

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate("/requests/mine")}
                            className="w-full bg-wa-blue hover:bg-wa-ocean text-white py-3 rounded-xl font-semibold transition-colors cursor-pointer"
                        >
                            View My Requests
                        </button>
                        <button
                            onClick={() => navigate("/")}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 py-3 rounded-xl font-medium transition-colors cursor-pointer"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RequestConfirmation;
