export class UserDTO {
  static fromUser(u) {
    return {
      id: String(u._id ?? u.id),
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      role: u.role,
      cartId: u.cartId ? String(u.cartId) : null,
    };
  }
}
