export type ID = number

export type Channel = number

export type Color = {
  r: Channel
  g: Channel
  b: Channel
}

export type Model = {
  id: ID
  x: number
  y: number
  color: Color
}

export type EventType =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'restored'
  | 'rolledback'
  | 'rolledforward'

export type ModelEvent = {
  id: string
  modelId: ID
  type: EventType
  timestamp: number
  data: unknown
  previousEventId?: string
}

export type CreateModelCommand = {
  x: number
  y: number
  color: Color
}

export type UpdateModelCommand = {
  id: ID
  x?: number
  y?: number
  color?: Color
}

export type DeleteModelCommand = {
  id: ID
}

export type RestoreModelCommand = {
  id: ID
}

export type RollbackCommand = {
  id: ID
  targetEventId: string
}

export type RollforwardCommand = {
  id: ID
  targetEventId: string
}
