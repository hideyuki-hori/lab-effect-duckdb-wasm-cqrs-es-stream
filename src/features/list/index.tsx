import { Effect, pipe } from 'effect'
import { createEffect, createSignal, For } from 'solid-js'
import { commands, store } from '../../store'
import type { Color, ID, Model } from '../../types'

export function List() {
  const [deletedModels, setDeletedModels] = createSignal<Set<ID>>(new Set())

  createEffect(() => {
    const events = store.events()
    const deleted = new Set<ID>()
    const restored = new Set<ID>()

    for (const event of events) {
      if (event.type === 'deleted') {
        deleted.add(event.modelId)
      } else if (event.type === 'restored') {
        restored.add(event.modelId)
      }
    }

    for (const restoredId of restored) {
      deleted.delete(restoredId)
    }

    setDeletedModels(deleted)
  })

  const handleUpdate = (
    id: ID,
    field: keyof Omit<Model, 'id'>,
    value: number | Color
  ) => {
    let command: Parameters<typeof commands.update>[0]

    if (field === 'color') {
      command = { id, color: value as Color }
    } else {
      command = { id, [field]: value as number }
    }

    pipe(commands.update(command), Effect.runSync)
  }

  const handleDelete = (id: ID) => {
    pipe(commands.delete({ id }), Effect.runSync)
  }

  const handleRestore = (id: ID) => {
    pipe(commands.restore({ id }), Effect.runSync)
  }

  const handleShowHistory = (id: ID) => {
    store.setSelectedModelId(id)
  }

  return (
    <div class='rounded-lg border-2 border-gray-300 p-4'>
      <h2 class='mb-4 font-bold text-xl'>Model List</h2>

      <div class='overflow-x-auto'>
        <table class='w-full border-collapse border border-gray-300'>
          <thead>
            <tr class='bg-gray-50'>
              <th class='border border-gray-300 px-2 py-2 font-medium text-sm'>
                ID
              </th>
              <th class='border border-gray-300 px-2 py-2 font-medium text-sm'>
                X
              </th>
              <th class='border border-gray-300 px-2 py-2 font-medium text-sm'>
                Y
              </th>
              <th class='border border-gray-300 px-2 py-2 font-medium text-sm'>
                Color
              </th>
              <th class='border border-gray-300 px-2 py-2 font-medium text-sm'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <For each={Array.from(store.models().values())}>
              {model => {
                const isDeleted = deletedModels().has(model.id)

                return (
                  <tr class={isDeleted ? 'bg-gray-100 text-gray-500' : ''}>
                    <td class='border border-gray-300 px-2 py-2 text-center text-sm'>
                      {model.id}
                    </td>
                    <td class='border border-gray-300 px-2 py-2'>
                      <input
                        type='number'
                        value={model.x}
                        disabled={isDeleted}
                        onInput={e =>
                          handleUpdate(
                            model.id,
                            'x',
                            Number(e.currentTarget.value)
                          )
                        }
                        class='w-full rounded border border-gray-200 px-1 py-1 text-sm disabled:bg-gray-100'
                      />
                    </td>
                    <td class='border border-gray-300 px-2 py-2'>
                      <input
                        type='number'
                        value={model.y}
                        disabled={isDeleted}
                        onInput={e =>
                          handleUpdate(
                            model.id,
                            'y',
                            Number(e.currentTarget.value)
                          )
                        }
                        class='w-full rounded border border-gray-200 px-1 py-1 text-sm disabled:bg-gray-100'
                      />
                    </td>
                    <td class='border border-gray-300 px-2 py-2'>
                      <div class='flex items-center gap-2'>
                        <div
                          class='h-6 w-6 rounded border border-gray-300'
                          style={{
                            'background-color': `rgb(${model.color.r}, ${model.color.g}, ${model.color.b})`,
                          }}
                        ></div>
                        <div class='grid flex-1 grid-cols-3 gap-1'>
                          <input
                            type='number'
                            min='0'
                            max='255'
                            value={model.color.r}
                            disabled={isDeleted}
                            onInput={e =>
                              handleUpdate(model.id, 'color', {
                                ...model.color,
                                r: Math.max(
                                  0,
                                  Math.min(255, Number(e.currentTarget.value))
                                ),
                              })
                            }
                            class='w-full rounded border border-gray-200 px-1 text-xs disabled:bg-gray-100'
                          />
                          <input
                            type='number'
                            min='0'
                            max='255'
                            value={model.color.g}
                            disabled={isDeleted}
                            onInput={e =>
                              handleUpdate(model.id, 'color', {
                                ...model.color,
                                g: Math.max(
                                  0,
                                  Math.min(255, Number(e.currentTarget.value))
                                ),
                              })
                            }
                            class='w-full rounded border border-gray-200 px-1 text-xs disabled:bg-gray-100'
                          />
                          <input
                            type='number'
                            min='0'
                            max='255'
                            value={model.color.b}
                            disabled={isDeleted}
                            onInput={e =>
                              handleUpdate(model.id, 'color', {
                                ...model.color,
                                b: Math.max(
                                  0,
                                  Math.min(255, Number(e.currentTarget.value))
                                ),
                              })
                            }
                            class='w-full rounded border border-gray-200 px-1 text-xs disabled:bg-gray-100'
                          />
                        </div>
                      </div>
                    </td>
                    <td class='border border-gray-300 px-2 py-2'>
                      <div class='flex gap-1'>
                        <button
                          type='button'
                          onClick={() => handleShowHistory(model.id)}
                          class='rounded bg-blue-500 px-2 py-1 text-white text-xs hover:bg-blue-600'
                        >
                          履歴
                        </button>
                        {isDeleted ? (
                          <button
                            type='button'
                            onClick={() => handleRestore(model.id)}
                            class='rounded bg-green-500 px-2 py-1 text-white text-xs hover:bg-green-600'
                          >
                            復元
                          </button>
                        ) : (
                          <button
                            type='button'
                            onClick={() => handleDelete(model.id)}
                            class='rounded bg-red-500 px-2 py-1 text-white text-xs hover:bg-red-600'
                          >
                            削除
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              }}
            </For>
          </tbody>
        </table>
      </div>
    </div>
  )
}
