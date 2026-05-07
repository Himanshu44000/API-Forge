import { Router } from 'express'
import { getOverviewHandler, getMockTimeseriesHandler } from '../controllers/analyticsController.js'

const router = Router()

router.get('/overview', getOverviewHandler)
router.get('/mocks/:id/timeseries', getMockTimeseriesHandler)

export default router
