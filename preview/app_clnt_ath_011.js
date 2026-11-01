(function() {
const { useState, useEffect, useRef } = window.React;
const React = window.React;
function AppClntAth011({ isOpen = true, visible, userInfo = null, onClose, onOpenRequestModal, onNavigate, navigation }) {
    const [profile, setProfile] = useState({
        userNo: userInfo?.userNo || 'C20261100001',
        userNm: userInfo?.userNm || '고객',
        userEmail: userInfo?.userEmail || 'user@example.com',
        userTel: userInfo?.userTel || '',
        userRoleCd: userInfo?.userRoleCd || 'C',
        signImgUrl: userInfo?.signImgUrl || userInfo?.signFileUrl || null,
        regDt: ''
    });
    const [termsAgreedList, setTermsAgreedList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdatingSign, setIsUpdatingSign] = useState(false);
    const [showSignModal, setShowSignModal] = useState(false);
    const [activeTab, setActiveTab] = useState('welcome');
    // 모바일 햅틱 피드백 유틸리티
    const triggerHaptic = (type) => {
        try {
            if (typeof window !== 'undefined' && window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'HAPTIC', payload: type }));
            }
            else if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                if (type === 'LIGHT')
                    navigator.vibrate(10);
                else if (type === 'MEDIUM')
                    navigator.vibrate(25);
                else if (type === 'SUCCESS')
                    navigator.vibrate([15, 30, 20]);
                else
                    navigator.vibrate(50);
            }
        }
        catch (e) { }
    };
    // 터치 서명 캔버스 상태
    const canvasRef = useRef(null);
    const isDrawing = useRef(false);
    const [hasNewSignature, setHasNewSignature] = useState(false);
    // 회원 정보 및 약관 동의 내역 로드
    useEffect(() => {
        const isModalOpen = visible !== undefined ? visible : isOpen;
        if (!isModalOpen)
            return;
        const effectiveUserNo = userInfo?.userNo || profile.userNo || 'C20261100001';
        const fetchUserInfo = async () => {
            try {
                setIsLoading(true);
                const res = await fetch('/api/app/client/ath_011', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userNo: effectiveUserNo })
                });
                const result = await res.json();
                if (res.ok && result.success && result.data) {
                    const d = result.data;
                    setProfile({
                        userNo: d.userNo || effectiveUserNo,
                        userNm: d.userNm || userInfo?.userNm || '고객',
                        userEmail: d.userEmail || userInfo?.userEmail || '',
                        userTel: d.userTel || userInfo?.userTel || '',
                        userRoleCd: d.userRoleCd || 'C',
                        signImgUrl: d.signImgUrl || userInfo?.signImgUrl || null,
                        regDt: d.regDt || ''
                    });
                    if (Array.isArray(d.termsAgreedList)) {
                        setTermsAgreedList(d.termsAgreedList);
                    }
                }
            }
            catch (err) {
                console.warn('[APP-CLNT-ATH-011] 모바일 회원 정보 및 약관 조회 실패:', err);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchUserInfo();
    }, [isOpen, visible, userInfo]);
    // 서명 드로잉 핸들러 (마우스 & 모바일 터치)
    const getCoordinates = (e, canvas) => {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    };
    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        const { x, y } = getCoordinates(e, canvas);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#003262';
        isDrawing.current = true;
        setHasNewSignature(true);
    };
    const draw = (e) => {
        if (!isDrawing.current)
            return;
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        const { x, y } = getCoordinates(e, canvas);
        ctx.lineTo(x, y);
        ctx.stroke();
    };
    const stopDrawing = () => {
        isDrawing.current = false;
    };
    const handleClearSignature = () => {
        triggerHaptic('LIGHT');
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasNewSignature(false);
    };
    // 서명 갱신 저장
    const handleSaveNewSignature = async () => {
        const canvas = canvasRef.current;
        if (!canvas || !hasNewSignature) {
            alert('서명을 입력해 주세요.');
            return;
        }
        try {
            setIsUpdatingSign(true);
            triggerHaptic('MEDIUM');
            const signDataUrl = canvas.toDataURL('image/png');
            const res = await fetch('/api/app/client/ath_011', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'UPDATE_SIGNATURE',
                    userNo: profile.userNo,
                    signDataUrl
                })
            });
            const result = await res.json();
            if (res.ok && result.success && result.data) {
                triggerHaptic('SUCCESS');
                setProfile(prev => ({ ...prev, signImgUrl: result.data.signImgUrl }));
                setShowSignModal(false);
                alert('모바일 자필 전자서명이 성공적으로 갱신되었습니다.');
            }
            else {
                alert(result.message || '서명 저장에 실패했습니다.');
            }
        }
        catch (e) {
            console.error(e);
            alert('서버 통신 중 오류가 발생했습니다.');
        }
        finally {
            setIsUpdatingSign(false);
        }
    };
    // [바로 청소 요청 등록하러 가기] 핸들러
    const handleProceedToRequest = () => {
        triggerHaptic('LIGHT');
        if (onClose)
            onClose();
        if (onOpenRequestModal) {
            onOpenRequestModal();
        }
        else if (onNavigate) {
            onNavigate('APP-CLNT-REQ-000');
        }
        else if (navigation?.navigate) {
            navigation.navigate('APP-CLNT-REQ-000');
        }
    };
    const handleDismiss = () => {
        triggerHaptic('LIGHT');
        if (onClose) {
            onClose();
        }
        else if (onNavigate) {
            onNavigate('APP-CLNT-COM-000');
        }
        else if (navigation?.goBack) {
            navigation.goBack();
        }
    };
    const isModalOpen = visible !== undefined ? visible : isOpen;
    if (!isModalOpen)
        return null;
    return (React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in", id: "modal-welcome-app-overlay", onClick: (e) => {
            if (e.target === e.currentTarget)
                handleDismiss();
        } },
        React.createElement("div", { "aria-labelledby": "modal-welcome-headline", "aria-modal": "true", className: "relative w-full max-w-[480px] h-full sm:h-auto sm:max-h-[92vh] bg-surface-container-lowest sm:rounded-3xl shadow-2xl p-5 sm:p-7 text-center transform transition-all duration-300 flex flex-col items-center border-0 sm:border border-slate-200/80 text-on-surface overflow-y-auto", id: "modal-welcome-app-card", role: "dialog" },
            React.createElement("button", { "aria-label": "\uD31D\uC5C5 \uB2EB\uAE30", className: "absolute top-4 right-4 w-9 h-9 rounded-full text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors flex items-center justify-center cursor-pointer", id: "btn-close-app-x", onClick: handleDismiss, type: "button" },
                React.createElement("span", { className: "material-symbols-outlined text-[22px]" }, "close")),
            React.createElement("div", { className: "relative mb-space-sm flex items-center justify-center mt-2 sm:mt-0" },
                React.createElement("div", { className: "absolute -inset-2 rounded-full bg-secondary-container/40 blur-md" }),
                React.createElement("div", { className: "relative w-16 h-16 rounded-full bg-surface-container-lowest p-1 flex items-center justify-center shadow-md ring-4 ring-secondary/20 overflow-hidden" },
                    React.createElement("img", { alt: "\uC4F8\uACE0\uB2E6\uACE0 \uACF5\uC2DD \uB85C\uACE0", className: "w-full h-full rounded-full object-cover", src: "/logo.png" }),
                    React.createElement("div", { className: "absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-md" },
                        React.createElement("span", { className: "material-symbols-outlined text-[13px]" }, "check")))),
            React.createElement("h2", { className: "font-headline-sm text-headline-sm text-primary font-bold tracking-tight mb-1 leading-snug", id: "modal-welcome-headline" }, "\uC4F8\uACE0\uB2E6\uACE0\uC5D0 \uC624\uC2E0 \uAC83\uC744 \uD658\uC601\uD569\uB2C8\uB2E4!"),
            React.createElement("p", { className: "font-caption text-caption text-on-surface-variant leading-relaxed mb-3" }, "\uD68C\uC6D0\uAC00\uC785 \uBC0F 5\uB300 \uD544\uC218 \uC57D\uAD00 \uB3D9\uC758, \uC790\uD544 \uC804\uC790\uC11C\uBA85\uC774 \uC548\uC804\uD558\uAC8C \uBCF4\uAD00\uB418\uC5C8\uC2B5\uB2C8\uB2E4."),
            React.createElement("div", { className: "w-full flex border-b border-slate-200 mb-4 shrink-0" },
                React.createElement("button", { type: "button", onClick: () => {
                        triggerHaptic('LIGHT');
                        setActiveTab('welcome');
                    }, className: `flex-1 py-2 font-label-md text-label-md font-semibold transition-colors border-b-2 ${activeTab === 'welcome'
                        ? 'border-secondary text-secondary'
                        : 'border-transparent text-outline hover:text-on-surface'}` }, "\uD68C\uC6D0\uC815\uBCF4"),
                React.createElement("button", { type: "button", onClick: () => {
                        triggerHaptic('LIGHT');
                        setActiveTab('terms');
                    }, className: `flex-1 py-2 font-label-md text-label-md font-semibold transition-colors border-b-2 flex items-center justify-center gap-1 ${activeTab === 'terms'
                        ? 'border-secondary text-secondary'
                        : 'border-transparent text-outline hover:text-on-surface'}` },
                    React.createElement("span", null, "\uC57D\uAD00\uB3D9\uC758"),
                    React.createElement("span", { className: "text-[11px] px-1.5 py-0.2 rounded-full bg-secondary/15 text-secondary font-mono" }, termsAgreedList.length > 0 ? termsAgreedList.length : '5')),
                React.createElement("button", { type: "button", onClick: () => {
                        triggerHaptic('LIGHT');
                        setActiveTab('signature');
                    }, className: `flex-1 py-2 font-label-md text-label-md font-semibold transition-colors border-b-2 ${activeTab === 'signature'
                        ? 'border-secondary text-secondary'
                        : 'border-transparent text-outline hover:text-on-surface'}` }, "\uC804\uC790\uC11C\uBA85 \uAD00\uB9AC")),
            activeTab === 'welcome' && (React.createElement("div", { className: "w-full space-y-3 mb-4 text-left flex-1" },
                React.createElement("div", { className: "w-full bg-[#F0FDFA] border border-[#CCFBF1] rounded-2xl p-4 shadow-xs" },
                    React.createElement("div", { className: "flex items-center justify-between pb-2 mb-2 border-b border-teal-100/60" },
                        React.createElement("div", { className: "flex items-center gap-1.5" },
                            React.createElement("span", { className: "material-symbols-outlined text-secondary text-[20px]" }, "badge"),
                            React.createElement("span", { className: "font-label-md text-label-md text-on-surface" },
                                React.createElement("strong", { className: "text-on-surface font-bold" }, profile.userNm),
                                " \uACE0\uAC1D\uB2D8")),
                        React.createElement("span", { className: "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-secondary-fixed text-on-secondary-fixed-variant" }, "\uACE0\uAC1D\uD68C\uC6D0(C)")),
                    React.createElement("div", { className: "space-y-1.5 font-caption text-caption text-on-surface-variant" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("span", { className: "text-outline" }, "\uD68C\uC6D0\uC2DD\uBCC4\uBC88\uD638"),
                            React.createElement("span", { className: "font-mono font-medium text-on-surface" }, profile.userNo)),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("span", { className: "text-outline" }, "\uB85C\uADF8\uC778 \uACC4\uC815"),
                            React.createElement("span", { className: "font-medium text-on-surface truncate max-w-[200px]" }, profile.userEmail)),
                        profile.userTel && (React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("span", { className: "text-outline" }, "\uD734\uB300\uD3F0 \uBC88\uD638"),
                            React.createElement("span", { className: "font-medium text-on-surface" }, profile.userTel))),
                        profile.regDt && (React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("span", { className: "text-outline" }, "\uAC00\uC785 \uC77C\uC2DC"),
                            React.createElement("span", { className: "font-mono text-[11px] text-on-surface" }, profile.regDt))))),
                React.createElement("div", { className: "w-full p-3 rounded-2xl bg-surface-container-low border border-slate-200/80 flex items-center justify-between" },
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement("span", { className: "material-symbols-outlined text-secondary text-[20px]" }, "draw"),
                        React.createElement("div", null,
                            React.createElement("div", { className: "font-label-sm text-label-sm font-semibold text-on-surface" }, "\uC790\uD544 \uC804\uC790\uC11C\uBA85 \uB0A0\uC778"),
                            React.createElement("div", { className: "text-[11px] text-on-surface-variant" }, "\uBC95\uC801 \uD6A8\uB825 \uC99D\uC801 \uBCF4\uAD00 \uC644\uB8CC"))),
                    profile.signImgUrl ? (React.createElement("div", { className: "w-24 h-10 bg-white border border-slate-200 rounded p-1 flex items-center justify-center overflow-hidden" },
                        React.createElement("img", { src: profile.signImgUrl, alt: "\uC790\uD544 \uC11C\uBA85", className: "max-h-full object-contain" }))) : (React.createElement("span", { className: "text-[11px] text-outline" }, "\uC11C\uBA85 \uB4F1\uB85D \uC644\uB8CC"))),
                React.createElement("div", { className: "w-full space-y-2 pt-1 text-left" },
                    React.createElement("div", { className: "flex items-start gap-2 p-2.5 rounded-xl bg-surface-container-low/70" },
                        React.createElement("span", { className: "material-symbols-outlined text-secondary text-[18px] mt-0.5" }, "shield"),
                        React.createElement("div", { className: "text-[12px] leading-tight" },
                            React.createElement("strong", { className: "text-on-surface font-semibold" }, "100% \uC2E0\uC6D0 \uBCF4\uC99D \uB9C8\uC2A4\uD130 \uBC30\uC815: "),
                            React.createElement("span", { className: "text-on-surface-variant" }, "\uBC30\uC0C1\uCC45\uC784\uBCF4\uD5D8 \uBC0F \uC0AC\uC5C5\uC790 \uC2E0\uC6D0 \uAC80\uC99D \uC644\uB8CC"))),
                    React.createElement("div", { className: "flex items-start gap-2 p-2.5 rounded-xl bg-surface-container-low/70" },
                        React.createElement("span", { className: "material-symbols-outlined text-secondary text-[18px] mt-0.5" }, "handshake"),
                        React.createElement("div", { className: "text-[12px] leading-tight" },
                            React.createElement("strong", { className: "text-on-surface font-semibold" }, "\uD604\uC7A5 \uAC80\uC218 \uD6C4 \uC804\uC561 \uC9C1\uBD88 \uC815\uC0B0: "),
                            React.createElement("span", { className: "text-on-surface-variant" }, "\uC120\uC785\uAE08 \uC5C6\uB294 \uC2DC\uACF5 \uC644\uB8CC \uD6C4 \uC9C1\uC811 \uACB0\uC81C (\uC218\uC218\uB8CC \uC81C\uB85C)")))))),
            activeTab === 'terms' && (React.createElement("div", { className: "w-full space-y-2 mb-4 text-left max-h-[300px] overflow-y-auto pr-1 flex-1" },
                React.createElement("div", { className: "p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-[11px] text-teal-800 flex items-center gap-1.5" },
                    React.createElement("span", { className: "material-symbols-outlined text-[16px]" }, "verified"),
                    React.createElement("span", null, "\uC804\uC790\uC11C\uBA85\uBC95\uC5D0 \uB530\uB978 5\uB300 \uD544\uC218 \uC57D\uAD00 \uB3D9\uC758 \uBC0F \uC99D\uC801 \uAE30\uB85D\uC785\uB2C8\uB2E4.")),
                termsAgreedList.length > 0 ? (termsAgreedList.map((term, idx) => (React.createElement("div", { key: term.agreeSeq || term.termsCd || idx, className: "p-3 rounded-2xl bg-surface-container-low border border-slate-200/90 flex flex-col gap-1" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("span", { className: "font-label-md text-label-md font-bold text-on-surface flex items-center gap-1" },
                            React.createElement("span", { className: "material-symbols-outlined text-secondary text-[16px]" }, "check_circle"),
                            term.termsTitle || term.termsCd),
                        React.createElement("span", { className: "text-[11px] px-1.5 py-0.5 rounded bg-secondary/15 text-secondary font-semibold font-mono" }, term.termsVer || 'v1.0')),
                    React.createElement("div", { className: "flex items-center justify-between text-[11px] text-on-surface-variant pt-1 border-t border-slate-100" },
                        React.createElement("span", { className: "text-outline" }, "\uB3D9\uC758 \uC77C\uC2DC"),
                        React.createElement("span", { className: "font-mono text-on-surface" }, term.agreeDt || '가입 시 동의 완료')))))) : ([
                    { title: '서비스 통합이용약관', code: 'SERVICE', ver: 'v1.0' },
                    { title: '개인정보 수집 및 이용 동의', code: 'PRIVACY', ver: 'v1.0' },
                    { title: '위치기반 서비스 이용약관', code: 'LOCATION', ver: 'v1.0' },
                    { title: '전자금융거래 기본약관', code: 'FINANCE', ver: 'v1.0' },
                    { title: '전자거래 및 자필 전자서명 보증 동의', code: 'SIGNATURE', ver: 'v1.0' },
                ].map((item) => (React.createElement("div", { key: item.code, className: "p-3 rounded-2xl bg-surface-container-low border border-slate-200/90 flex items-center justify-between" },
                    React.createElement("div", { className: "flex items-center gap-1.5" },
                        React.createElement("span", { className: "material-symbols-outlined text-secondary text-[16px]" }, "check_circle"),
                        React.createElement("span", { className: "font-label-sm text-label-sm font-semibold text-on-surface" }, item.title)),
                    React.createElement("span", { className: "text-[11px] px-1.5 py-0.5 rounded bg-secondary/15 text-secondary font-mono" }, item.ver))))))),
            activeTab === 'signature' && (React.createElement("div", { className: "w-full space-y-3 mb-4 text-left flex-1" },
                React.createElement("div", { className: "p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center" },
                    React.createElement("span", { className: "text-[12px] font-semibold text-on-surface mb-2 self-start" }, "\uD604\uC7AC \uB4F1\uB85D\uB41C \uBCF8\uC778 \uC790\uD544 \uC804\uC790\uC11C\uBA85"),
                    React.createElement("div", { className: "w-full h-32 bg-white border border-dashed border-slate-300 rounded-xl flex items-center justify-center p-2 relative overflow-hidden" },
                        profile.signImgUrl ? (React.createElement("img", { src: profile.signImgUrl, alt: "\uB4F1\uB85D\uB41C \uC804\uC790\uC11C\uBA85", className: "max-h-full max-w-full object-contain" })) : (React.createElement("span", { className: "text-on-surface-variant text-[12px]" }, "\uC11C\uBA85 \uC774\uBBF8\uC9C0\uB97C \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4.")),
                        React.createElement("div", { className: "absolute bottom-1 right-2 flex items-center gap-1 text-[10px] text-secondary font-semibold bg-white/90 px-1.5 py-0.5 rounded shadow-xs" },
                            React.createElement("span", { className: "material-symbols-outlined text-[12px]" }, "verified"),
                            React.createElement("span", null, "\uC704\uBCC0\uC870 \uBC29\uC9C0 \uBCF4\uC99D")))),
                React.createElement("button", { type: "button", onClick: () => {
                        triggerHaptic('LIGHT');
                        setShowSignModal(true);
                    }, className: "w-full py-3 px-4 bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-md text-label-md rounded-2xl border border-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-semibold shadow-xs" },
                    React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, "edit"),
                    React.createElement("span", null, "\uC0C8\uB85C\uC6B4 \uC790\uD544 \uC804\uC790\uC11C\uBA85\uC73C\uB85C \uBCC0\uACBD (\uC7AC\uB4F1\uB85D)")))),
            React.createElement("div", { className: "w-full flex flex-col gap-2 shrink-0" },
                React.createElement("button", { className: "w-full h-[50px] bg-secondary hover:bg-on-secondary-container text-on-secondary font-label-lg text-label-lg rounded-2xl shadow-md transition-all duration-150 flex items-center justify-center gap-1.5 active:scale-[0.99] cursor-pointer", "data-action": "OPEN_MODAL_APP_CLNT_REQ_000", id: "btn-app-request-cleaning", onClick: handleProceedToRequest, type: "button" },
                    React.createElement("span", null, "\uBC14\uB85C \uCCAD\uC18C \uC694\uCCAD \uB4F1\uB85D\uD558\uB7EC \uAC00\uAE30"),
                    React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, "chevron_right")),
                React.createElement("button", { className: "w-full h-[38px] text-outline hover:text-on-surface font-label-md text-label-md transition-colors flex items-center justify-center cursor-pointer", "data-action": "CLOSE_MODAL_GO_HOME", id: "btn-app-dismiss-to-home", onClick: handleDismiss, type: "button" }, "\uD648 \uB458\uB7EC\uBCF4\uAE30"))),
        showSignModal && (React.createElement("div", { className: "fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs" },
            React.createElement("div", { className: "relative w-full max-w-[420px] bg-white rounded-3xl p-5 shadow-2xl flex flex-col gap-3 animate-in zoom-in-95" },
                React.createElement("div", { className: "flex items-center justify-between border-b pb-2" },
                    React.createElement("h3", { className: "font-label-lg text-label-lg font-bold text-primary" }, "\uC790\uD544 \uC804\uC790\uC11C\uBA85 \uC7AC\uB4F1\uB85D"),
                    React.createElement("button", { type: "button", onClick: () => setShowSignModal(false), className: "w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500" },
                        React.createElement("span", { className: "material-symbols-outlined text-[20px]" }, "close"))),
                React.createElement("p", { className: "text-[12px] text-slate-600" }, "\uC544\uB798 \uCE94\uBC84\uC2A4\uC5D0 \uD130\uCE58\uB85C \uC0C8\uB85C\uC6B4 \uBCF8\uC778 \uC11C\uBA85\uC744 \uADF8\uB824\uC8FC\uC138\uC694."),
                React.createElement("div", { className: "w-full h-40 bg-slate-50 border-2 border-dashed border-teal-300 rounded-2xl overflow-hidden relative" },
                    React.createElement("canvas", { ref: canvasRef, width: 400, height: 160, className: "w-full h-full cursor-crosshair touch-none", onMouseDown: startDrawing, onMouseMove: draw, onMouseUp: stopDrawing, onMouseLeave: stopDrawing, onTouchStart: startDrawing, onTouchMove: draw, onTouchEnd: stopDrawing }),
                    !hasNewSignature && (React.createElement("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-sm" }, "\uC774\uACF3\uC5D0 \uC11C\uBA85\uD574 \uC8FC\uC138\uC694"))),
                React.createElement("div", { className: "flex justify-between items-center pt-1" },
                    React.createElement("button", { type: "button", onClick: handleClearSignature, className: "text-[12px] text-slate-500 hover:text-slate-800 underline" }, "\uB2E4\uC2DC \uC4F0\uAE30"),
                    React.createElement("div", { className: "flex gap-2" },
                        React.createElement("button", { type: "button", onClick: () => setShowSignModal(false), className: "px-3 py-1.5 text-sm rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700" }, "\uCDE8\uC18C"),
                        React.createElement("button", { type: "button", onClick: handleSaveNewSignature, disabled: isUpdatingSign || !hasNewSignature, className: "px-4 py-1.5 text-sm rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow disabled:opacity-50" }, isUpdatingSign ? '저장 중...' : '서명 갱신 저장'))))))));
}

if (typeof window !== 'undefined') {
  window.AppClntAth011 = AppClntAth011;
  console.log('✅ APP-CLNT-ATH-011 Mobile Screen registered to window.AppClntAth011');
}

})();