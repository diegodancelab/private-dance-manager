import { createStudent } from "../actions";

export default function NewStudentPage() {
  return (
    <div>
      <h1>Create student</h1>

      <form action={createStudent}>
        <div>
          <label htmlFor="firstName">First name</label>
          <input id="firstName" name="firstName" type="text" required />
        </div>

        <div>
          <label htmlFor="lastName">Last name</label>
          <input id="lastName" name="lastName" type="text" required />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" />
        </div>

        <div>
          <label htmlFor="phone">Phone</label>
          <input id="phone" name="phone" type="text" />
        </div>

        <p>At least one contact method is required: email or phone.</p>

        <button type="submit">Create student</button>
      </form>
    </div>
  );
}