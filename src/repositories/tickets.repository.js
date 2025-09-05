export class TicketsRepository {
  create(_data) {
    throw new Error("not implemented");
  }
  getByCode(_code) {
    throw new Error("not implemented");
  }
}

export class TicketsRepositoryMongo extends TicketsRepository {
  constructor(model) {
    super();
    this.model = model;
  }
  create(data) {
    return this.model.create(data);
  }
  getByCode(code) {
    return this.model.findOne({ code }).lean();
  }
}
