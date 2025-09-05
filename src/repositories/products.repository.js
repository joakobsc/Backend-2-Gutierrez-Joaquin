export class ProductsRepository {
  get(opts) {
    throw new Error("not implemented");
  }
  getById(id) {
    throw new Error("not implemented");
  }
  getByTitle(title) {
    throw new Error("not implemented");
  }
  create(data) {
    throw new Error("not implemented");
  }
  update(id, data) {
    throw new Error("not implemented");
  }
  delete(id) {
    throw new Error("not implemented");
  }
}

export class ProductsRepositoryMongo extends ProductsRepository {
  constructor(dao) {
    super();
    this.dao = dao;
  }
  get(opts) {
    return this.dao.get(opts);
  }
  getById(id) {
    return this.dao.getById(id);
  }
  getByTitle(title) {
    return this.dao.getByTitle(title);
  }
  create(data) {
    return this.dao.create(data);
  }
  update(id, data) {
    return this.dao.update(id, data);
  }
  delete(id) {
    return this.dao.delete(id);
  }
}
