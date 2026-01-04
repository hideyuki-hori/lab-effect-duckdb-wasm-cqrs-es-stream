import { Effect, pipe } from 'effect'
import { createSignal } from 'solid-js'
import type {
  Color,
  CreateModelCommand,
  DeleteModelCommand,
  ID,
  Model,
  ModelEvent,
  RestoreModelCommand,
  RollbackCommand,
  RollforwardCommand,
  UpdateModelCommand,
} from './types'

let nextId = 1
let nextEventId = 1

const [models, setModels] = createSignal<Map<ID, Model>>(new Map())
const [events, setEvents] = createSignal<ModelEvent[]>([])
const [selectedModelId, setSelectedModelId] = createSignal<ID | null>(null)

export const store = {
  models,
  events,
  selectedModelId,
  setSelectedModelId,
}

const createEvent = (
  modelId: ID,
  type: ModelEvent['type'],
  data: unknown,
  previousEventId?: string
): ModelEvent => ({
  id: (nextEventId++).toString(),
  modelId,
  type,
  timestamp: Date.now(),
  data,
  previousEventId,
})

const validateColor = (color: Color): Effect.Effect<Color, string> =>
  pipe(
    Effect.succeed(color),
    Effect.flatMap(c =>
      c.r >= 0 && c.r <= 255 && c.g >= 0 && c.g <= 255 && c.b >= 0 && c.b <= 255
        ? Effect.succeed(c)
        : Effect.fail('Color channels must be between 0 and 255')
    )
  )

export const commands = {
  create: (command: CreateModelCommand): Effect.Effect<Model, string> =>
    pipe(
      validateColor(command.color),
      Effect.map(color => {
        const id = nextId++
        const model: Model = { id, x: command.x, y: command.y, color }
        const event = createEvent(id, 'created', model)

        setEvents(prev => [...prev, event])
        setModels(prev => new Map(prev).set(id, model))

        return model
      })
    ),

  update: (command: UpdateModelCommand): Effect.Effect<Model, string> =>
    pipe(
      Effect.fromNullable(models().get(command.id)),
      Effect.mapError(() => `Model with id ${command.id} not found`),
      Effect.flatMap(currentModel => {
        const updatedModel: Model = {
          ...currentModel,
          ...(command.x !== undefined && { x: command.x }),
          ...(command.y !== undefined && { y: command.y }),
          ...(command.color !== undefined && { color: command.color }),
        }

        if (command.color !== undefined) {
          return pipe(
            validateColor(command.color),
            Effect.map(color => {
              const finalModel = { ...updatedModel, color }
              const event = createEvent(command.id, 'updated', {
                from: currentModel,
                to: finalModel,
              })

              setEvents(prev => [...prev, event])
              setModels(prev => new Map(prev).set(command.id, finalModel))

              return finalModel
            })
          )
        } else {
          const event = createEvent(command.id, 'updated', {
            from: currentModel,
            to: updatedModel,
          })

          setEvents(prev => [...prev, event])
          setModels(prev => new Map(prev).set(command.id, updatedModel))

          return Effect.succeed(updatedModel)
        }
      })
    ),

  delete: (command: DeleteModelCommand): Effect.Effect<void, string> =>
    pipe(
      Effect.fromNullable(models().get(command.id)),
      Effect.mapError(() => `Model with id ${command.id} not found`),
      Effect.map(model => {
        const event = createEvent(command.id, 'deleted', model)

        setEvents(prev => [...prev, event])
        setModels(prev => {
          const newMap = new Map(prev)
          newMap.delete(command.id)
          return newMap
        })

        return undefined
      })
    ),

  restore: (command: RestoreModelCommand): Effect.Effect<Model, string> => {
    const modelEvents = events().filter(e => e.modelId === command.id)
    const lastDeleteEvent = [...modelEvents]
      .reverse()
      .find(e => e.type === 'deleted')

    return pipe(
      Effect.fromNullable(lastDeleteEvent),
      Effect.mapError(() => `No deleted model found with id ${command.id}`),
      Effect.map(deleteEvent => {
        const modelData = deleteEvent.data as Model
        const event = createEvent(command.id, 'restored', modelData)

        setEvents(prev => [...prev, event])
        setModels(prev => new Map(prev).set(command.id, modelData))

        return modelData
      })
    )
  },

  rollback: (command: RollbackCommand): Effect.Effect<Model, string> => {
    const targetEvent = events().find(e => e.id === command.targetEventId)

    return pipe(
      Effect.fromNullable(targetEvent),
      Effect.mapError(() => `Event with id ${command.targetEventId} not found`),
      Effect.flatMap(event => {
        if (event.modelId !== command.id) {
          return Effect.fail('Event does not belong to the specified model')
        }

        let modelData: Model
        if (event.type === 'created') {
          modelData = event.data as Model
        } else if (event.type === 'updated') {
          modelData = (event.data as { from: Model; to: Model }).to
        } else {
          return Effect.fail('Cannot rollback to delete event')
        }

        const rollbackEvent = createEvent(command.id, 'rolledback', {
          targetEventId: command.targetEventId,
          modelData,
        })

        setEvents(prev => [...prev, rollbackEvent])
        setModels(prev => new Map(prev).set(command.id, modelData))

        return Effect.succeed(modelData)
      })
    )
  },

  rollforward: (command: RollforwardCommand): Effect.Effect<Model, string> => {
    const targetEvent = events().find(e => e.id === command.targetEventId)

    return pipe(
      Effect.fromNullable(targetEvent),
      Effect.mapError(() => `Event with id ${command.targetEventId} not found`),
      Effect.flatMap(event => {
        if (event.modelId !== command.id) {
          return Effect.fail('Event does not belong to the specified model')
        }

        let modelData: Model
        if (event.type === 'created') {
          modelData = event.data as Model
        } else if (event.type === 'updated') {
          modelData = (event.data as { from: Model; to: Model }).to
        } else {
          return Effect.fail('Cannot rollforward to delete event')
        }

        const rollforwardEvent = createEvent(command.id, 'rolledforward', {
          targetEventId: command.targetEventId,
          modelData,
        })

        setEvents(prev => [...prev, rollforwardEvent])
        setModels(prev => new Map(prev).set(command.id, modelData))

        return Effect.succeed(modelData)
      })
    )
  },
}
