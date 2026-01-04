import { Container } from '../features/container'
import { Create } from '../features/create'
import { History } from '../features/history'
import { List } from '../features/list'

export function App() {
  return (
    <main class='min-h-screen bg-gray-50 p-4'>
      <div class='mx-auto max-w-7xl space-y-6'>
        <h1 class='mb-8 text-center font-bold text-3xl text-gray-900'>
          CQRS + Event Sourcing Demo
        </h1>

        <Create />

        <Container>
          <div class='flex-1'>
            <List />
          </div>
          <div class='flex-1'>
            <History />
          </div>
        </Container>
      </div>
    </main>
  )
}
