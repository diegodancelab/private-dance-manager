import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ChargesPage() {
  const charges = await prisma.charge.findMany({
    include: {
      user: true,
      lesson: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div>
      <h1>Charges</h1>

      <p>
        <Link href="/charges/new">Create charge</Link>
      </p>

      {charges.length === 0 ? (
        <p>No charges yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Title</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Lesson</th>
              <th>Created</th>
            </tr>
          </thead>

          <tbody>
            {charges.map((charge) => (
              <tr key={charge.id}>
                <td>
                    <Link href={`/charges/${charge.id}`}>
                        {charge.user.firstName} {charge.user.lastName}
                    </Link>
                </td>

                <td>{charge.title}</td>

                <td>
                {charge.amount.toString()} {charge.currency}
                </td>

                <td>{charge.status}</td>

                <td>
                {charge.lesson ? charge.lesson.title : "—"}
                </td>

                <td>{charge.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}