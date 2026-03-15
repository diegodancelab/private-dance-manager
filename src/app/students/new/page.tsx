import { createStudent } from "../action";

export default function NewUserPage() {
  return (
    <div>
      <h1>Create user</h1>

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
          <input id="email" name="email" type="email" required />
        </div>

        <div>
          <label htmlFor="phone">Phone</label>
          <input id="phone" name="phone" type="text" />
        </div>

        <button type="submit">Create Student</button>
      </form>
    </div>
  );
}