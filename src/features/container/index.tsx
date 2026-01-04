import type { ParentComponent } from 'solid-js'

export const Container: ParentComponent = props => {
  return <div class='flex gap-4'>{props.children}</div>
}
