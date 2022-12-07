export enum StepType {
    individual = "individual",
    joint = "joint"
}

export enum StepStatus {
    default = "default",
    complete = "complete",
}

export interface Step {
    id: number,
    type: StepType,
    status: StepStatus,    
}

export const LiveSteps: Step[] = [
    {
        id: 1,
        type: StepType.individual,
        status: StepStatus.default
    },
    {
        id: 2,
        type: StepType.individual,
        status: StepStatus.default
    },
    {
        id: 3,
        type: StepType.individual,
        status: StepStatus.default
    },
    {
        id: 4,
        type: StepType.individual,
        status: StepStatus.default
    },
    {
        id: 5,
        type: StepType.individual,
        status: StepStatus.default
    },
    {
        id: 6,
        type: StepType.joint,
        status: StepStatus.default,
    },
    {
        id: 7,
        type: StepType.joint,
        status: StepStatus.default
    },
    {
        id: 8,
        type: StepType.joint,
        status: StepStatus.default
    },
    {
        id: 9,
        type: StepType.joint,
        status: StepStatus.default
    }                                
]

export const DemoSteps: Step[] = [
    {
        id: 1,
        type: StepType.individual,
        status: StepStatus.default
    }
]