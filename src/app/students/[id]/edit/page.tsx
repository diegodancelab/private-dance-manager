import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateStudent } from "../../actions";
import { UserRole } from "@/generated/prisma/client";


type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditUserPage({ params }: Props) {
  const { id } = await params;

  const student = await prisma.user.findFirst({
    where: {
      id,
      role: UserRole.STUDENT,
    },
  });

  if (!student) {
    notFound();
  }

  return (
    <div>
      <h1>Edit student</h1>

      <form action={updateStudent}>
        <input type="hidden" name="id" value={student.id} />

        <div>
          <label htmlFor="firstName">First name</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            defaultValue={student.firstName}
            required
          />
        </div>

        <div>
          <label htmlFor="lastName">Last name</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            defaultValue={student.lastName}
            required
          />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={student.email}
            required
          />
        </div>

        <div>
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            type="text"
            defaultValue={student.phone ?? ""}
          />
        </div>

        <button type="submit">Update student</button>
      </form>
    </div>
  );
}