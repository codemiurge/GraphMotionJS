export type Node = {
    id: string,
    label: string,

    x: number,
    y: number,
    
    vx: number,
    vy: number,
}

export type Edge = {
    from: string,
    to: string,
};