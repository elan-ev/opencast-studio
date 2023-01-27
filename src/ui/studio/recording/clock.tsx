//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';
import { Component } from 'react';

type Props = {
  isPaused: boolean;
};

type State = {
  milliseconds: number;
};

class Clock extends Component<Props, State> {
  #last: Date;
  #timerID: ReturnType<typeof setInterval> | null = null;
  #isMounted = false;

  constructor(props: Props) {
    super(props);
    this.state = { milliseconds: 0 };
    this.#last = new Date();
    this.#timerID = setInterval(() => this.tick(), 100);
  }

  componentDidMount() {
    this.#isMounted = true;
  }

  componentWillUnmount() {
    this.stopTimer();
    this.#isMounted = false;
  }

  resumeTimer() {
    if (!this.#timerID) {
      this.#timerID = setInterval(() => this.tick(), 100);
      this.#last = new Date();
    }
  }

  stopTimer() {
    if (this.#timerID != null) {
      clearInterval(this.#timerID);
      this.#timerID = null;
    }
  }

  componentDidUpdate(prevProps: Props) {
    // recording state did not change
    if (this.props.isPaused === prevProps.isPaused) {
      return;
    }

    if (this.props.isPaused) {
      this.stopTimer();
    } else {
      this.resumeTimer();
    }
  }

  tick() {
    if (this.#isMounted) {
      const now = new Date();
      const passed = now.valueOf() - this.#last.valueOf();
      this.#last = now;
      this.setState(state => ({
        milliseconds: state.milliseconds + passed,
      }));
    }
  }

  render() {
    const duration = this.state.milliseconds;
    let timeArr = [
      (duration / 3600000) >> 0,
      ((duration / 60000) >> 0) % 60,
      ((duration / 1000) >> 0) % 60
    ];
    if (timeArr[0] === 0) {
      timeArr = timeArr.slice(1);
    }
    const content = timeArr.map(unit => (unit < 10 ? '0' : '') + unit).join(':');

    return <span sx={{ fontSize: 3 }}>{content}</span>;
  }
}

export default Clock;
