import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import { useEffect } from 'react'
import { api, serviceUrl } from './api'
import type { EventDeletionRange } from './api'
import type { CameraSettings, DetectionEvent, InvocationDefinition, TriggerDefinition } from './types'
export const keys = { status: ['status'], cameras: ['cameras'], settings: ['settings'], capabilities: ['capabilities'], models: ['models'], people: ['people'], triggers: ['triggers'], invocations: ['invocations'], invocationLogs: ['invocation-logs'], events: ['events'] }
export function useServiceStatus() { return useQuery({ queryKey: keys.status, queryFn: api.status, refetchInterval: 5000 }) }
export function useCameras() { return useQuery({ queryKey: keys.cameras, queryFn: api.cameras, refetchInterval: 5000 }) }
export function useCamera(id?: string) { return useQuery({ queryKey: ['camera', id], queryFn: () => api.camera(id!), enabled: Boolean(id) }) }
export function useSettings() { return useQuery({ queryKey: keys.settings, queryFn: api.settings }) }
export function useCapabilities() { return useQuery({ queryKey: keys.capabilities, queryFn: api.capabilities, staleTime: 60_000 }) }
export function useModels() { return useQuery({ queryKey: keys.models, queryFn: api.models, staleTime: 60_000 }) }
export function useInvocations() { return useQuery({ queryKey: keys.invocations, queryFn: api.invocations }) }
export function useInvocationLogs(invocationId?: string, limit = 200) { return useQuery({ queryKey: [...keys.invocationLogs, invocationId, limit], queryFn: () => api.invocationLogs(invocationId, limit), refetchInterval: 5000 }) }
export function useInvocationMutation() { const client = useQueryClient(); return useMutation({ mutationFn: (input: { value: InvocationDefinition; create: boolean }) => input.create ? api.createInvocation(input.value) : api.updateInvocation(input.value), onSuccess: () => { void client.invalidateQueries({ queryKey: keys.invocations }); void client.invalidateQueries({ queryKey: keys.invocationLogs }) } }) }
export function usePeople() { return useQuery({ queryKey: keys.people, queryFn: api.people }) }
export function usePalmPeople() { return useQuery({ queryKey: ['palm-people'], queryFn: api.palmPeople, staleTime: 30_000 }) }
export function usePalmPeopleSummary() { return useQuery({ queryKey: ['palm-people-summary'], queryFn: api.palmPeopleSummary, staleTime: 30_000 }) }
export function usePersonSamples(id?: string) { return useQuery({ queryKey: ['samples', id], queryFn: () => api.samples(id!), enabled: Boolean(id) }) }
export function usePersonPalmSamples(id?: string) { return useQuery({ queryKey: ['palm-samples', id], queryFn: () => api.palmSamples(id!), enabled: Boolean(id) }) }
export function usePersonPlates(id?: string) { return useQuery({ queryKey: ['person-plates', id], queryFn: () => api.personPlates(id!), enabled: Boolean(id) }) }
export function useEvents(query = '', limit = 200) {
  const client = useQueryClient()
  const queryKey = [...keys.events, query, limit]
  return useQuery({ queryKey, queryFn: async () => {
    // The public dashboard/history views always consume the canonical event
    // stream. Client trigger subscriptions must not hide other cameras from
    // these views.
    const batch = await api.events(query, undefined, limit)
    // REST polling may return an older page while SignalR has already added
    // a newer event to the same cache. Merge both sets so a live card is not
    // removed by the next five-second polling refresh.
    const merged = new Map<string, DetectionEvent>()
    for (const item of client.getQueryData<DetectionEvent[]>(queryKey) ?? []) merged.set(item.eventId, item)
    for (const item of batch) merged.set(item.eventId, item)
    return [...merged.values()].sort((a, b) => b.sequence - a.sequence).slice(0, limit)
  }, refetchInterval: 5000 })
}
export function useEvent(id?: string) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => api.event(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  })
}
export function useDeleteEvents() { const client = useQueryClient(); return useMutation({ mutationFn: (range: EventDeletionRange) => api.deleteEvents(range), onSuccess: () => { void client.invalidateQueries({ queryKey: keys.events }); void client.removeQueries({ queryKey: ['event'] }) } }) }
export function useTriggers() { return useQuery({ queryKey: keys.triggers, queryFn: api.triggers }) }
export function useCameraMutation() { const client = useQueryClient(); return useMutation({ mutationFn: (camera: CameraSettings) => api.saveCamera(camera), onSuccess: (_, camera) => { void client.invalidateQueries({ queryKey: keys.cameras }); void client.invalidateQueries({ queryKey: ['camera', camera.id] }); void client.invalidateQueries({ queryKey: keys.settings }) } }) }
export function useCameraAction() { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, action }: { id: string; action: 'start' | 'stop' | 'restart' }) => api.cameraAction(id, action), onSuccess: () => { void client.invalidateQueries({ queryKey: keys.cameras }); void client.invalidateQueries({ queryKey: keys.status }) } }) }
export function useTriggerMutation() { const client = useQueryClient(); return useMutation({ mutationFn: ({ mode, trigger }: { mode: 'create' | 'update'; trigger: TriggerDefinition }) => mode === 'create' ? api.createTrigger(trigger) : api.updateTrigger(trigger), onSuccess: () => { void client.invalidateQueries({ queryKey: keys.triggers }); void client.invalidateQueries({ queryKey: keys.settings }) } }) }
export function useDetectionStream() {
  const client = useQueryClient()
  useEffectOnce(() => {
    let stopped = false
    const key = 'hsh-detection-last-sequence'
    let last = Number(sessionStorage.getItem(key) ?? '0') || 0
    let pending: DetectionEvent[] = []
    let flushTimer: number | undefined
    const connection = new HubConnectionBuilder().withUrl(serviceUrl('/hubs/detections')).withAutomaticReconnect([0, 2000, 5000, 15000]).configureLogging(LogLevel.Warning).build()
    const flush = () => {
      flushTimer = undefined
      if (stopped || pending.length === 0) return
      const batch = pending
      pending = []
       client.setQueryData<DetectionEvent[]>([...keys.events, '', 200], old => {
        const merged = new Map<string, DetectionEvent>()
        for (const item of old ?? []) merged.set(item.eventId, item)
        for (const item of batch) merged.set(item.eventId, item)
        return [...merged.values()].sort((a, b) => b.sequence - a.sequence).slice(0, 200)
      })
    }
    const apply = (item: DetectionEvent) => {
      last = Math.max(last, item.sequence)
      sessionStorage.setItem(key, String(last))
      pending.push(item)
      if (flushTimer === undefined) flushTimer = window.setTimeout(flush, 50)
    }
    const subscribe = () => connection.invoke('Subscribe', last, { profiles: [] }).catch(() => undefined)
    const resync = async () => {
      try {
        const status = await api.status()
        last = status.eventSequence
        sessionStorage.setItem(key, String(last))
      } catch {
        last = 0
        sessionStorage.setItem(key, '0')
      }
      if (!stopped) await subscribe()
    }
    connection.on('detection', apply)
    connection.on('cursorExpired', () => { void client.invalidateQueries({ queryKey: keys.events }); void resync() })
    connection.on('replayStarted', () => undefined)
    connection.on('replayCompleted', (message: { lastSequence?: number }) => { if (message?.lastSequence) { last = Math.max(last, message.lastSequence); sessionStorage.setItem(key, String(last)) } })
    const connect = async () => {
      try {
        await connection.start()
        if (stopped) return
        // The dashboard already loads a bounded history through REST. On the
        // first connection do not replay the entire event store through
        // SignalR; start the live cursor at the current watermark instead.
        if (last === 0) {
          try {
            const status = await api.status()
            last = status.eventSequence
            sessionStorage.setItem(key, String(last))
          } catch { /* subscribe from zero is the safe fallback */ }
        }
        await subscribe()
      } catch { /* polling remains the safe fallback */ }
    }
    connection.onreconnected(() => { void subscribe() })
    void connect()
    return () => { stopped = true; if (flushTimer !== undefined) window.clearTimeout(flushTimer); pending = []; connection.off('detection', apply); void connection.stop() }
  })
}
function useEffectOnce(effect: () => void | (() => void)) { useEffect(effect, []) }
