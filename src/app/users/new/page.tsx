import { createUser } from "../actions";

export default function NewUserPage() {
  return (
    <div>
      <h1>Create user</h1>

      <form action={createUser}>
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

        <div>
          <label htmlFor="role">Role</label>
          <select id="role" name="role" defaultValue="STUDENT">
            <option value="STUDENT">Student</option>
            <option value="TEACHER">Teacher</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <button type="submit">Create user</button>
      </form>
    </div>
  );
}