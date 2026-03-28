# Business Logic Test Scenarios

## Purpose

This document defines business logic scenarios, edge cases, and invariants for the Private Dance Manager application.

It is used to:

* validate correctness of domain logic
* prevent data inconsistencies
* guide manual and automated reviews (including AI agents)
* ensure production readiness

---

# Critical Invariants (MUST ALWAYS HOLD)

These rules must never be violated.

---

## Packages

* remainingMinutes must never be negative
* remainingMinutes must never exceed totalMinutes unless explicitly allowed
* expired packages must not be consumable
* canceled packages must not be usable or reactivated unintentionally

## Charges

* paidAmount must never exceed totalAmount (unless credit logic is explicitly implemented)
* remainingAmount must always equal totalAmount - paidAmount
* a fully paid charge must have status = PAID

## Payments

* payment must always be linked to a valid charge
* deleting a payment must correctly restore charge balance

## Lessons & Package Consumption

* removing a package assignment must restore exactly the consumed minutes
* consumed minutes must reflect actual deduction, not theoretical values
* no operation should create or destroy minutes artificially

## Transactions

* multi-step operations must be atomic (all succeed or all fail)
* no partial writes should leave inconsistent data

---

# Calendar-driven flows

## CL1 — Create lesson from calendar (basic)

* create lesson by clicking on a time slot in the calendar

Checks:

* correct startAt date and time
* correct default duration (if any)
* lesson is created successfully
* appears immediately in calendar view
* no duplicate entries

---

## CL2 — Create lesson + assign student

Test both variants of the calendar creation flow.

### Scenario A — existing student

* create lesson from calendar
* assign an existing student during creation

Checks:

* student correctly linked to lesson
* lesson appears in student detail page
* no orphan lesson without participant (if not allowed)

### Scenario B — new student created inside the calendar flow

* create lesson from calendar
* create a new student directly from the same flow
* assign that newly created student to the lesson

Checks:

* student creation works correctly
* student is persisted before being linked
* lesson ↔ student relation is valid and consistent
* lesson appears correctly in both calendar and student detail page
* no duplicate student created because of retry or double submit
* no broken intermediate state
* no lesson without participant
* no student created without usable linkage if lesson creation fails
* operation is atomic or safely rolled back on failure
* validations are sufficient for both lesson and student data
* UI stays in sync after success or failure


---

## CL3 — Create lesson + assign package

* create lesson from calendar
* assign student
* assign package

Checks:

* correct decrement of package minutes
* stored consumed minutes = actual deduction
* remainingMinutes updated correctly
* student balance not impacted incorrectly

---

## CL4 — Create lesson with insufficient package minutes

* package has less minutes than lesson duration
* create lesson from calendar with package assigned

Expected:

* reject OR partial consumption logic (if supported)
* never allow negative remainingMinutes

---

## CL5 — Create lesson with expired package

* assign expired package during calendar creation

Expected:

* rejected OR explicit warning
* must not silently consume expired package

---

## CL6 — Modify lesson created from calendar

* create lesson from calendar
* edit duration or time

Checks:

* package consumption updated OR prevented
* no inconsistency in remainingMinutes

---

## CL7 — Delete lesson created from calendar

* create lesson with package assigned
* delete lesson

Checks:

* restore consumed minutes exactly
* no data inconsistency

---

## CL8 — Drag & drop lesson (calendar interaction)

* move lesson to another time slot

Checks:

* startAt updated correctly
* no duplicate lesson created
* related data remains consistent

---

## CL9 — Rapid multiple creations

* create multiple lessons quickly from calendar

Checks:

* no duplicate or ghost lessons
* no race condition
* UI stays in sync with backend

---

## CL10 — Cancel lesson from calendar

* cancel lesson directly from calendar UI

Checks:

* status updated correctly
* package minutes restored if applicable
* lesson no longer treated as active

---

## CL11 — Concurrent edits from calendar

* user A edits lesson
* user B edits same lesson

Checks:

* no silent overwrite
* final state consistent
* potential conflict handling

---

## CL12 — Network interruption during creation

* create lesson from calendar
* simulate network failure during request

Checks:

* no partial lesson creation
* no double creation on retry
* state consistent after reload

---

# Packages

## P1 — Create valid package

* create package with valid duration (e.g. 10 hours)

Checks:

* totalMinutes correct
* remainingMinutes initialized correctly
* status = ACTIVE
* expiresAt handled correctly
* linked charge (if applicable) created correctly

---

## P2 — Create package with past expiration

* expiresAt < current date

Expected:

* either rejected OR
* created with EXPIRED status

Must not:

* create ACTIVE usable package in the past

---

## P3 — Invalid package values

Test:

* 0 minutes
* negative values
* float values
* extremely large values

Expected:

* backend validation rejects invalid input
* no DB crash

---

## P4 — Modify active package

* reduce totalMinutes below already consumed

Checks:

* reject OR adjust safely
* remainingMinutes stays consistent

---

## P5 — Modify expired or canceled package

* update fields on EXPIRED/CANCELED package

Checks:

* status must not revert to ACTIVE unintentionally
* some fields may be locked

---

## P6 — Cancel package

* cancel package with existing consumption

Checks:

* no further consumption allowed
* history preserved
* no data corruption

---

# Package Assignment

## A1 — Normal assignment

* assign package to lesson

Checks:

* correct decrement of remainingMinutes
* stored consumed minutes = actual deduction

---

## A2 — Double assignment

* assign same package twice

Expected:

* handled error (no crash)
* clear business error message

---

## A3 — Expired package usage

* assign expired package

Expected:

* rejected OR explicitly handled
* never silently accepted

---

## A4 — Not enough minutes

* package has less minutes than lesson duration

Expected:

* reject OR partial logic (if supported)
* never allow negative remainingMinutes

---

## A5 — Concurrent assignment

* simulate 2 simultaneous assignments

Checks:

* atomic update
* no double-consumption
* race condition handled

---

## A6 — Remove assignment

* remove package from lesson

Checks:

* restore exact consumed minutes
* no creation of extra minutes

---

## A7 — Change lesson duration after assignment

* modify lesson duration

Checks:

* consumption updated OR prevented
* no inconsistency

---

# Lessons

## L1 — Create valid lesson

Checks:

* duration is integer and positive
* valid date
* correct associations

---

## L2 — Invalid duration

Test:

* 0
* negative
* float
* string

Expected:

* rejected before DB layer

---

## L3 — Lesson in the past

Checks:

* allowed or restricted depending on business rules
* status consistent

---

## L4 — Cancel lesson

Checks:

* package minutes restored if consumed
* lesson status updated

---

## L5 — Delete lesson

Checks:

* prevent deletion if linked OR handle cascade safely
* restore state properly

---

## L6 — Multiple participants

Checks:

* correct deduction per participant
* no cross-contamination of data

---

# Charges

## C1 — Create valid charge

Checks:

* amount > 0
* correct initialization

---

## C2 — Invalid amounts

Test:

* 0
* negative
* inconsistent decimals

Expected:

* rejected

---

## C3 — Charge linked to package

Checks:

* package + charge creation must be transactional

---

## C4 — Overdue charge

Checks:

* dueDate < now updates status OR computed consistently

---

## C5 — Modify charge after payment

Checks:

* remainingAmount recalculated correctly
* status remains consistent

---

# Payments

## PY1 — Valid payment

Checks:

* charge updated
* status transitions correctly

---

## PY2 — Partial payment

Checks:

* remainingAmount correct
* status = PARTIALLY_PAID

---

## PY3 — Overpayment

Checks:

* rejected OR explicitly handled

---

## PY4 — Double submission

Checks:

* idempotency OR duplicate prevention

---

## PY5 — Payment on canceled charge

Checks:

* rejected

---

## PY6 — Delete payment

Checks:

* charge recalculated correctly
* no inconsistency

---

# Student Summary

## S1 — Balance correctness

Checks:

* outstanding balance correct across all charges
* expired packages excluded from usable minutes

---

## S2 — Student status

Test:

* no debt → healthy
* partial → warning
* overdue → overdue

Checks:

* consistent and deterministic

---

## S3 — Data deletion

Checks:

* soft delete preferred
* history preserved

---

# Concurrency & Robustness

## R1 — Network failure

Checks:

* no partial writes
* retry safe

---

## R2 — Refresh during action

Checks:

* no duplicate operations

---

## R3 — Multiple users

Checks:

* no conflicting updates
* consistent final state

---

# Review Instructions (for AI or developers)

When reviewing business logic:

1. Check invariants first
2. Identify missing validations
3. Check transaction boundaries
4. Identify race conditions
5. Detect silent data corruption risks
6. Classify issues:

   * 🔴 Critical (data corruption / financial impact)
   * 🟡 Medium (logic inconsistency)
   * 🟢 Minor (UX / edge case)

---

# End of document
