import EventEmitter from 'events';

export const START = Symbol('START');
export const FINISH = Symbol('FINISH');

/**
 * Collects the sequence of events (triggered by trigger()) during the given
 * interval and emits START and FINISH events before and after the sequence.
 */
export class EventsSequence extends EventEmitter {
  active = false;

  _interval = 0;
  _timer = null;

  constructor(interval) {
    super();
    this._interval = interval;
  }

  trigger = () => {
    if (!this.active) {
      this.emit(START);
      this.active = true;
    }
    clearTimeout(this._timer);
    this._timer = setTimeout(this._finish, this._interval);
  };

  _finish = () => {
    this.active = false;
    this.emit(FINISH);
  };
}

export class CombinedEventsSequences extends EventEmitter {
  sources;

  constructor(...sources) {
    super();
    this.sources = sources;
    for (const source of sources) {
      source.on(FINISH, this._srcFinish);
      source.on(START, this._srcStart);
    }
  }

  get active() {
    return this.sources.some((s) => s.active);
  }

  _srcFinish = () => this.active || this.emit(FINISH);
  _srcStart = () => !this.active || this.emit(START);
}
