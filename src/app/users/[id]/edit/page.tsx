import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateUser } from "../../actions";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditUserPage({ params }: Props) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div>
      <h1>Edit user</h1>

      <form action={updateUser}>
        <input type="hidden" name="id" value={user.id} />

        <div>
          <label htmlFor="firstName">First name</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            defaultValue={user.firstName}
            required
          />
        </div>

        <div>
          <label htmlFor="lastName">Last name</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            defaultValue={user.lastName}
            required
          />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={user.email}
            required
          />
        </div>

        <div>
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            type="text"
            defaultValue={user.phone ?? ""}
          />
        </div>

        <div>
          <label htmlFor="role">Role</label>
          <select id="role" name="role" defaultValue={user.role}>
            <option value="STUDENT">Student</option>
            <option value="TEACHER">Teacher</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <button type="submit">Update user</button>
      </form>
    </div>
  );
}