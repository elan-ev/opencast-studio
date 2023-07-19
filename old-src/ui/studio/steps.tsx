//; -*- mode: rjsx;-*-
/** @jsx jsx */

import React, { Dispatch, SetStateAction } from "react";

type Props = {
  activeStep: number;
  setActiveStep: Dispatch<SetStateAction<number>>;
  steps: ((props: StepProps) => JSX.Element)[];
};

export type StepProps = {
  nextStep: () => void;
  previousStep: () => void;
  firstStep: () => void;
};

const Steps: React.FC<Props> = ({ activeStep, setActiveStep, steps }) => {
  return steps[activeStep]({
    nextStep: () => setActiveStep(old => old + 1),
    previousStep: () => setActiveStep(old => old - 1),
    firstStep: () => setActiveStep(0),
  });
};

export default Steps;
