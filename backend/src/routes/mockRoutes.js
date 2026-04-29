import { Router } from 'express'
import {
  createMockApiHandler,
  deleteMockApiHandler,
  duplicateMockApiHandler,
  getMockApiHandler,
  getMockApisHandler,
  revokeMockApiShareHandler,
  shareMockApiHandler,
  toggleMockApiHandler,
  updateMockApiHandler,
  getWebhookCallsHandler,
  clearWebhookCallsHandler,
  exportMocksHandler,
  importMocksHandler,
  getCallLogsHandler,
  clearCallLogsHandler,
} from '../controllers/mockController.js'
import { validateMockApiPayload } from '../middleware/validation.js'

const router = Router()

router.get('/', getMockApisHandler)
router.get('/export', exportMocksHandler)
router.post('/import', importMocksHandler)
router.post('/', validateMockApiPayload(), createMockApiHandler)
router.get('/:id', getMockApiHandler)
router.put('/:id', validateMockApiPayload({ partial: true }), updateMockApiHandler)
router.delete('/:id', deleteMockApiHandler)
router.post('/:id/duplicate', duplicateMockApiHandler)
router.patch('/:id/toggle', toggleMockApiHandler)
router.post('/:id/share', shareMockApiHandler)
router.delete('/:id/share', revokeMockApiShareHandler)
router.get('/:id/webhook-calls', getWebhookCallsHandler)
router.delete('/:id/webhook-calls', clearWebhookCallsHandler)
router.get('/:id/call-logs', getCallLogsHandler)
router.delete('/:id/call-logs', clearCallLogsHandler)

export default router
