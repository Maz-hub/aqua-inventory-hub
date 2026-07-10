// DocumentsSection is a reusable PDF attachment manager embedded in each
// inventory item's details modal (Gift, Apparel, Office, Miscellaneous).
// It fetches the documents attached to a single item (contentType + objectId)
// and, when canManage is true, lets the user upload new PDFs and delete
// existing ones.
//
// Props:
//   contentType - string identifier matching the backend's CONTENT_TYPE_MODELS
//                 (e.g. 'gift', 'apparel', 'office', 'miscellaneous')
//   objectId    - id of the item these documents are attached to
//   canManage   - when true, shows the upload control and per-document delete
//                 button; when false, the section is read-only (open PDFs only)

import { useState, useEffect } from "react";
import api from "../api";

function DocumentsSection({ contentType, objectId, canManage = false }) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, [contentType, objectId]);

    const fetchDocuments = () => {
        api.get(`/api/documents/?content_type=${contentType}&object_id=${objectId}`)
            .then((res) => {
                setDocuments(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to load documents:", err);
                setLoading(false);
            });
    };

    // Only .pdf files are accepted — enforced client-side for a fast error
    // message, and again on the backend as the source of truth.
    const handleUpload = (e) => {
        const file = e.target.files[0];
        e.target.value = "";
        if (!file) return;

        if (!file.name.toLowerCase().endsWith(".pdf")) {
            alert("Only PDF files are allowed.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("content_type", contentType);
        formData.append("object_id", objectId);

        setUploading(true);
        api.post("/api/documents/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
            .then(() => {
                fetchDocuments();
            })
            .catch((err) => {
                alert(err.response?.data?.error || "Failed to upload document.");
            })
            .finally(() => setUploading(false));
    };

    const handleDelete = (doc) => {
        const confirmed = window.confirm(
            `Delete "${doc.original_filename}"? This cannot be undone.`
        );
        if (!confirmed) return;

        api.delete(`/api/documents/delete/${doc.id}/`)
            .then(() => fetchDocuments())
            .catch((err) => {
                alert(err.response?.data?.error || "Failed to delete document.");
            });
    };

    return (
        <div>
            <h3 className="text-lg font-semibold text-wa-navy mb-3 border-b pb-2">
                Documents
            </h3>

            {loading ? (
                <p className="text-sm text-gray-400 mb-3">Loading documents...</p>
            ) : documents.length === 0 ? (
                <p className="text-sm text-gray-400 mb-3">No documents yet</p>
            ) : (
                <ul className="space-y-2 mb-3">
                    {documents.map((doc) => (
                        <li
                            key={doc.id}
                            className="flex items-center justify-between gap-2 bg-gray-50 rounded-lg px-3 py-2"
                        >
                            <a
                                href={doc.file.replace("http://localhost:8000", "")}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-wa-blue hover:text-wa-ocean font-medium truncate"
                            >
                                📄 {doc.original_filename}
                            </a>
                            {canManage && (
                                <button
                                    onClick={() => handleDelete(doc)}
                                    className="text-red-400 hover:text-red-600 cursor-pointer text-lg leading-none shrink-0"
                                    title="Delete document"
                                >
                                    ×
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {canManage && (
                <label
                    className={`inline-block text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                        uploading
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-wa-blue text-white hover:bg-wa-ocean cursor-pointer"
                    }`}
                >
                    {uploading ? "Uploading..." : "+ Upload PDF"}
                    <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleUpload}
                        disabled={uploading}
                        className="hidden"
                    />
                </label>
            )}
        </div>
    );
}

export default DocumentsSection;
