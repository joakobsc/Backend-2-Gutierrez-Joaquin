export class CartsRepository {
  getAll() {
    throw new Error("not implemented");
  }
  getById(cid) {
    throw new Error("not implemented");
  }
  create(userId) {
    throw new Error("not implemented");
  }
  addProduct(cid, pid, qty) {
    throw new Error("not implemented");
  }
  removeProduct(cid, pid) {
    throw new Error("not implemented");
  }
  setProducts(cid, arr) {
    throw new Error("not implemented");
  }
  clear(cid) {
    throw new Error("not implemented");
  }
}

export class CartsRepositoryMongo extends CartsRepository {
  constructor(dao) {
    super();
    this.dao = dao;
  }
  getAll() {
    return this.dao.getAll();
  }
  getById(cid) {
    return this.dao.getById(cid);
  }
  create(userId) {
    return this.dao.create(userId);
  }
  addProduct(cid, pid, qty) {
    return this.dao.addProduct(cid, pid, qty);
  }
  removeProduct(cid, pid) {
    return this.dao.removeProduct(cid, pid);
  }
  setProducts(cid, arr) {
    return this.dao.setProducts(cid, arr);
  }
  clear(cid) {
    return this.dao.clear(cid);
  }
}
