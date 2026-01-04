import { Effect, pipe } from 'effect'
import { createMemo, For, Show } from 'solid-js'
import { commands, store } from '../../store'
import type { ID, Model, ModelEvent } from '../../types'

export function History() {
  const filteredEvents = createMemo(() => {
    const selectedId = store.selectedModelId()
    const allEvents = store.events()

    if (selectedId === null) {
      return allEvents.sort((a, b) => b.timestamp - a.timestamp)
    }

    return allEvents
      .filter(event => event.modelId === selectedId)
      .sort((a, b) => b.timestamp - a.timestamp)
  })

  const getEventDescription = (event: ModelEvent): string => {
    switch (event.type) {
      case 'created':
        return '新規作成'
      case 'updated': {
        const data = event.data as { from: Model; to: Model }
        const changes: string[] = []

        if (data.from.x !== data.to.x) {
          changes.push(`x: ${data.from.x} → ${data.to.x}`)
        }
        if (data.from.y !== data.to.y) {
          changes.push(`y: ${data.from.y} → ${data.to.y}`)
        }
        if (
          data.from.color.r !== data.to.color.r ||
          data.from.color.g !== data.to.color.g ||
          data.from.color.b !== data.to.color.b
        ) {
          changes.push(
            `色: rgb(${data.from.color.r}, ${data.from.color.g}, ${data.from.color.b}) → rgb(${data.to.color.r}, ${data.to.color.g}, ${data.to.color.b})`
          )
        }

        return `更新 (${changes.join(', ')})`
      }
      case 'deleted':
        return '削除'
      case 'restored':
        return '復元'
      case 'rolledback': {
        const data = event.data as { targetEventId: string; modelData: Model }
        return `ロールバック (イベント ${data.targetEventId} へ)`
      }
      case 'rolledforward': {
        const data = event.data as { targetEventId: string; modelData: Model }
        return `ロールフォワード (イベント ${data.targetEventId} へ)`
      }
      default:
        return '不明な操作'
    }
  }

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('ja-JP')
  }

  const handleRollback = (eventId: string, modelId: ID) => {
    pipe(
      commands.rollback({ id: modelId, targetEventId: eventId }),
      Effect.runSync
    )
  }

  const handleRollforward = (eventId: string, modelId: ID) => {
    pipe(
      commands.rollforward({ id: modelId, targetEventId: eventId }),
      Effect.runSync
    )
  }

  const canRollback = (event: ModelEvent): boolean => {
    return event.type === 'created' || event.type === 'updated'
  }

  const canRollforward = (event: ModelEvent): boolean => {
    return event.type === 'created' || event.type === 'updated'
  }

  const getAllModels = createMemo(() => {
    const allEvents = store.events()
    const allModelIds = new Set<ID>()

    for (const event of allEvents) {
      allModelIds.add(event.modelId)
    }

    return Array.from(allModelIds)
  })

  return (
    <div class='rounded-lg border-2 border-gray-300 p-4'>
      <div class='mb-4'>
        <h2 class='mb-2 font-bold text-xl'>History</h2>

        <div>
          <label for='model-select' class='mb-1 block font-medium text-sm'>
            モデル選択:
          </label>
          <select
            id='model-select'
            value={store.selectedModelId() ?? ''}
            onChange={e => {
              const value = e.currentTarget.value
              store.setSelectedModelId(value === '' ? null : Number(value))
            }}
            class='rounded-md border border-gray-300 px-3 py-2'
          >
            <option value=''>すべて</option>
            <For each={getAllModels()}>
              {modelId => <option value={modelId}>Model {modelId}</option>}
            </For>
          </select>
        </div>
      </div>

      <div class='max-h-96 space-y-2 overflow-y-auto'>
        <For each={filteredEvents()}>
          {event => (
            <div class='rounded-lg border border-gray-200 bg-white p-3'>
              <div class='mb-2 flex items-start justify-between'>
                <div>
                  <div class='font-medium text-sm'>
                    Model {event.modelId}: {getEventDescription(event)}
                  </div>
                  <div class='text-gray-500 text-xs'>
                    {formatTimestamp(event.timestamp)}
                  </div>
                </div>
                <div class='font-mono text-gray-400 text-xs'>#{event.id}</div>
              </div>

              <Show when={canRollback(event) || canRollforward(event)}>
                <div class='mt-2 flex gap-2'>
                  <Show when={canRollback(event)}>
                    <button
                      type='button'
                      onClick={() => handleRollback(event.id, event.modelId)}
                      class='rounded bg-yellow-500 px-2 py-1 text-white text-xs hover:bg-yellow-600'
                    >
                      この時点にロールバック
                    </button>
                  </Show>
                  <Show when={canRollforward(event)}>
                    <button
                      type='button'
                      onClick={() => handleRollforward(event.id, event.modelId)}
                      class='rounded bg-green-500 px-2 py-1 text-white text-xs hover:bg-green-600'
                    >
                      この時点にロールフォワード
                    </button>
                  </Show>
                </div>
              </Show>
            </div>
          )}
        </For>

        <Show when={filteredEvents().length === 0}>
          <div class='py-8 text-center text-gray-500'>履歴がありません</div>
        </Show>
      </div>
    </div>
  )
}
