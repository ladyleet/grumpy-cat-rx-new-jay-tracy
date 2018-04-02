import { ajax } from 'rxjs/observable/dom/ajax';

export function fetchCatFood(food) {
  return ajax.getJSON(`http://localhost:5000/api/catfood?food=${food}`);
}
