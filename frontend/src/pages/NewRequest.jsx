/**
 * New Request Page
 *
 * Allows users to review their Selection and submit
 * a formal Item Request with reason, department,
 * date needed, and optional notes.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Header from "../components/Header";
import { useSelection } from "../context/SelectionContext";

function NewRequest() {
    const { items, totalCost, clearSelection } = useSelection();
    const navigate = useNavigate();
    console.log('NewRequest rendered', items);

    const [reasons, setReasons] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [reason, setReason] = useState("");
    const [department, setDepartment] = useState("");
    const [dateNeeded, setDateNeeded] = useState("");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [selectionOpen, setSelectionOpen] = useState(false);

    useEffect(() => {
        fetchReasons();
        fetchDepartments();
    }, []);

    const fetchReasons = () => {
        api.get("/api/reasons/")
            .then((res) => setReasons(res.data))
            .catch((err) => console.error("Failed to load reasons:", err));
    };

    const fetchDepartments = () => {
        api.get("/api/requests/departments/")
            .then((res) => setDepartments(res.data))
            .catch((err) => console.error("Failed to load departments:", err));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!reason || !department || !dateNeeded) {
            alert("Please fill in all required fields.");
            return;
        }

        setSubmitting(true);

        try {
            // Step 1: Create the ItemRequest
            const requestRes = await api.post("/api/requests/", {
                reason_id: parseInt(reason),
                department_id: parseInt(department),
                date_needed: dateNeeded,
                notes: notes,
            });

            const requestId = requestRes.data.id;

            // Step 2: Add each item to the request
            for (const item of items) {
                await api.post(`/api/requests/${requestId}/items/add/`, {
                    item_type: item.item_type,
                    item_id: item.item_id,
                    quantity_requested: item.quantity,
                    unit_price: item.unit_price,
                    notes: item.notes || "",
                });
            }

            // Step 3: Submit the request (draft → pending)
            await api.patch(`/api/requests/${requestId}/submit/`);

            // Step 4: Clear selection and redirect
            clearSelection();
            navigate("/requests/confirmation", {
                state: { requestId },
            });
        } catch (err) {
            console.error("Failed to submit request:", err);
            alert(
                err.response?.data?.error ||
                    "Failed to submit request. Please try again.",
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Minimum date = today
    const today = new Date().toISOString().split("T")[0];


    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header onSelectionOpen={() => setSelectionOpen(true)} />

            <div className="flex-1 p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Back button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-6 text-wa-blue hover:text-wa-ocean flex items-center gap-2 cursor-pointer font-medium transition-colors"
                    >
                        ← Back
                    </button>

                    <h1 className="text-3xl font-bold text-wa-navy mb-8">
                        Submit Request
                    </h1>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* LEFT — Items Summary */}
                        <div className="bg-white rounded-2xl shadow p-6">
                            <h2 className="text-lg font-bold text-wa-navy mb-4">
                                Your Selection
                            </h2>
                            <ul className="space-y-3">
                                {items.map((item) => (
                                    <li
                                        key={`${item.item_type}-${item.item_id}`}
                                        className="flex justify-between items-start gap-4 py-3 border-b border-gray-100 last:border-0"
                                    >
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-wa-navy">
                                                {item.name}
                                            </p>
                                            <p className="text-xs text-gray-400 capitalize mt-0.5">
                                                {item.item_type}
                                            </p>
                                            {item.notes && (
                                                <p className="text-xs text-gray-400 italic mt-1">
                                                    📝 {item.notes}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-semibold text-wa-navy">
                                                x{item.quantity}
                                            </p>
                                            <p className="text-xs text-wa-blue mt-0.5">
                                                CHF{" "}
                                                {(
                                                    item.unit_price *
                                                    item.quantity
                                                ).toFixed(2)}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            {/* Total */}
                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                                <span className="text-sm font-semibold text-gray-600">
                                    Total
                                </span>
                                <span className="text-lg font-bold text-wa-navy">
                                    CHF {totalCost.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* RIGHT — Request Form */}
                        <div className="bg-white rounded-2xl shadow p-6">
                            <h2 className="text-lg font-bold text-wa-navy mb-4">
                                Request Details
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Reason */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Reason *
                                    </label>
                                    <select
                                        value={reason}
                                        onChange={(e) =>
                                            setReason(e.target.value)
                                        }
                                        className="form_input"
                                        required
                                    >
                                        <option value="">
                                            Select a reason
                                        </option>
                                        {reasons.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                {r.reason_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Department */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Department *
                                    </label>
                                    <select
                                        value={department}
                                        onChange={(e) =>
                                            setDepartment(e.target.value)
                                        }
                                        className="form_input"
                                        required
                                    >
                                        <option value="">
                                            Select your department
                                        </option>
                                        {departments.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Date Needed */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Date Needed *
                                    </label>
                                    <input
                                        type="date"
                                        value={dateNeeded}
                                        min={today}
                                        onChange={(e) =>
                                            setDateNeeded(e.target.value)
                                        }
                                        className="form_input"
                                        required
                                    />
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Additional Notes
                                        <span className="text-gray-400 font-normal">
                                            {" "}
                                            (optional)
                                        </span>
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) =>
                                            setNotes(e.target.value)
                                        }
                                        className="form_input min-h-24"
                                        placeholder="Any additional context for the preparation team..."
                                    />
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`w-full py-3 rounded-xl font-semibold transition-colors cursor-pointer
                                        ${
                                            submitting
                                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                : "bg-wa-blue hover:bg-wa-ocean text-white"
                                        }`}
                                >
                                    {submitting
                                        ? "Submitting..."
                                        : "Submit Request"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NewRequest;
