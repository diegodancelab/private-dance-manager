# Production fixes backlog

Issues identified by code review of all server actions.
Not yet implemented — to be fixed before production.

---

## 🔴 Critical — data corruption possible

### 1. `createPackage` — non-atomic write
**File:** `src/app/packages/actions.ts`

`package.create` and `charge.create` are two separate DB calls. If the second fails, an orphaned package exists with no charge and no way to recover it.

**Fix:** wrap both in `prisma.$transaction`.

---

### 2. `assignPackageToParticipant` — race condition on `remainingMinutes`
**File:** `src/app/lessons/actions.ts`

`remainingMinutes` is read outside the transaction, then written inside. Two concurrent requests on the same package both read the same value — the package is deducted only once instead of twice.

**Fix:** use Prisma atomic operation inside the transaction:
```ts
remainingMinutes: { decrement: minutesConsumed }
```

---

### 3. `removePackageFromParticipant` — `minutesConsumed` read from form input
**File:** `src/app/lessons/actions.ts`

```ts
const minutesConsumed = Number(formData.get("minutesConsumed") || 0);
```
This is a hidden `<input>`. Anyone can tamper it via devtools or curl to restore more minutes than were ever consumed.

**Fix:** read `minutesConsumed` from the database via `packageUsage.minutesConsumed`, ignore the form field entirely.

---

### 4. `createPayment` allocation — three non-atomic writes
**File:** `src/app/payments/actions.ts`

`payment.create` → `paymentAllocation.create` → `charge.update` are three separate calls. If step 2 or 3 fails, the payment exists but the charge status is stale (shows unpaid even though money was recorded).

**Fix:** wrap all three in `prisma.$transaction`.

---

## 🟡 Medium — unhandled errors / logic gaps

### 5. `addLessonParticipant` — missing checks
**File:** `src/app/lessons/actions.ts`

- No `role: STUDENT` filter — any userId (teacher, admin) can be added as a participant.
- If `lessonId` is invalid, Prisma throws a foreign key error that surfaces as an unhandled 500.
- Adding the same student twice hits `@@unique([lessonId, userId])` and throws an unhandled Prisma P2002 error.

**Fix:**
- Verify `userId` has role `STUDENT` before inserting.
- Verify `lessonId` exists before inserting.
- Catch P2002 and return a friendly error.

---

### 6. `removeLessonParticipant` — no ownership validation
**File:** `src/app/lessons/actions.ts`

```ts
await prisma.lessonParticipant.delete({ where: { id: participantId } })
```
`participantId` is never validated against `lessonId`. A crafted request with a valid `participantId` from a different lesson would silently delete it.

**Fix:** query the participant first and verify `participant.lessonId === lessonId` before deleting.

---

### 7. `assignPackageToParticipant` — no status or ownership check
**File:** `src/app/lessons/actions.ts`

- No check that `pkg.status === ACTIVE`. An EXHAUSTED or EXPIRED package can still be assigned.
- No check that the package belongs to the same student as the participant — a crafted request could assign student A's package to student B's lesson slot.

**Fix:**
- Reject if `pkg.status !== PackageStatus.ACTIVE`.
- Fetch the participant and verify `participant.userId === pkg.userId`.

---

### 8. `updatePackage` — status not updated when hours reduced to 0
**File:** `src/app/packages/actions.ts`

```ts
const newRemainingMinutes = Math.max(existing.remainingMinutes + diff, 0);
// status is never updated
```
If total hours are reduced below what was already consumed, `remainingMinutes` hits 0 but status stays `ACTIVE`.

**Fix:** set `status: PackageStatus.EXHAUSTED` when `newRemainingMinutes === 0`.

---

### 9. `expiresAt` date not validated
**Files:** `src/app/packages/actions.ts` (`createPackage`, `updatePackage`)

```ts
const parsedExpiresAt = expiresAt ? new Date(expiresAt) : null;
```
`new Date("garbage")` produces `Invalid Date`. Prisma throws a DB-level error instead of a clean validation message.

**Fix:** validate before parsing:
```ts
if (expiresAt && isNaN(new Date(expiresAt).getTime())) {
  state.errors.expiresAt = "Expiry date is invalid.";
}
```

---

## 🟢 Low — minor issues

### 10. `createPayment` — `chargeId` not validated to belong to the same student
**File:** `src/app/payments/actions.ts`

A user could pass any `chargeId` from any student and allocate the payment to it.

**Fix:** after fetching the charge, verify `charge.userId === userId`.

---

### 11. `removePackageFromParticipant` — status forced to `ACTIVE` unconditionally
**File:** `src/app/lessons/actions.ts`

If the package was `CANCELED` or `EXPIRED`, removing a usage silently resets it to `ACTIVE`.

**Fix:** only set `ACTIVE` if the previous status was `EXHAUSTED`.

---

### 12. Dead code in `packages/actions.ts`
**File:** `src/app/packages/actions.ts`

`toDateInputValue` is defined but never called in the file.

**Fix:** remove the function.
