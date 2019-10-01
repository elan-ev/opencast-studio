//; -*- mode: rjsx;-*-
import React from 'react';
import styled from 'styled-components/macro';

class Clock extends React.Component {
  constructor(props) {
    super(props);
    this.state = { time: 0, last: null };
  }

  componentWillUnmount() {
    this.stopTimer();
  }

  startTimer() {
    this.setState({ time: 0, last: new Date() });
    this.timerID = setInterval(() => this.tick(), 10);
  }

  resumeTimer() {
    if (!this.timerId) {
      this.timerID = setInterval(() => this.tick(), 10);
      this.setState({ last: new Date() });
    }
  }

  stopTimer() {
    clearInterval(this.timerID);
    this.timerId = null;
  }

  componentDidUpdate(prevProps) {
    // recording state did not change
    if (this.props.recordingState === prevProps.recordingState) {
      return;
    }

    if (this.props.recordingState !== 'recording') {
      this.stopTimer();
      return;
    }

    if (prevProps.recordingState === 'inactive') {
      this.startTimer();
    } else if (prevProps.recordingState === 'paused') {
      this.resumeTimer();
    }
  }

  tick() {
    this.setState(state => {
      const now = new Date();
      return {
        time: state.time + (now - state.last),
        last: now
      };
    });
  }

  render() {
    const duration = this.state.time;
    let timeArr = [
      (duration / 3600000) >> 0,
      ((duration / 60000) >> 0) % 60,
      ((duration / 1000) >> 0) % 60
    ];
    if (timeArr[0] === 0) {
      timeArr = timeArr.slice(1);
    }
    const content = timeArr.map(unit => (unit < 10 ? '0' : '') + unit).join(':');

    return <span className={this.props.className}>{content}</span>;
  }
}

const StyledClock = styled(Clock)``;

export default StyledClock;
