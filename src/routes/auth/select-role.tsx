import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/select-role')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/auth/select-role"!</div>
}
