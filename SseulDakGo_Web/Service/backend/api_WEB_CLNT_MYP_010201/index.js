/*
 * Backend implementation for Frontend ID WEB‑CLNT‑MYP‑010102 (회원탈회 확인 모달)
 * Provides a single endpoint:
 *   POST /api/web/client/leave/confirm
 * which records the user's final consent, switches the status to
 * WITHDRAW_PENDING and returns the request payload (used by the
 * "API Payload" toggle in the modal).
 *
 * Assumes a Node.js + Express environment (ESM) and a Sequelize ORM
 * with models: User, CommonCode, WithdrawalQueue (optional) and a
 * `sequelize` instance for transactions.
 */

import express from 'express';
import { User, CommonCode, WithdrawalQueue, sequelize } from '../../models/index.js'; // adjust path if needed

const router = express.Router();

/** Utility: fetch a status code from the common_code table */
async function getStatusCode(value) {
  const row = await CommonCode.findOne({
    where: { category: 'USER_STATUS', value },
  });
  if (!row) throw new Error(`Common code for status '${value}' not found`);
  return row.code;
}

/** ---------------------------------------------------------------
 *  POST /api/web/client/leave/confirm
 * --------------------------------------------------------------- */
router.post('/confirm', async (req, res) => {
  const {
    userNo,
    clientName,
    reasonCode,
    confirmedAt,
    agreeTerms,
    pointsForfeited,
    couponsRevokedCount,
  } = req.body;

  // ---- Basic validation ------------------------------------------------
  if (agreeTerms !== true) {
    return res.status(400).json({ error: 'Terms must be agreed' });
  }

  const transaction = await sequelize.transaction();
  try {
    // Find the user and lock the row for update
    const user = await User.findOne({
      where: { user_id: userNo },
      transaction,
      lock: true,
    });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ error: 'User not found' });
    }

    // Ensure the user is currently ACTIVE
    const activeCode = await getStatusCode('ACTIVE');
    if (user.status_code !== activeCode) {
      await transaction.rollback();
      return res.status(422).json({ error: 'User not in ACTIVE state' });
    }

    // Switch status to WITHDRAW_PENDING
    const pendingCode = await getStatusCode('WITHDRAW_PENDING');
    await user.update({ status_code: pendingCode }, { transaction });

    // Optional: enqueue request for background clean‑up worker
    if (WithdrawalQueue) {
      await WithdrawalQueue.create(
        {
          user_no: userNo,
          payload: req.body,
          status: 'PENDING',
        },
        { transaction }
      );
    }

    await transaction.commit();

    // Echo the request payload exactly as the front‑end expects
    return res.json({
      userNo,
      clientName,
      reasonCode,
      confirmedAt,
      agreeTerms,
      pointsForfeited,
      couponsRevokedCount,
    });
  } catch (err) {
    console.error('Withdrawal confirm error:', err);
    await transaction.rollback();
    return res.status(500).json({ error: 'Failed to process withdrawal confirmation' });
  }
});

export default router;
