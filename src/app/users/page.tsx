import { prisma } from "@/lib/prisma"
import Link from "next/link";

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
            <Link href={`/users/${user.id}`}>
              {user.firstName} {user.lastName} - {user.email}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}