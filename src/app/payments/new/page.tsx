import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { createPayment } from "../actions";

export default async function NewPaymentPage() {
  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
    },
    orderBy: {
      firstName: "asc",
    },
  });

  const charges = await prisma.charge.findMany({
    include: {
      user: true,
      lesson: true,
      allocations: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div>
      <p>
        <Link href="/charges">← Back to charges</Link>
      </p>

      <h1>Create payment</h1>

      <form action={createPayment}>
        <div>
          <label htmlFor="userId">Student</label>
          <select id="userId" name="userId" required>
            <option value="">Select a student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.firstName} {student.lastName} - {student.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="chargeId">Charge</label>
          <select id="chargeId" name="chargeId" required>
            <option value="">Select a charge</option>
            {charges.map((charge) => (
              <option key={charge.id} value={charge.id}>
                {charge.title} - {charge.user.firstName} {charge.user.lastName} -{" "}
                {charge.amount.toString()} {charge.currency}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="amount">Amount</label>
          <input id="amount" name="amount" type="number" step="0.01" min="0" required />
        </div>

        <div>
          <label htmlFor="currency">Currency</label>
          <input id="currency" name="currency" type="text" defaultValue="CHF" required />
        </div>

        <div>
          <label htmlFor="method">Method</label>
          <select id="method" name="method" defaultValue="TWINT">
            <option value="">No method</option>
            <option value="CASH">Cash</option>
            <option value="TWINT">Twint</option>
            <option value="BANK_TRANSFER">Bank transfer</option>
            <option value="CARD">Card</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue="COMPLETED">
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELED">Canceled</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>

        <div>
          <label htmlFor="note">Note</label>
          <textarea id="note" name="note" />
        </div>

        <div>
          <label htmlFor="paidAt">Paid at</label>
          <input id="paidAt" name="paidAt" type="datetime-local" />
        </div>

        <button type="submit">Create payment</button>
      </form>
    </div>
  );
}