import * as analyticsService from '../services/analyticsService.js'

export const getOverviewHandler = async (req, res, next) => {
  try {
    const data = await analyticsService.getOverview()
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export const getMockTimeseriesHandler = async (req, res, next) => {
  try {
    const { id } = req.params
    const { from, to } = req.query
    const data = await analyticsService.getMockTimeseries(id, from, to)
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export default {
  getOverviewHandler,
  getMockTimeseriesHandler,
}
