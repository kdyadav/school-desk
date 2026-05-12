// Thin Vue wrapper around the global FusionCharts CDN constructor.
// Renders a chart into the given element ref, re-renders when the reactive
// `config` changes, and disposes on unmount.
import { onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

let waiterPromise = null

function waitForFusionCharts() {
  if (typeof window !== 'undefined' && window.FusionCharts) return Promise.resolve(window.FusionCharts)
  if (waiterPromise) return waiterPromise
  waiterPromise = new Promise((resolve, reject) => {
    let waited = 0
    const t = setInterval(() => {
      if (typeof window !== 'undefined' && window.FusionCharts) {
        clearInterval(t)
        resolve(window.FusionCharts)
      } else if ((waited += 100) > 5000) {
        clearInterval(t)
        reject(new Error('FusionCharts not loaded'))
      }
    }, 100)
  })
  return waiterPromise
}

/**
 * @param {object} opts
 * @param {import('vue').Ref<HTMLElement|null>} opts.el  Container element ref.
 * @param {string} opts.type      FusionCharts type, e.g. 'column2d'.
 * @param {() => object} opts.config   Reactive builder returning { chart, data }.
 * @param {number|(() => number)} [opts.height=260]  Chart height in px.
 * @param {string|(() => string)} [opts.width='100%']  Chart width.
 * @param {() => boolean} [opts.enabled]  Gate; when false, chart is disposed.
 */
export function useFusionChart(opts) {
  const { el, type, config } = opts
  const getHeight = typeof opts.height === 'function' ? opts.height : () => opts.height ?? 260
  const getWidth = typeof opts.width === 'function' ? opts.width : () => opts.width ?? '100%'
  const isEnabled = opts.enabled ?? (() => true)

  let chart = null

  async function sync() {
    if (!isEnabled()) {
      if (chart) { try { chart.dispose() } catch { /* ignore */ } chart = null }
      return
    }
    let FC
    try { FC = await waitForFusionCharts() } catch { return }
    await nextTick()
    if (!el.value) return

    const dataSource = config()
    if (!chart) {
      chart = new FC({
        type,
        renderAt: el.value,
        width: getWidth(),
        height: String(getHeight()),
        dataFormat: 'json',
        dataSource,
      })
      chart.render()
    } else {
      chart.resizeTo(getWidth(), getHeight())
      chart.setChartData(dataSource, 'json')
    }
  }

  watch(
    () => [config(), getHeight(), getWidth(), isEnabled()],
    () => { sync() },
    { deep: true },
  )

  onMounted(() => { sync() })

  onBeforeUnmount(() => {
    if (chart) { try { chart.dispose() } catch { /* ignore */ } chart = null }
  })

  return {
    refresh: sync,
    dispose: () => {
      if (chart) { try { chart.dispose() } catch { /* ignore */ } chart = null }
    },
  }
}

export default useFusionChart
