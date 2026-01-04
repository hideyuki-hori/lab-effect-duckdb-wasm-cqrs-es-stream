import { Effect, pipe } from 'effect'
import { createSignal } from 'solid-js'
import { commands } from '../../store'
import type { Color } from '../../types'

export function Create() {
  const [x, setX] = createSignal(0)
  const [y, setY] = createSignal(0)
  const [r, setR] = createSignal(255)
  const [g, setG] = createSignal(255)
  const [b, setB] = createSignal(255)

  const handleCreate = () => {
    const color: Color = { r: r(), g: g(), b: b() }

    pipe(commands.create({ x: x(), y: y(), color }), Effect.runSync)
  }

  return (
    <div class='rounded-lg border-2 border-gray-300 p-4'>
      <h2 class='mb-4 font-bold text-xl'>Create Model</h2>

      <div class='mb-4 grid grid-cols-2 gap-4'>
        <div>
          <label for='x-input' class='mb-1 block font-medium text-sm'>
            X座標:
          </label>
          <input
            id='x-input'
            type='number'
            value={x()}
            onInput={e => setX(Number(e.currentTarget.value))}
            class='w-full rounded-md border border-gray-300 px-3 py-2'
          />
        </div>

        <div>
          <label for='y-input' class='mb-1 block font-medium text-sm'>
            Y座標:
          </label>
          <input
            id='y-input'
            type='number'
            value={y()}
            onInput={e => setY(Number(e.currentTarget.value))}
            class='w-full rounded-md border border-gray-300 px-3 py-2'
          />
        </div>
      </div>

      <div class='mb-4'>
        <div class='mb-2 block font-medium text-sm'>色:</div>
        <div class='grid grid-cols-3 gap-2'>
          <div>
            <label for='r-input' class='mb-1 block text-gray-600 text-xs'>
              Red (0-255):
            </label>
            <input
              id='r-input'
              type='number'
              min='0'
              max='255'
              value={r()}
              onInput={e =>
                setR(Math.max(0, Math.min(255, Number(e.currentTarget.value))))
              }
              class='w-full rounded border border-gray-300 px-2 py-1 text-sm'
            />
          </div>

          <div>
            <label for='g-input' class='mb-1 block text-gray-600 text-xs'>
              Green (0-255):
            </label>
            <input
              id='g-input'
              type='number'
              min='0'
              max='255'
              value={g()}
              onInput={e =>
                setG(Math.max(0, Math.min(255, Number(e.currentTarget.value))))
              }
              class='w-full rounded border border-gray-300 px-2 py-1 text-sm'
            />
          </div>

          <div>
            <label for='b-input' class='mb-1 block text-gray-600 text-xs'>
              Blue (0-255):
            </label>
            <input
              id='b-input'
              type='number'
              min='0'
              max='255'
              value={b()}
              onInput={e =>
                setB(Math.max(0, Math.min(255, Number(e.currentTarget.value))))
              }
              class='w-full rounded border border-gray-300 px-2 py-1 text-sm'
            />
          </div>
        </div>

        <div
          class='mt-2 h-8 w-full rounded border border-gray-300'
          style={{
            'background-color': `rgb(${r()}, ${g()}, ${b()})`,
          }}
        ></div>
      </div>

      <button
        type='button'
        onClick={handleCreate}
        class='w-full rounded-md bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600'
      >
        作成
      </button>
    </div>
  )
}
