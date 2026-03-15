import Link from "next/link";
import { prisma } from "@/lib/prisma";

function formatAmount(amount: string | number, currency: string) {
  return `${amount} ${currency}`;
}

function formatDateTime(date: Date | null) {
  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat("fr-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default async function PaymentsPage() {
  const payments = await prisma.payment.findMany({
    orderBy: [
      { paidAt: "desc" },
      { createdAt: "desc" },
    ],
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Payments</h1>
          <p style={{ margin: "0.35rem 0 0", color: "#6b7280" }}>
            Track received money from your students.
          </p>
        </div>

        <Link href="/payments/new">Create payment</Link>
      </div>

      {payments.length === 0 ? (
        <div>
          <p>No payments yet.</p>
          <p>Create your first payment to start tracking received money.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "760px",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: "left",
                    padding: "0.75rem",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Student
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "0.75rem",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Amount
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "0.75rem",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Method
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "0.75rem",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "0.75rem",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Paid at
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "0.75rem",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td
                    style={{
                      padding: "0.75rem",
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    {payment.user.firstName} {payment.user.lastName}
                  </td>

                  <td
                    style={{
                      padding: "0.75rem",
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    {formatAmount(String(payment.amount), payment.currency)}
                  </td>

                  <td
                    style={{
                      padding: "0.75rem",
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    {payment.method ?? "-"}
                  </td>

                  <td
                    style={{
                      padding: "0.75rem",
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    {payment.status}
                  </td>

                  <td
                    style={{
                      padding: "0.75rem",
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    {formatDateTime(payment.paidAt)}
                  </td>

                  <td
                    style={{
                      padding: "0.75rem",
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                      <Link href={`/payments/${payment.id}`}>View</Link>
                      <Link href={`/payments/${payment.id}/edit`}>Edit</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}