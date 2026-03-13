import { prisma } from "@/lib/prisma"

export default async function UsersPage() {

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc"
    }
  })

  return (
    <div>
      <h1>Users</h1>

      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.firstName} {user.lastName} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  )
}