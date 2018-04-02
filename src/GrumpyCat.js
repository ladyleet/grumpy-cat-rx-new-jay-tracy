import React, { Component } from 'react';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { merge } from 'rxjs/observable/merge';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { filter, mergeMap, switchMap, tap, takeUntil, map, scan } from 'rxjs/operators';
import { stream } from './utils/stream';
import { fetchCatFood } from './utils/http';
import grumpycatno from './img/grumpycatno.png';
import bowl from './img/bowl.png';
import donut from './img/donut.png';
import fries from './img/fries.png';
import goldfish from './img/goldfish.png';
import hamburger from './img/hamburger.png';
import pizza from './img/pizza.png';
import taco from './img/taco.png';
import hotdog from './img/hotdog.png';
import scoreboard from './img/scoreboard.png';

export class GrumpyCat extends Component {
  state = {
    searchValue: null
  };

  food$ = new Subject();
  result$ = this.food$.pipe(
    switchMap(food => fetchCatFood(food))
  );

  hasBeenFedToGrumpyCat(x, y) {
    return x > 0 && x < 700 && y > 400 && y < 700
  }

  mouseDown$ = fromEvent(document, 'mousedown');
  mouseMove$ = fromEvent(document, 'mousemove');
  mouseUp$ = fromEvent(document, 'mouseup');
  increment$ = new Subject();

  counterCat$ = merge(
    this.increment$.pipe(
      filter(({ clientX, clientY }) => this.hasBeenFedToGrumpyCat(clientX, clientY)),
      filter((e) => e.target.matches('.🐟, .🌭, .🍔')),
    ),
    this.result$.pipe(
      filter(foods => foods.includes('pizza emoji'))
    )
  ).pipe(
    scan(count => count + 1, 0)
  );

  counterYou$ = this.increment$.pipe(
    filter(({ clientX, clientY }) => this.hasBeenFedToGrumpyCat(clientX, clientY)),
    filter(e => e.target.matches('.🍟, .🍕, .🍩, .🌮')),
    scan(count => count + 1, 0)
  );

  targetMouseDown$ = this.mouseDown$.pipe(
    filter((e) => e.target.matches('.🍽'))
  )

  mouseDrag$ = this.targetMouseDown$.pipe(
    mergeMap(({ target: draggable, offsetX: startX, offsetY: startY }) =>
      this.mouseMove$.pipe(
        tap((mouseMoveEvent) => {
          mouseMoveEvent.preventDefault()
        }),
        map((mouseMoveEvent) => ({
          left: mouseMoveEvent.clientX - startX,
          top: mouseMoveEvent.clientY - startY,
          draggable
        })),
        takeUntil(this.mouseUp$.pipe(
          tap(this.increment$)
        ))
      )
    )
  );

  didChangeSearchValue = (event) => {
    this.setState({
      searchValue: event.target.value
    });
  };

  didSubmitSearch = () => {
    if (this.state.searchValue) {
      this.food$.next(this.state.searchValue);
    }
  };

  componentDidMount() {
    this.subscription = this.mouseDrag$.subscribe(({ top, left, draggable }) => {
      draggable.style.top = top + 'px';
      draggable.style.left = left + 'px';
    });
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render() {
    return (
      <div>
        <div className="text-white text-center">
          <h1>
            THE GRUMPY CAT GAME
          </h1>
        </div>
        <div className="text-center">
          <input onChange={this.didChangeSearchValue} /> <button onClick={this.didSubmitSearch} disabled={!this.state.searchValue}>submit</button>
          <h1 style={{ color: 'white' }}>hey you like {stream(this.result$)} eh?</h1>
        </div>
        <div>
          <img className="😸" src={grumpycatno} alt="grumpy cat" />
        </div>
        <div>
          <img className="🥣" src={bowl} alt="cat bowl" />
        </div>
        <div>
          <img className="🍩 🍽" src={donut} alt="donut" />
          <img className="🍟 🍽" src={fries} alt="fries" />
          <img className="🐟 🍽" src={goldfish} alt="goldfish" />
          <img className="🍔 🍽" src={hamburger} alt="hamburger" />
          <img className="🍕 🍽" src={pizza} alt="pizz" />
          <img className="🌮 🍽" src={taco} alt="taco" />
          <img className="🌭 🍽" src={hotdog} alt="hotdog" />
        </div>
        <div className="scoreboard-styling">
          <img src={scoreboard} alt="score board" />
        </div>
        <div className="counter-cat">{stream(this.counterCat$)}</div>
        <div className="counter-you">{stream(this.counterYou$)}</div>
      </div>
    );
  }
}
