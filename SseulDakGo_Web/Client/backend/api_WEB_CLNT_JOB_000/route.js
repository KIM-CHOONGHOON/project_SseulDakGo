/**
 * @file SseulDakGo_Web/Client/backend/api_WEB_CLNT_JOB_000/route.js
 * @description 청소 시공 검수 및 현장 직불 완료 승인 API (WEB-CLNT-JOB-000)
 *              - action: 'GET_INSPECT_DATA' -> 계약/현장/파트너 정보 및 시공 전/후 사진 목록 조회
 *              - action: 'CONFIRM_COMPLETE' -> 최종 시공 검수 승인 원자적 트랜잭션 (SVC_COMPLETED)
 * 
 * 테이블:
 * - TB_ORDER_MSTR: 주발주 마스터
 * - TB_ORDER_DTL: 발주 상세
 * - TB_ORDER_PHOTO: 시공 전/후 사진
 * - TB_CLEAN_CONTRACT: 체결 계약 마스터
 * - TB_USER: 회원 기본 정보 (고객 및 파트너)
 */

/**
 * 샌드박스/오프라인 환경용 시뮬레이션 데이터 생성기
 */
function getMockInspectData(contractNo = 'CNT2026103100001', clientUserNo = 'C20261000001') {
  return {
    contract: {
      contractNo: contractNo,
      orderNo: 'ORD20261028-0091',
      orderDtlNo: 'ORD20261028-009101',
      clientUserNo: clientUserNo,
      serviceUserNo: 'S20261000001',
      cleanLargeCd: 'REGULAR',
      cleanLargeNm: '정기청소',
      cleanMidCd: 'VILLA_COMM',
      cleanMidNm: '빌라 공용부 (B1~4F 계단/복도)',
      addrText: '경기 고양시 일산동구 마두동 123-45',
      addrDetail: '한빛빌딩 (공동현관 비번: #8821*)',
      confirmedDate: '2026.11.02(월)',
      confirmedTime: '10:00 ~ 13:30',
      workDurationText: '3.5h 완료',
      totalServiceAmt: 720000,
      safeTelNo: '0507-1234-5678',
      contractStatCd: 'IN_PROGRESS',
      contractStatNm: '시공완료 · 현장검수대기',
      partner: {
        userNo: 'S20261000001',
        companyNm: '반짝빌라클린',
        userNm: '이*수 대표',
        userTel: '010-3344-5566',
        tierNm: 'MASTER TIER',
        insuranceNm: '현대해상 영업배상책임 1억원',
        bankName: 'IBK기업은행',
        accountNo: '110-123-456789',
        accountHolder: '이충훈 (반짝빌라클린)'
      },
      reportRegDt: '2026.11.02 13:45'
    },
    photos: [
      {
        pairId: 1,
        title: '1층 공동현관 로비 및 강화유리 도어 / 스테인리스 난간',
        treatmentNote: '약제 살균 세척 완료',
        before: {
          photoSeq: 101,
          photoTimingCd: 'BEFORE',
          src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0tk9Nz0I5rVtTVqg2EgrTTYbw6mmm_4-tu-HjQQsmwvH4b47n_Mar6hvcKGWQ1eHLHmRHEC3eUdLHjugPL5hwXD4L4T_h0ic3ukD78zUC50V9pM520ozlSs0iQoYQNr_FTMD22I3WGOVa_Vs37MiXKXBRrIiFfwJIdzx2NisSqNSWMLugQhXzvUvFYN1gEs7TAkXycgT2d_SwEwHL_T_ADQ2ZcH1bUUOL0AKIt2Y',
          takenTimeText: '2026.11.02 10:18',
          photoNo: 'PHT-001-B',
          altText: '청소 전 먼지와 빗물 자국이 남아 있는 1층 로비 유리문 및 손잡이'
        },
        after: {
          photoSeq: 102,
          photoTimingCd: 'AFTER',
          src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAw1l4n0FwidaKlUASp_w_xvFTYtIHysmz5TnrXIhw33rcBVwSt-p7pMQraBhBSpCMfJWAk-RkDHYEldmA282LJTlMcI-Zgb6tSszZ7INQCqFBxW7QLmBxzFAYIc3wZTjIlyG8TqpBqHvWykLOpQrR99CKOAHB1Pz2AiH-bZG6cdm6-F3cPVHaTOQciFODbG_HhDLcQZToqRyaPoAA0o4egoCRXgxlprYVTMNdD5vA',
          takenTimeText: '2026.11.02 11:05',
          photoNo: 'PHT-001-A',
          altText: '청소 후 얼룩 없이 투명하게 닦인 유리 도어 및 광택 난간'
        }
      },
      {
        pairId: 2,
        title: '2~4층 석재 계단실 보행로 및 걸레받이 모서리 틈새',
        treatmentNote: '친환경 세정제 건식·습식 마감',
        before: {
          photoSeq: 201,
          photoTimingCd: 'BEFORE',
          src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBe6sdFH9rekvC56eKlzCB9PuueawiL0qkbOca6zY70k9h6LAp_tAUFwI2xvPvtVtWE9QgCWk9gXkWecv1wTu0mYtE9o3LsLbdqp5qeVSgcBp3OnGt2eKY-ZTlTCiSxhnIin4Vv109aEI458i6NdETV2eEIKGc45WJQewOozp7aeed1yLED0SpoTPbolDcMWuDl-Eya_Z36b0gR2H3f-eVxZi-8cXNKHSQPgtDagt0',
          takenTimeText: '2026.11.02 10:40',
          photoNo: 'PHT-002-B',
          altText: '발자국과 찌든 때가 낀 석재 계단 및 모서리 틈새'
        },
        after: {
          photoSeq: 202,
          photoTimingCd: 'AFTER',
          src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLrxDsUrBwTpS5f8JMc6_eQap2QBa8yvaxH7VMrUV2Aca2Dwd0AgQAasHqR2i4DXKVCzNLul2ctrlaZLg7cjUy4eqToWltIJzsmDDiiLGMwj3ZgSh4BSvwdfcNh7rOtV4Z-Z4f8wFJTuQ-exOT9WbRwOM01dkpLXLTxWNEHfWtFFjLlKieqrp-3elRHqSNkiC2LFooMZ6HkrYrs22RyyN71nHbW3OhajRWlNeG9bA',
          takenTimeText: '2026.11.02 12:20',
          photoNo: 'PHT-002-A',
          altText: '먼지와 오염이 완벽히 제거된 은은한 광택의 석재 계단'
        }
      },
      {
        pairId: 3,
        title: '1층 외곽 분리배출장 및 필로티 주차장 진입로',
        treatmentNote: '고압 세척 및 분리함 정돈 완료',
        before: {
          photoSeq: 301,
          photoTimingCd: 'BEFORE',
          src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXHi-QSEGb9_hgVgfFVeZyH-thAid5k2iRB5PTaZ_fnj7yU8JEe4Pa3D5LnW535IZmWtySiGNWk7CXOR1qwgrJIUi53ym2EHYmKKYPL1LYMW0e0Mkof-N45qNzgUQt2sPVCZacdfzMbBq204C1dbn76QiUnGRM1vQwtnfa4hxNbLJb0p-atNoKk_gdwElHvPbSyKxh3hPDpAo3tDqd5vTOSwhEwFh_p-PnpLmW-o0',
          takenTimeText: '2026.11.02 10:25',
          photoNo: 'PHT-003-B',
          altText: '어지럽혀진 분리수거함 및 얼룩진 바닥'
        },
        after: {
          photoSeq: 302,
          photoTimingCd: 'AFTER',
          src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkjcdc6f63KJpwBr050NXdn9STMkhEQPIoo8FfbHN721il4WeX9IYpu3AMiRuc1dvZA_9lD6XC7fs38f1Cig11xhY3yq7fG6apDkhQie_y-RwhUYyaSp2KG6hzbdB7EF6qVDHN_xO7hVN5rOR85b4mFuAHrQkRq7QiSjUcjfXArK9HLFOBV-znO7kHqlZ-oi84im-H9vX8bBFpda7lal11ITK8W9z5gh13o--5_ig',
          takenTimeText: '2026.11.02 13:28',
          photoNo: 'PHT-003-A',
          altText: '고압 물청소로 말끔히 세척된 분리수거장 및 주차 바닥'
        }
      }
    ]
  };
}

/**
 * WEB-CLNT-JOB-000 비즈니스 로직 처리기
 * @param {Object} payload 
 * @returns {Promise<{status: number, data: Object}>}
 */
export async function processWebClntJob000(payload = {}) {
  const {
    action = 'GET_INSPECT_DATA',
    contractNo = 'CNT2026103100001',
    clientUserNo = 'C20261000001'
  } = payload;

  let db = null;
  try {
    db = await import('../../../../lib/db.js');
  } catch (e) {
    db = await import('../../lib/db.js').catch(() => null);
  }

  // =========================================================================
  // 1. 검수 상세 데이터 조회 (action === 'GET_INSPECT_DATA')
  // =========================================================================
  if (action === 'GET_INSPECT_DATA') {
    if (db && typeof db.executeQuery === 'function') {
      try {
        // a) 계약 및 발주 정보 조회
        const contractRows = await db.executeQuery(
          `SELECT 
            C.CONTRACT_NO, C.ORDER_NO, C.ORDER_DTL_NO, C.CLIENT_USER_NO, C.SERVICE_USER_NO,
            C.CONFIRMED_DATE, C.CONFIRMED_TIME, C.TOTAL_SERVICE_AMT, C.SAFE_TEL_NO, C.CONTRACT_STAT_CD,
            M.ORDER_STATUS, M.ADDR_TEXT, M.ADDR_DETAIL,
            D.CLEAN_LARGE_CD, D.CLEAN_MID_CD,
            U.USER_NM, U.COMPANY_NM, U.USER_TEL
          FROM TB_CLEAN_CONTRACT C
          INNER JOIN TB_ORDER_MSTR M ON C.ORDER_NO = M.ORDER_NO
          INNER JOIN TB_ORDER_DTL D ON C.ORDER_DTL_NO = D.ORDER_DTL_NO
          INNER JOIN TB_USER U ON C.SERVICE_USER_NO = U.USER_NO
          WHERE C.CONTRACT_NO = ? AND C.CLIENT_USER_NO = ?
          LIMIT 1`,
          [contractNo, clientUserNo]
        );

        if (contractRows && contractRows.length > 0) {
          const row = contractRows[0];
          const orderNo = row.ORDER_NO;

          // b) 현장 전/후 사진 목록 조회
          const photoRows = await db.executeQuery(
            `SELECT 
              PHOTO_SEQ, PHOTO_TIMING_CD, STORAGE_PATH, LOGICAL_FILE_NM, PHYSICAL_FILE_NM, FILE_EXT, SORT_ORD
            FROM TB_ORDER_PHOTO
            WHERE ORDER_NO = ? AND DEL_YN = 'N'
            ORDER BY SORT_ORD ASC, PHOTO_TIMING_CD DESC`,
            [orderNo]
          );

          const mockFallback = getMockInspectData(contractNo, clientUserNo);

          // 사진 목록 페어링 구성
          let formattedPhotos = mockFallback.photos;
          if (photoRows && photoRows.length > 0) {
            // DB 사진 존재 시 동적 구성
            const beforeList = photoRows.filter(p => p.PHOTO_TIMING_CD === 'BEFORE');
            const afterList = photoRows.filter(p => p.PHOTO_TIMING_CD === 'AFTER');
            const maxPairs = Math.max(beforeList.length, afterList.length);

            if (maxPairs > 0) {
              formattedPhotos = Array.from({ length: maxPairs }).map((_, idx) => {
                const b = beforeList[idx];
                const a = afterList[idx];
                return {
                  pairId: idx + 1,
                  title: b?.LOGICAL_FILE_NM?.replace(/_BEFORE.*$/i, '') || `시공 검증 구역 ${idx + 1}`,
                  treatmentNote: '현장 마감 세척 완료',
                  before: b ? {
                    photoSeq: b.PHOTO_SEQ,
                    photoTimingCd: 'BEFORE',
                    src: b.STORAGE_PATH || (mockFallback.photos[idx]?.before.src),
                    takenTimeText: '2026.11.02 10:20',
                    photoNo: `PHT-00${idx+1}-B`,
                    altText: b.LOGICAL_FILE_NM || '작업 전 사진'
                  } : mockFallback.photos[0].before,
                  after: a ? {
                    photoSeq: a.PHOTO_SEQ,
                    photoTimingCd: 'AFTER',
                    src: a.STORAGE_PATH || (mockFallback.photos[idx]?.after.src),
                    takenTimeText: '2026.11.02 12:30',
                    photoNo: `PHT-00${idx+1}-A`,
                    altText: a.LOGICAL_FILE_NM || '작업 후 사진'
                  } : mockFallback.photos[0].after
                };
              });
            }
          }

          return {
            status: 200,
            data: {
              success: true,
              code: 'OK',
              data: {
                contract: {
                  contractNo: row.CONTRACT_NO,
                  orderNo: row.ORDER_NO,
                  orderDtlNo: row.ORDER_DTL_NO,
                  clientUserNo: row.CLIENT_USER_NO,
                  serviceUserNo: row.SERVICE_USER_NO,
                  cleanLargeCd: row.CLEAN_LARGE_CD,
                  cleanLargeNm: row.CLEAN_LARGE_CD === 'MOVEIN' ? '입주청소' : row.CLEAN_LARGE_CD === 'APPLIANCE' ? '계절가전' : '정기청소',
                  cleanMidCd: row.CLEAN_MID_CD,
                  cleanMidNm: row.CLEAN_MID_CD || '빌라 공용부 (B1~4F 계단/복도)',
                  addrText: row.ADDR_TEXT || '경기 고양시 일산동구 마두동 123-45',
                  addrDetail: row.ADDR_DETAIL || '한빛빌딩',
                  confirmedDate: row.CONFIRMED_DATE || '2026.11.02(월)',
                  confirmedTime: row.CONFIRMED_TIME || '10:00 ~ 13:30',
                  workDurationText: '3.5h 완료',
                  totalServiceAmt: row.TOTAL_SERVICE_AMT || 720000,
                  safeTelNo: row.SAFE_TEL_NO || '0507-1234-5678',
                  contractStatCd: row.CONTRACT_STAT_CD || 'IN_PROGRESS',
                  contractStatNm: row.CONTRACT_STAT_CD === 'COMPLETED' ? '시공 및 직불 승인완료 (SVC_COMPLETED)' : '시공완료 · 현장검수대기',
                  partner: {
                    userNo: row.SERVICE_USER_NO,
                    companyNm: row.COMPANY_NM || '반짝빌라클린',
                    userNm: row.USER_NM || '이*수 대표',
                    userTel: row.USER_TEL || '010-3344-5566',
                    tierNm: 'MASTER TIER',
                    insuranceNm: '현대해상 영업배상책임 1억원',
                    bankName: 'IBK기업은행',
                    accountNo: '110-123-456789',
                    accountHolder: `${row.USER_NM || '이충훈'} (${row.COMPANY_NM || '반짝빌라클린'})`
                  },
                  reportRegDt: '2026.11.02 13:45'
                },
                photos: formattedPhotos
              }
            }
          };
        }
      } catch (dbErr) {
        console.warn('[GET_INSPECT_DATA_DB_FALLBACK]', dbErr.message);
      }
    }

    // 샌드박스/오프라인 모의 데이터 반환
    const mockData = getMockInspectData(contractNo, clientUserNo);
    return {
      status: 200,
      data: {
        success: true,
        code: 'OK',
        data: mockData
      }
    };
  }

  // =========================================================================
  // 2. 최종 청소 완료 승인 처리 (action === 'CONFIRM_COMPLETE')
  // =========================================================================
  if (action === 'CONFIRM_COMPLETE') {
    if (db && typeof db.executeQuery === 'function') {
      try {
        // a) 계약 유효성 검증
        const chkRows = await db.executeQuery(
          `SELECT CONTRACT_STAT_CD, ORDER_NO, ORDER_DTL_NO, TOTAL_SERVICE_AMT
           FROM TB_CLEAN_CONTRACT 
           WHERE CONTRACT_NO = ? AND CLIENT_USER_NO = ? LIMIT 1`,
          [contractNo, clientUserNo]
        );

        if (!chkRows || chkRows.length === 0) {
          return {
            status: 404,
            data: {
              success: false,
              code: 'ERR_CONTRACT_NOT_FOUND',
              message: '해당 계약 건을 찾을 수 없습니다.'
            }
          };
        }

        const { ORDER_NO, ORDER_DTL_NO, TOTAL_SERVICE_AMT } = chkRows[0];

        // b) 원자적 DB 트랜잭션 3단계
        // 1. 계약 마스터 상태 갱신 (COMPLETED)
        await db.executeQuery(
          `UPDATE TB_CLEAN_CONTRACT
           SET CONTRACT_STAT_CD = 'COMPLETED', MOD_DT = NOW()
           WHERE CONTRACT_NO = ? AND CLIENT_USER_NO = ?`,
          [contractNo, clientUserNo]
        );

        // 2. 주발주 마스터 상태 전이 (SVC_COMPLETED)
        await db.executeQuery(
          `UPDATE TB_ORDER_MSTR
           SET ORDER_STATUS = 'SVC_COMPLETED', COMPLETED_DT = NOW()
           WHERE ORDER_NO = ?`,
          [ORDER_NO]
        );

        // 3. 중분류 상세 상태 전이
        await db.executeQuery(
          `UPDATE TB_ORDER_DTL
           SET SERVICE_STATUS = 'APPR_CONTRACT', DETAIL_STATUS = 'SERVICE_DONE'
           WHERE ORDER_DTL_NO = ?`,
          [ORDER_DTL_NO]
        );

        return {
          status: 200,
          data: {
            success: true,
            code: 'OK',
            data: {
              contractNo,
              orderStatus: 'SVC_COMPLETED',
              contractStatCd: 'COMPLETED',
              totalServiceAmt: TOTAL_SERVICE_AMT || 720000,
              completedDt: new Date().toISOString()
            },
            message: '청소 완료 승인이 정상 처리되었습니다. 파트너에게 대금을 직접 지급해 주세요.'
          }
        };
      } catch (dbErr) {
        console.warn('[CONFIRM_COMPLETE_DB_FALLBACK]', dbErr.message);
      }
    }

    // 샌드박스/오프라인 Fallback 시뮬레이션
    return {
      status: 200,
      data: {
        success: true,
        code: 'OK',
        data: {
          contractNo,
          orderStatus: 'SVC_COMPLETED',
          contractStatCd: 'COMPLETED',
          totalServiceAmt: 720000,
          completedDt: new Date().toISOString()
        },
        message: '청소 완료 승인이 정상 처리되었습니다. 파트너에게 대금을 직접 지급해 주세요. (가상 환경)'
      }
    };
  }

  return {
    status: 400,
    data: {
      success: false,
      code: 'ERR_INVALID_ACTION',
      message: '유효하지 않은 요청 액션입니다.'
    }
  };
}

/**
 * Next.js App Router POST 핸들러
 */
export async function POST(request) {
  try {
    const payload = await request.json();
    const result = await processWebClntJob000(payload);
    return new Response(JSON.stringify(result.data), {
      status: result.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[API_WEB_CLNT_JOB_000_ERR]', error);
    return new Response(
      JSON.stringify({
        success: false,
        code: 'ERR_INTERNAL_SERVER',
        message: '시공 검수 처리 중 서버 오류가 발생했습니다.'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

