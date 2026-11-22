// Usuarios registrados con su rol y número de órdenes.
export default function UsersTab({ users, orders }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <caption className="visually-hidden">Usuarios registrados</caption>
        <thead>
          <tr>
            <th scope="col">Nombre</th>
            <th scope="col">Correo</th>
            <th scope="col">Rol</th>
            <th scope="col">Órdenes</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{orders.filter((o) => o.userId === u.id).length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
