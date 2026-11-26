/*
 * Frontend ID: WEB‑CLNT‑MYP‑010101 (회원탈회 모달)
 * React component generated from provided HTML.
 * Uses Tailwind CSS classes identical to original markup.
 * Exported as default MemberLeaveModal.
 */

import React, { useState, useCallback } from 'react';

// Mock data – replace with real API calls as needed
const mockScenarios = {
  blocked: {
    title: "회원 탈회 (차단된 상태)",
    description:
      "회원 탈회가 차단된 경우, 진행 중인 청소 용역이 모두 종료된 후에만 탈회가 가능합니다.",
    activeJobs: [
      { id: 1, name: "청소 요청 A", type: "client" },
      { id: 2, name: "청소 요청 B", type: "contractor" },
    ],
  },
  cleared: {
    title: "회원 탈회 (정상 상태)",
    description:
      "모든 청소 용역이 종료된 상태이므로 바로 탈회가 가능합니다.",
    activeJobs: [],
  },
};

const MemberLeaveModal = ({ isOpen = true, onClose, onSubmit }) => {
  const [scenario, setScenario] = useState("blocked"); // "blocked" or "cleared"
  const [activeTab, setActiveTab] = useState("client"); // "client" | "contractor"
  const [agree, setAgree] = useState(false);
  const [reason, setReason] = useState("");
  const [showInspector, setShowInspector] = useState(false);

  const current = mockScenarios[scenario];

  const handleAgreeChange = useCallback((e) => setAgree(e.target.checked), []);
  const handleReasonChange = useCallback((e) => setReason(e.target.value), []);
  const handleSubmit = useCallback(() => {
    // Placeholder – send payload to backend
    const payload = { scenario, agree, reason };
    console.log("Submit payload", payload);
    if (onSubmit) onSubmit(payload);
    // Close after submit
    if (onClose) onClose();
  }, [scenario, agree, reason, onSubmit, onClose]);

  const closeModal = useCallback(() => {
    if (onClose) onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div id="withdrawal-modal" className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div id="modal-backdrop" className="absolute inset-0 bg-black opacity-50" onClick={closeModal}></div>

      {/* Modal Container */}
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 z-10">
        <button
          id="close-modal-btn"
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={closeModal}
        >
          ✕
        </button>

        {/* Header */}
        <h2 className="text-xl font-semibold mb-4">{current.title}</h2>
        <p className="mb-4 text-sm text-gray-600">{current.description}</p>

        {/* Scenario Switch (blocked / cleared) */}
        <div className="flex space-x-4 mb-4">
          <button
            className={`px-3 py-1 rounded ${scenario === "blocked" ? "bg-primary text-white" : "bg-gray-200"}`}
            onClick={() => setScenario("blocked")}
          >
            차단된 상태
          </button>
          <button
            className={`px-3 py-1 rounded ${scenario === "cleared" ? "bg-primary text-white" : "bg-gray-200"}`}
            onClick={() => setScenario("cleared")}
          >
            정상 상태
          </button>
        </div>

        {/* Tabs for client / contractor */}
        {scenario === "blocked" && (
          <div className="mb-4">
            <div className="flex space-x-2 mb-2">
              <button
                className={`px-2 py-1 rounded ${activeTab === "client" ? "bg-primary text-white" : "bg-gray-200"}`}
                onClick={() => setActiveTab("client")}
              >
                이용자
              </button>
              <button
                className={`px-2 py-1 rounded ${activeTab === "contractor" ? "bg-primary text-white" : "bg-gray-200"}`}
                onClick={() => setActiveTab("contractor")}
              >
                시공자
              </button>
            </div>
            <ul>
              {current.activeJobs
                .filter((job) => (activeTab === "client" ? job.type === "client" : job.type === "contractor"))
                .map((job) => (
                  <li key={job.id} className="border-b py-1">{job.name}</li>
                ))}
            </ul>
          </div>
        )}

        {/* Form – only enabled when scenario is cleared or when no active jobs */}
        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={agree}
              onChange={handleAgreeChange}
              className="form-checkbox h-4 w-4 text-primary"
            />
            <span className="ml-2 text-sm">위 내용에 동의합니다.</span>
          </label>
          <textarea
            placeholder="탈회를 원하는 이유를 입력해주세요."
            value={reason}
            onChange={handleReasonChange}
            className="mt-2 w-full border rounded p-2"
          ></textarea>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded"
            onClick={closeModal}
          >
            취소
          </button>
          <button
            className={`px-4 py-2 rounded text-white ${agree && reason ? "bg-red-600" : "bg-gray-400 cursor-not-allowed"}`}
            disabled={!agree || !reason}
            onClick={handleSubmit}
          >
            영구 회원 탈회
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => setShowInspector((v) => !v)}
          >
            {showInspector ? "Hide" : "Show"} API Payload
          </button>
        </div>

        {/* API Payload inspector */}
        {showInspector && (
          <pre className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify(current, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default MemberLeaveModal;
