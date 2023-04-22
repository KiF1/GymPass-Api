export class MaxOfCheckInsError extends Error {
  constructor(){
    super('Max number of check-ins reached')
  }
}