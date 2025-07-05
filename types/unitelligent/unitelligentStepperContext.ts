export interface IStepperContext {
  id: string;
}

let stepperContext: IStepperContext[] = [
  {
    id: 'id',
  },
];

export function updateUser(updatedData: Partial<IStepperContext>): void {
  stepperContext = stepperContext.map((stepperChoice) => ({
    ...stepperChoice,
    ...updatedData,
  }));
}
