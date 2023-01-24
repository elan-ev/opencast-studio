//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import React from 'react';

export default function Steps({ activeStep, updateActiveStep, ...props }) {
  const childProps = {
    currentStep: activeStep + 1,
    totalSteps: props.children?.length || 0,
    nextStep,
    previousStep,
    goToStep,
    firstStep,
    lastStep
  };

  const childrenWithProps = React.Children.map(props.children, (child, i) => {
    childProps.isActive = i === activeStep;

    return childProps.isActive
      ? isReactComponent(child)
        ? React.cloneElement(child, childProps)
        : child
      : null;
  });

  return <React.Fragment>{childrenWithProps}</React.Fragment>;

  function firstStep() {
    goToStep(1);
  }

  function lastStep() {
    goToStep(props.children.length);
  }

  function nextStep() {
    setActiveStep(activeStep + 1);
  }

  function previousStep() {
    setActiveStep(activeStep - 1);
  }

  function goToStep(step) {
    setActiveStep(step - 1);
  }

  function setActiveStep(next) {
    if (activeStep === next) {
      return;
    }
    if (isInvalidStep(next, props.children)) {
      console.error(`${next + 1} is an invalid step`);
      return;
    }

    updateActiveStep(next);
  }
}

function isInvalidStep(next, children) {
  return next < 0 || next >= children.length;
}

function isReactComponent({ type }) {
  return typeof type === 'function' || typeof type === 'object';
}
