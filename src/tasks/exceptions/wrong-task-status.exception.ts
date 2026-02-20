export class WrongTaskStatusException extends Error {
  constructor() {
    super('Wrong task status transaction!');
    this.name = 'WrongTaskStatusException';
  }
}
