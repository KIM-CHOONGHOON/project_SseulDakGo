/*
 * Backend implementation for Frontend ID WEB‑CLNT‑MYP‑010101 (회원탈회 모달)
 * Provides two endpoints:
 *   GET  /api/web/client/leave/status/:userNo   – returns scenario & active jobs
 *   POST /api/web/client/leave                – processes final withdrawal
 *
 * This file is written for a Node.js + Express environment (ESM modules).
 * It assumes a Sequelize‑style ORM with models: User, CleaningJob, CommonCode.
 * Adjust import paths according to your project layout.
 */

import express from 'express';
import { User, CleaningJob, CommonCode, sequelize } from '../../models/index.js'; // adjust path if needed

const router = express.Router();

/** Helper to fetch common code value */
async function getStatusCode(value) {
  const row = await CommonCode.findOne({
    where: { category: 'USER_STATUS', value },
  });
  if (!row) throw new Error(`Common code for ${value} not found`);
  return row.code;
}

/** ---------------------------------------------------------------
 *  GET /api/web/client/leave/status/:userNo
 * --------------------------------------------------------------- */
router.get('/status/:userNo', async (req, res) => {
  const { userNo } = req.params;
  try {
    const user = await User.findOne({ where: { user_id: userNo } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const activeJobs = await CleaningJob.findAll({
      where: { user_id: userNo, status: 'ACTIVE' },
      attributes: ['job_id', 'name', 'type'],
    });

    const scenario = activeJobs.length ? 'blocked' : 'cleared';
    const description =
      scenario === 'blocked'
        ? '회원 탈회가 차단된 경우, 진행 중인 청소 용역이 모두 종료된 후에만 탈회가 가능합니다.'
        : '모든 청소 용역이 종료된 상태이므로 바로 탈회가 가능합니다.';

    res.json({
      scenario,
      description,
      activeJobs: activeJobs.map((j) => ({ id: j.job_id, name: j.name, type: j.type })),
      user: {
        userNo: user.user_id,
        name: user.name,
        points: user.points,
        coupons: user.coupons,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/** ---------------------------------------------------------------
 *  POST /api/web/client/leave
 * --------------------------------------------------------------- */
router.post('/', async (req, res) => {
  const {
    userNo,
    reasonCode,
    confirmedAt,
    agreeTerms,
    pointsForfeited,
    couponsRevokedCount,
  } = req.body;

  // ---- Basic validation ----
  if (!agreeTerms) {
    return res.status(400).json({ error: 'Terms must be agreed' });
  }

  const t = await sequelize.transaction();
  try {
    // Find user
    const user = await User.findOne({ where: { user_id: userNo }, transaction: t, lock: true });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ error: 'User not found' });
    }

    // Ensure user is in ACTIVE state
    const activeStatus = await getStatusCode('ACTIVE');
    if (user.status_code !== activeStatus) {
      await t.rollback();
      return res.status(422).json({ error: 'User not in ACTIVE state' });
    }

    // Check for active jobs
    const activeJobs = await CleaningJob.findAll({
      where: { user_id: userNo, status: 'ACTIVE' },
      transaction: t,
    });
    if (activeJobs.length) {
      await t.rollback();
      return res.status(409).json({
        error: 'Active cleaning jobs prevent withdrawal',
        jobs: activeJobs.map((j) => ({ id: j.job_id, name: j.name })),
      });
    }

    // Update user status to WITHDRAWN (final state)
    const withdrawnCode = await getStatusCode('WITHDRAWN');
    await user.update(
      {
        USER_STAT_CD: withdrawnCode,
        points: 0,
        coupons: 0,
        email: null,
        phone: null,
        withdraw_reason: reasonCode,
        withdraw_at: confirmedAt,
      },
      { transaction: t }
    );

    // Optional audit insert (if your schema has it)
    // await WithdrawalHistory.create({ user_no: userNo, payload: req.body }, { transaction: t });

    await t.commit();

    res.json({
      message: '회원 탈퇴가 완료되었습니다.',
      userNo,
      newStatus: 'WITHDRAWN',
    });
  } catch (err) {
    console.error(err);
    await t.rollback();
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
});

export default router;
